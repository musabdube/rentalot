import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Rentalot - Find Your Perfect Rental Property';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Rentalot
          </div>
          <div
            style={{
              fontSize: 40,
              textAlign: 'center',
              opacity: 0.9,
              maxWidth: '800px',
            }}
          >
            Find Your Perfect Rental Property
          </div>
          <div
            style={{
              fontSize: 28,
              textAlign: 'center',
              opacity: 0.8,
              marginTop: '20px',
            }}
          >
            Browse • Compare • Connect
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
