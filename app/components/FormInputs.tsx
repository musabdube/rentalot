'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function FormInput({ label, error, className = '', ...props }: InputProps) {
  const baseClasses = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all';
  
  // Force text color with inline styles to override everything
  const forcedStyle: React.CSSProperties = {
    color: '#000000',
    backgroundColor: '#ffffff',
    WebkitTextFillColor: '#000000',
    fontSize: '16px',
    ...props.style,
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        style={forcedStyle}
        className={`${baseClasses} ${className}`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function FormTextArea({ label, error, className = '', ...props }: TextAreaProps) {
  const baseClasses = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all';
  
  const forcedStyle: React.CSSProperties = {
    color: '#000000',
    backgroundColor: '#ffffff',
    WebkitTextFillColor: '#000000',
    fontSize: '16px',
    ...props.style,
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={forcedStyle}
        className={`${baseClasses} ${className}`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, error, options, className = '', ...props }: SelectProps) {
  const baseClasses = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all';
  
  const forcedStyle: React.CSSProperties = {
    color: '#000000',
    backgroundColor: '#ffffff',
    WebkitTextFillColor: '#000000',
    fontSize: '16px',
    ...props.style,
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        {...props}
        style={forcedStyle}
        className={`${baseClasses} ${className}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
