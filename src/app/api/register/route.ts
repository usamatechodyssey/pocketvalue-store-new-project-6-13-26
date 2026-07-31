// // /src/app/api/auth/register/route.ts (UPGRADED WITH COMMUNICATION FACTORY)

// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// // ✅ FIX: Import factory function instead of nodemailer
// import { sendVerificationOtpEmail } from '@/lib/adapters/communication';
// import connectMongoose from '@/app/shared/lib/checkout/mongoose';
// import User from '@/models/User';
// import { RegisterSchema } from '@/app/shared/lib/zodSchemas';

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();

//         const validation = RegisterSchema.safeParse(body);
//         if (!validation.success) {
//             return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
//         }
//         const { name, email, password } = validation.data;
        
//         await connectMongoose();
        
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

//         const newUser = new User({
//             name,
//             email,
//             password: hashedPassword,
//             phone: null,
//             phoneVerified: null,
//             emailVerified: null,
//             verificationOtp: otp,
//             verificationOtpExpires: otpExpires,
//         });

//         await newUser.save();

//         // ✅ FIX: Send verification email using factory
//         try {
//             await sendVerificationOtpEmail({
//                 to: email,
//                 customerName: name,
//                 otp: otp,
//             });
//         } catch (emailError) {
//             console.error(`CRITICAL: User ${email} created, but failed to send OTP:`, emailError);
//             await User.deleteOne({ email }); 
//             return NextResponse.json({ message: 'Could not send verification email. Please try again.' }, { status: 500 });
//         }
        
//         return NextResponse.json({ message: 'Account created! A verification code has been sent to your email.' }, { status: 201 });

//     } catch (error) {
//         console.error("Registration API Error: ", error);
//         return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
//     }
// }
// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers'; // ✅ Dynamic context imports
import bcrypt from 'bcryptjs';
// ✅ Import factory function instead of nodemailer (as configured)
import { sendVerificationOtpEmail } from '@/lib/adapters/communication';
import connectMongoose from '@/app/shared/lib/checkout/mongoose';
import User from '@/models/User';
import Referral from '@/models/Referral'; // ✅ Import our new Referral model
import { RegisterSchema } from '@/app/shared/lib/zodSchemas';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Zod secure validation
        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: validation.error.issues[0].message }, { status: 400 });
        }
        const { name, email, password } = validation.data;
        
        await connectMongoose();
        
        // 2. Email duplicates verification
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
        }

        // 3. Password encryption & OTP setup
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // =================================================================
        // 🚀 NEW: SERVER-SIDE REFERRAL CODE ATTRIBUTION
        // =================================================================
        const cookieStore = await cookies();
        const refCode = cookieStore.get("ref_code")?.value;
        let referrerUser = null;

        if (refCode) {
            // Find referrer user on Cluster A
            referrerUser = await User.findOne({ referralCode: refCode });

            // 🛡️ CRITICAL SECURITY CHECK: Self-Referral Prevention
            // Silently bypass attribution if the referrer tries to refer their own email
            if (referrerUser && referrerUser.email.toLowerCase() === email.toLowerCase()) {
                console.warn(`[Anti-Fraud Guard] Self-referral bypassed for email: ${email}`);
                referrerUser = null; 
            }
        }

        // 4. Initialize new user schema
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone: null,
            phoneVerified: null,
            emailVerified: null,
            verificationOtp: otp,
            verificationOtpExpires: otpExpires,
            referredBy: referrerUser ? referrerUser._id : null, // ✅ Set referredBy ID
        });

        await newUser.save();

        // =================================================================
        // 🚀 NEW: PENDING REFERRAL TRANSACTION LOGGERS (GRACEFUL WRAPPER)
        // =================================================================
        if (referrerUser && refCode) {
            try {
                const headerList = await headers();
                const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
                const userAgent = headerList.get("user-agent") || "Unknown Device";

                // Save a pending transaction in Cluster A
                await Referral.create({
                    referrerId: referrerUser._id,
                    referredUserId: newUser._id,
                    referralCode: refCode,
                    status: "pending",
                    commissionAmount: 0,
                    meta: { ip, userAgent },
                });

                console.log(`📡 [Referral Linked] User ${newUser.email} linked to Referrer: ${referrerUser.email}`);
            } catch (referralError) {
                // High Availability check: Do not block main registration if referral log fails
                console.error("⚠️ REFERRAL ERROR: Failed to create pending referral log:", referralError);
            }
        }
        // =================================================================

        // 5. Verification OTP dispatch
        try {
            await sendVerificationOtpEmail({
                to: email,
                customerName: name,
                otp: otp,
            });
        } catch (emailError) {
            console.error(`CRITICAL: User ${email} created, but failed to send OTP:`, emailError);
            
            // Cleanup database to avoid stale, unverified account locks
            await User.deleteOne({ email }); 
            
            // Also cleanup pending referral logs if user is deleted
            if (referrerUser) {
                await Referral.deleteOne({ referredUserId: newUser._id });
            }

            return NextResponse.json({ message: 'Could not send verification email. Please try again.' }, { status: 500 });
        }
        
        return NextResponse.json({ message: 'Account created! A verification code has been sent to your email.' }, { status: 201 });

    } catch (error) {
        console.error("Registration API Error: ", error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}