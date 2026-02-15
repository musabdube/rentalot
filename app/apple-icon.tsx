import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Rentalot';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: '#059669',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          borderRadius: '20px',
        }}
      >
        R
      </div>
    ),
    {
      ...size,
    }
  );
}
