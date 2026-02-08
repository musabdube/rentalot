'use client';

import { Home, Building2, Shield, LucideIcon } from 'lucide-react';

interface RoleBadgeProps {
  role?: string | null;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'icon-only' | 'with-label';
  className?: string;
}

export function RoleBadge({ 
  role, 
  showText = true, 
  size = 'md',
  variant = 'badge',
  className = ''
}: RoleBadgeProps) {
  if (!role) return null;

  const roleUpper = role.toUpperCase();
  
  const roleConfig: Record<string, {
    icon: LucideIcon;
    color: string;
    bgColor: string;
    label: string;
    borderColor?: string;
  }> = {
    TENANT: {
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Tenant',
      borderColor: 'border-blue-200',
    },
    LANDLORD: {
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Landlord',
      borderColor: 'border-green-200',
    },
    ADMIN: {
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: 'Admin',
      borderColor: 'border-purple-200',
    },
  };

  const config = roleConfig[roleUpper];
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      icon: 'w-3 h-3',
      badge: 'px-2 py-1 text-xs',
      label: 'text-xs',
    },
    md: {
      icon: 'w-4 h-4',
      badge: 'px-3 py-1.5 text-sm',
      label: 'text-sm',
    },
    lg: {
      icon: 'w-5 h-5',
      badge: 'px-4 py-2 text-base',
      label: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  if (variant === 'icon-only') {
    return (
      <div className={`${config.color} ${className}`} title={config.label}>
        <Icon className={sizes.icon} />
      </div>
    );
  }

  if (variant === 'with-label') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${config.color}`}>
          <Icon className={sizes.icon} />
        </div>
        {showText && <span className={`${sizes.label} text-gray-700`}>{config.label}</span>}
      </div>
    );
  }

  // Default badge variant
  return (
    <div 
      className={`inline-flex items-center gap-2 ${config.bgColor} border ${config.borderColor} rounded-full ${sizes.badge} font-medium ${className}`}
    >
      <Icon className={`${sizes.icon} ${config.color}`} />
      {showText && <span className={config.color}>{config.label}</span>}
    </div>
  );
}
