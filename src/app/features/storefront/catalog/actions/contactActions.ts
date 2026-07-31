// /src/app/features/storefront/catalog/actions/contactActions.ts (REFACTORED WITH COMMUNICATION FACTORY)

"use server";

// ✅ FIX: Import factory function instead of nodemailer
import { sendCustomAdminEmail } from "@/lib/adapters/communication";
import { z } from "zod";
import { ContactFormSchema } from "@/app/shared/lib/zodSchemas";

type ContactFormData = z.infer<typeof ContactFormSchema>;

export async function sendContactEmail(formData: ContactFormData) {
    const validatedFields = ContactFormSchema.safeParse(formData);
    
    if (!validatedFields.success) {
        return {
            success: false,
            message: validatedFields.error.issues[0].message,
        };
    }
    const { name, email, subject, message } = validatedFields.data;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.error("ADMIN_EMAIL environment variable is not set.");
        return { success: false, message: "Admin email configuration error." };
    }

    // ✅ FIX: Send email using the factory
    try {
        await sendCustomAdminEmail({
            to: adminEmail,
            customerName: name,
            subject: `[Contact Form] New Message from ${name}: ${subject}`,
            message: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });

        return { success: true, message: "Thank you! Your message has been sent successfully." };

    } catch (error) {
        console.error("Email Send Error [Contact Form]:", error);
        return { success: false, message: "Sorry, we couldn't send your message right now." };
    }
}