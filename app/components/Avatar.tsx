import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  alt?: string;
}

export function Avatar({ src, name, className = '', alt }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
      <User className="w-5 h-5 text-emerald-600" />
    </div>
  );
}
