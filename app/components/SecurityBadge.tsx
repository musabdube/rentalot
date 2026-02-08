'use client';

import { Property } from '../types/property';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import {
  calculateSecurityScore,
  getSecurityLevel,
  getSecurityColor,
  getSecurityLevelLabel,
  getSecurityFeatures,
} from '../lib/propertyUtils';

interface SecurityBadgeProps {
  property: Property;
  size?: 'sm' | 'md' | 'lg';
}

export function SecurityBadge({ property, size = 'md' }: SecurityBadgeProps) {
  const score = calculateSecurityScore(property);
  const level = getSecurityLevel(score);
  const color = getSecurityColor(level);
  const features = getSecurityFeatures(property);

  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }[size];

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div className={`border rounded-lg ${color} ${sizeClass}`}>
      <div className="flex items-center gap-2">
        <Lock className={`${iconSize} flex-shrink-0`} />
        <div className="flex-1">
          <div className="font-semibold">{getSecurityLevelLabel(level)}</div>
          <div className="text-xs opacity-75">{score.toFixed(0)}% Secure</div>
        </div>
      </div>

      {size !== 'sm' && features.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="text-xs font-medium mb-2">Security Features:</div>
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-1 text-xs">
                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PropertyRatingProps {
  property: Property;
}

export function PropertyRating({ property }: PropertyRatingProps) {
  const score = calculateSecurityScore(property);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-sm font-medium">
      <Lock className="w-4 h-4" />
      {score.toFixed(0)}% Security Score
    </div>
  );
}
