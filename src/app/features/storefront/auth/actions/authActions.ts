// /src/app/features/storefront/auth/actions/authActions.ts 

"use server";

import crypto from 'crypto';
import bcrypt from "bcryptjs";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
import { 
  RequestPasswordResetSchema, 
  ResetPasswordSchema, 
  VerifyEmailSchema,
  UpdatePhoneSchema 
} from "@/app/shared/lib/zodSchemas";

// ✅ FIX: Import factory functions instead of nodemailer
import { 
  sendPasswordResetEmail, 
  sendVerificationOtpEmail, 
  sendWelcomeEmail 
} from "@/lib/adapters/communication";

import { auth } from '@/app/auth';

// === requestPasswordReset (Updated) ===
export async function requestPasswordReset(email: string) {
    const validatedFields = RequestPasswordResetSchema.safeParse({ email });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { email: validatedEmail } = validatedFields.data;

    try {
        await connectMongoose();
        const user = await User.findOne({ email: validatedEmail });

        if (!user) {
            return { success: true, message: "If an account with that email exists, a reset link has been sent." };
        }
        
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
        
        // ✅ FIX: Send email using the factory
        try {
            await sendPasswordResetEmail({
                to: user.email,
                name: user.name,
                resetLink: resetUrl,
            });
        } catch (emailError) {
            console.error("CRITICAL: FAILED to send password reset email:", emailError);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            return { success: false, message: "Could not send the reset email." };
        }

        return { success: true, message: "If an account with that email exists, a reset link has been sent." };

    } catch (error) {
        console.error("CRITICAL ERROR in requestPasswordReset function:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === resetPassword (No changes) ===
export async function resetPassword(token: string, newPassword: string) {
    const validatedFields = ResetPasswordSchema.safeParse({ token, newPassword });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { token: validatedToken, newPassword: validatedPassword } = validatedFields.data;

    try {
        const hashedToken = crypto.createHash("sha256").update(validatedToken).digest("hex");
        await connectMongoose();
        
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        });
        
        if (!user) { 
            return { success: false, message: "This token is invalid or has expired." }; 
        }
        
        user.password = await bcrypt.hash(validatedPassword, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        
        await user.save();
        
        return { success: true, message: "Your password has been reset successfully!" };
    } catch (error) {
        console.error("Reset Password Error:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === getEmailFromToken (No changes) ===
export async function getEmailFromToken(token: string): Promise<string | null> {
    if (!token) return null;
    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        await connectMongoose();
        
        const user = await User.findOne({ passwordResetToken: hashedToken })
            .select("email")
            .lean<{ email: string }>();

        return user ? user.email : null;
    } catch {
        return null;
    }
}

// === verifyUserEmail (No changes) ===
export async function verifyUserEmail(email: string, otp: string) {
    const validatedFields = VerifyEmailSchema.safeParse({ email, otp });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { email: validatedEmail, otp: validatedOtp } = validatedFields.data;

    try {
        await connectMongoose();
        const user = await User.findOne({ 
            email: validatedEmail,
            verificationOtp: validatedOtp,
            verificationOtpExpires: { $gt: new Date() }
        });
        if (!user) {
            return { success: false, message: "The OTP is invalid or has expired." };
        }
        user.emailVerified = new Date();
        user.verificationOtp = undefined;
        user.verificationOtpExpires = undefined;
        await user.save();
        
        // ✅ FIX: Send welcome email using factory
        await sendWelcomeEmail({
            to: user.email,
            customerName: user.name,
        });
        
        return { success: true, message: "Email verified successfully! Welcome aboard." };
    } catch (error) {
        console.error("Email Verification Error:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === updateUserPhone (No changes) ===
export async function updateUserPhone(phone: string): Promise<{ success: boolean; message: string; }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, message: "Please log in to verify your phone number." };
    }

    const validatedFields = UpdatePhoneSchema.safeParse({ email: session.user.email, phone });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { email: verifiedEmail, phone: validatedPhone } = validatedFields.data;

    try {
        await connectMongoose();

        const existingPhoneUser = await User.findOne({ phone: validatedPhone, phoneVerified: { $ne: null } });
        if (existingPhoneUser && existingPhoneUser.email !== verifiedEmail) {
            return { success: false, message: "This phone number is already associated with another account." };
        }

        const user = await User.findOne({ email: verifiedEmail });
        if (!user) {
            return { success: false, message: "Could not find a user session to update." };
        }

        user.phone = validatedPhone;
        user.phoneVerified = new Date();
        await user.save();

        return { success: true, message: "Phone number verified successfully!" };
    } catch (error) {
        console.error("Update User Phone Error:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === checkPhoneVerificationStatus (No changes) ===
export async function checkPhoneVerificationStatus(phoneToCheck: string): Promise<boolean> {
    try {
        const session = await auth();
        if (!session?.user?.email) return false;

        await connectMongoose();
        const user = await User.findOne({ email: session.user.email });
        
        if (!user || !user.phone || !user.phoneVerified) {
            return false;
        }

        const dbPhone = user.phone.replace(/\D/g, '');
        const inputPhone = phoneToCheck.replace(/\D/g, '');

        return dbPhone.slice(-10) === inputPhone.slice(-10);

    } catch (error) {
        console.error("Error checking phone status:", error);
        return false;
    }
}

// === resendVerificationEmail (Updated) ===
export async function resendVerificationEmail(email: string) {
    const validatedFields = RequestPasswordResetSchema.safeParse({ email });
    if (!validatedFields.success) {
        return { success: false, message: validatedFields.error.issues[0].message };
    }
    const { email: validatedEmail } = validatedFields.data;
    
    try {
        await connectMongoose();
        const user = await User.findOne({ email: validatedEmail });
        if (!user) return { success: false, message: "Could not find a user with that email." };
        if (user.emailVerified) return { success: false, message: "This email is already verified." };

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationOtp = newOtp;
        user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // ✅ FIX: Send email using the factory
        try {
            await sendVerificationOtpEmail({
                to: validatedEmail,
                customerName: user.name,
                otp: newOtp,
            });
            return { success: true, message: "A new verification code has been sent to your email." };
        } catch (emailError) {
            console.error(`Failed to resend OTP to ${validatedEmail}:`, emailError);
            return { success: false, message: "Could not send a new verification email." };
        }
    } catch (error) {
        console.error("Resend OTP Error:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}