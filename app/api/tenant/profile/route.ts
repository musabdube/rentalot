import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, validateDataUrlSize } from '@/lib/cloudinary';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Only tenants can access this' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        verificationStatus: true,
        deleteRequested: true,
        deleteRequestedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Only tenants can update their profile' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    
    const updateData: any = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || null,
      bio: formData.get('bio') as string || null,
      address: formData.get('address') as string || null,
      city: formData.get('city') as string || null,
      country: formData.get('country') as string || null,
      postalCode: formData.get('postalCode') as string || null,
    };

    // Handle avatar upload (robustly support different File/Blob/stream shapes)
    const avatarFile: any = formData.get('avatar');
    if (avatarFile) {
      try {
        // If client already sent a URL or data URL string
        if (typeof avatarFile === 'string') {
          updateData.avatar = avatarFile;
        } else {
          let buffer: Buffer | null = null;

          if (typeof avatarFile.arrayBuffer === 'function') {
            const ab = await avatarFile.arrayBuffer();
            buffer = Buffer.from(ab);
          } else if (typeof avatarFile.stream === 'function') {
            const s = avatarFile.stream();
            // Node Readable or async iterable
            if (s && typeof s[Symbol.asyncIterator] === 'function') {
              const chunks: Buffer[] = [];
              for await (const chunk of s) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              }
              buffer = Buffer.concat(chunks);
            } else if (s && typeof (s as any).getReader === 'function') {
              // Web ReadableStream
              const reader = (s as any).getReader();
              const chunks: Buffer[] = [];
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(Buffer.from(value));
              }
              buffer = Buffer.concat(chunks);
            }
          } else if (Buffer.isBuffer(avatarFile)) {
            buffer = Buffer.from(avatarFile);
          } else if ((avatarFile as any).buffer) {
            buffer = Buffer.from((avatarFile as any).buffer);
          }

          if (buffer) {
            const base64 = buffer.toString('base64');
            const mimeType = avatarFile.type || 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64}`;

            // Validate size before attempting upload
            if (!validateDataUrlSize(dataUrl)) {
              return NextResponse.json({ error: 'Avatar exceeds maximum allowed size' }, { status: 400 });
            }

            // Try uploading to Cloudinary; fallback to storing data URL if upload fails
            const uploaded = await uploadToCloudinary(dataUrl);
            if (uploaded) {
              updateData.avatar = uploaded;
            } else {
              updateData.avatar = dataUrl;
            }
          } else {
            console.error('Unsupported avatar file shape:', typeof avatarFile, avatarFile);
          }
        }
      } catch (error) {
        console.error('Error processing avatar:', error);
        // Continue without avatar if there's an error
      }
    }

    // Update user — removed verbose logging
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        address: true,
        city: true,
        country: true,
        postalCode: true,
        verificationStatus: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
