import { CheckCircle } from 'lucide-react';

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerificationBadge({ isVerified, size = 'md', showLabel = false }: VerificationBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      <div title="Verified" className="relative">
        <CheckCircle className={`${sizeClasses[size]} text-emerald-600`} />
        <div className="absolute inset-0 rounded-full bg-emerald-600 opacity-10 animate-pulse" />
      </div>
      {showLabel && <span className="text-xs font-semibold text-emerald-600">Verified</span>}
    </div>
  );
}
