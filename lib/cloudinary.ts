export async function uploadToCloudinary(fileOrUrl: string): Promise<string | null> {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) return null;

    const form = new URLSearchParams();
    form.append('file', fileOrUrl);
    form.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Cloudinary upload failed:', res.status, txt);
      return null;
    }

    const data = await res.json();
    return data.secure_url || data.url || null;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return null;
  }
}

export function dataUrlSizeInBytes(dataUrl: string): number {
  // data:[<mediatype>][;base64],<data>
  const parts = dataUrl.split(',');
  if (parts.length < 2) return 0;
  const base64 = parts[1];
  // Calculate size in bytes from base64 length
  // Each 4 chars of base64 represent 3 bytes
  const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function validateDataUrlSize(dataUrl: string, maxBytes?: number): boolean {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  if (!dataUrl.startsWith('data:')) return true; // not a data URL, skip
  const limit = maxBytes ?? parseInt(process.env.CLOUDINARY_MAX_FILE_SIZE || '5242880', 10); // default 5MB
  const size = dataUrlSizeInBytes(dataUrl);
  return size <= limit;
}

