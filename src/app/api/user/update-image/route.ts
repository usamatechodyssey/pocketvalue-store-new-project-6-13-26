// src/app/api/user/update-image/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
// ✅ REMOVED: import { v2 as cloudinary } from 'cloudinary';
// ✅ REMOVED: import { Readable } from 'stream';

// ✅ NEW: Media Adapter
import { getMediaAdapter } from '@/lib/adapters/media/factory';
import connectMongoose from '@/app/shared/lib/checkout/mongoose';
import User from '@/models/User';

// Helper function to convert Blob to Buffer
const blobToBuffer = async (blob: Blob): Promise<Buffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Not Authenticated' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // ✅ FIX: MIME Type Validation (Security)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file format. Only JPEG, PNG, and WEBP images are allowed.' },
        { status: 400 }
      );
    }

    // ✅ FIX: File Size Validation
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB.' },
        { status: 400 }
      );
    }

    const buffer = await blobToBuffer(file);

    // ================================================================
    // ✅ ENTERPRISE FIX: Adapter-based upload (Cloudinary removed)
    // ================================================================
    const mediaAdapter = await getMediaAdapter();
    
    const uploadResult = await mediaAdapter.upload(buffer, {
      folder: 'profiles', // ✅ User profile images ka alag folder
      metadata: { mimeType: file.type },
    });

    const imageUrl = uploadResult.url;
    if (!imageUrl) {
      throw new Error('Image URL not returned from adapter.');
    }

    // --- YAHAN BEHTARI KI GAYI HAI ---
    
    // 1. Mongoose se connect karein
    await connectMongoose();

    // 2. Mongoose ke zariye user dhoondein
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found in database' }, { status: 404 });
    }

    // 3. User ki image update karein aur save karein
    user.image = imageUrl;
    await user.save();
    
    console.log(`✅ Image updated for user: ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully!',
      imageUrl,
    });

  } catch (error) {
    console.error('❌ Upload Error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed due to a server error.' }, { status: 500 });
  }
};