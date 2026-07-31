
// src/app/auth.ts (FULLY COMPILED & TYPE-SAFE UPDATED BLUEPRINT WITH REFERRALS)

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import { cookies } from "next/headers";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User, { IUser } from "@/models/User";
import Referral from "@/models/Referral"; // ✅ Import our new Referral model
import UserEvent from "@/models/UserEvent";
import UserSession from "@/models/UserSession"; 
import AbandonedCart from "@/models/AbandonedCart";

type LeanUser = Omit<IUser, keyof Document | '_v'> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

async function getFullUser(email: string): Promise<LeanUser | null> {
    await connectMongoose();
    return User.findOne({ email }).lean<LeanUser>();
}

const isProduction = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },

  trustHost: true,
  useSecureCookies: isProduction,

  cookies: {
    sessionToken: {
      name: isProduction ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: isProduction ? '.pocketvalue.pk' : undefined, 
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
            const userDoc = await getFullUser(email as string);
            
            if (!userDoc) return null;
            if (!userDoc.password) return null;
            if (!userDoc.emailVerified) throw new Error("EmailNotVerified");
            
            const passwordsMatch = await bcrypt.compare(password as string, userDoc.password);
            if (passwordsMatch) {
              const isNewUser = userDoc.createdAt && (Date.now() - new Date(userDoc.createdAt).getTime() < 15 * 60 * 1000);
              const cohort = isNewUser ? 'new_user' : 'returning_user';

              return { 
                id: userDoc._id.toString(), 
                name: userDoc.name, 
                email: userDoc.email, 
                image: userDoc.image, 
                role: userDoc.role,
                phone: userDoc.phone,
                phoneVerified: userDoc.phoneVerified,
                cohort: cohort
              } as any;
            }
        } catch (error) { 
            if (error instanceof Error) throw error;
            return null; 
        }
        return null;
      },
    }),
  ],
  
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login", error: '/login' },

  callbacks: {
    async signIn({ user, account }) {
        let cohortStatus: 'new_user' | 'returning_user' = 'returning_user';

        if (account?.provider === 'google' || account?.provider === 'facebook') {
            const { name, email, image } = user;
            if (!email) return false;
            
            try {
                await connectMongoose();
                const existingUser = await User.findOne({ email });

                const cookieStore = await cookies();
                const refCode = cookieStore.get("ref_code")?.value;

                if (existingUser) {
                    if (image && existingUser.image !== image) {
                       existingUser.image = image;
                       await existingUser.save();
                    }
                    user.id = existingUser._id.toString();
                    user.role = existingUser.role;
                    user.phone = existingUser.phone;
                    user.phoneVerified = existingUser.phoneVerified;
                    
                    cohortStatus = 'returning_user';
                } else {
                    // =================================================================
                    // 🚀 NEW: SOCIAL REGISTRATION ATTRIBUTION & REFERRAL VALIDATION
                    // =================================================================
                    let referrerUser = null;
                    if (refCode) {
                        referrerUser = await User.findOne({ referralCode: refCode });
                        
                        // 🛡️ CRITICAL SECURITY CHECK: Self-Referral Prevention
                        if (referrerUser && referrerUser.email.toLowerCase() === email.toLowerCase()) {
                            console.warn(`[Anti-Fraud OAuth] Self-referral bypassed for email: ${email}`);
                            referrerUser = null;
                        }
                    }

                    const newUser = new User({ 
                        name, 
                        email, 
                        image, 
                        emailVerified: new Date(), 
                        role: 'customer',
                        phone: null,
                        phoneVerified: null,
                        referredBy: referrerUser ? referrerUser._id : null // ✅ Map referredBy
                    });
                    const savedUser = await newUser.save();
                    user.id = savedUser._id.toString();
                    user.role = savedUser.role;
                    user.phone = null;
                    user.phoneVerified = null;
                    
                    cohortStatus = 'new_user';

                    // Save a pending transaction in Cluster A (OAuth track)
                    if (referrerUser && refCode) {
                        try {
                            await Referral.create({
                                referrerId: referrerUser._id,
                                referredUserId: savedUser._id,
                                referralCode: refCode,
                                status: "pending",
                                commissionAmount: 0,
                                meta: { ip: "127.0.0.1", userAgent: "OAuth Redirect" },
                            });
                            console.log(`📡 [OAuth Referral Linked] User ${savedUser.email} linked to Referrer: ${referrerUser.email}`);
                        } catch (referralError) {
                            console.error("⚠️ REFERRAL ERROR (OAuth): Failed to create pending referral log:", referralError);
                        }
                    }
                    // =================================================================
                }
                
                (user as any).cohort = cohortStatus;

            } catch (error) {
                console.error("Social Sign In DB Error:", error);
                return false;
            }
        }

        // =================================================================
        // 🚀 SERVER-SIDE IDENTITY STITCHING & RETROACTIVE MERGING
        // =================================================================
        try {
          const cookieStore = await cookies();
          const visitorId = cookieStore.get("pv_visitor_id")?.value;
          const sessionId = cookieStore.get("pv_session_id")?.value;

          const activeCohort = (user as any).cohort || 'returning_user';

          if (sessionId && visitorId && user.id) {
            await connectMongoose();

            // 1. Audit trace telemetry write
            await UserEvent.create({
              sessionId,
              eventType: 'identity_merge',
              path: '/login',
              metadata: {
                visitorId,
                userId: user.id,
                cohort: activeCohort,
                timestamp: new Date().toISOString()
              }
            });

            // 2. Actual database session claim mapping query
            await UserSession.updateMany(
              { visitorId, userId: { $exists: false } },
              { $set: { userId: user.id } }
            );

            // 3. Re-assign guest abandoned carts under the newly verified email
            await AbandonedCart.findOneAndUpdate(
              { sessionId, userId: { $ne: user.id } },
              { $set: { userId: user.id, email: user.email } }
            );

            console.log(`📡 Identity Stitched & Database Sync Completed for userId ${user.id}`);
          }
        } catch (stitchingError: any) {
          console.error("CRITICAL: Server-side Identity Stitching failed:", stitchingError.message);
        }
        // =================================================================

        return true;
    },
    
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as 'customer' | 'Store Manager' | 'Super Admin' | 'Content Editor';
        token.phone = user.phone;
        token.phoneVerified = user.phoneVerified;
        token.cohort = (user as any).cohort || 'returning_user';
      }

      if (trigger === "update" && session) {
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.phoneVerified !== undefined) token.phoneVerified = session.phoneVerified;
      }

      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'customer' | 'Store Manager' | 'Super Admin' | 'Content Editor';
        session.user.phone = token.phone as string | null;
        session.user.phoneVerified = token.phoneVerified as Date | boolean | null;
        (session.user as any).cohort = token.cohort as 'new_user' | 'returning_user';
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);