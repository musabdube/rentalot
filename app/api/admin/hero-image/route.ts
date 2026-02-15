import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, validateDataUrlSize } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const url = formData.get('url');
    const file = formData.get('file');

    if (typeof url === 'string' && url.trim()) {
      return NextResponse.json({ url: url.trim() });
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = (file as File).type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    if (!validateDataUrlSize(dataUrl)) {
      return NextResponse.json({ error: 'Image exceeds maximum allowed size' }, { status: 400 });
    }

    const uploadedUrl = await uploadToCloudinary(dataUrl);

    if (!uploadedUrl) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ url: uploadedUrl });
  } catch (error) {
    console.error('Error uploading hero image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
