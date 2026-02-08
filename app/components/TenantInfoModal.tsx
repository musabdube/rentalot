'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TenantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TenantInfoData) => void;
  isLoading?: boolean;
}

export interface TenantInfoData {
  tenantPhone?: string;
  tenantEmail?: string;
  tenantOccupation?: string;
  tenantIncome?: string;
  tenantEmployer?: string;
  tenantReferences?: string;
  tenantNotes?: string;
}

export function TenantInfoModal({ isOpen, onClose, onSubmit, isLoading = false }: TenantInfoModalProps) {
  const [formData, setFormData] = useState<TenantInfoData>({
    tenantPhone: '',
    tenantEmail: '',
    tenantOccupation: '',
    tenantIncome: '',
    tenantEmployer: '',
    tenantReferences: '',
    tenantNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSkip = () => {
    onSubmit({});
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Tell Us About Yourself</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
          <p className="text-gray-600 mb-6">
            Share some information about yourself with the landlord (all fields are optional). This helps them understand more about you and your needs.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="tenantPhone"
              value={formData.tenantPhone || ''}
              onChange={handleChange}
              placeholder="+263 XX XXX XXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="tenantEmail"
              value={formData.tenantEmail || ''}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occupation
            </label>
            <input
              type="text"
              name="tenantOccupation"
              value={formData.tenantOccupation || ''}
              onChange={handleChange}
              placeholder="e.g., Software Engineer, Teacher"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Income Range
            </label>
            <input
              type="text"
              name="tenantIncome"
              value={formData.tenantIncome || ''}
              onChange={handleChange}
              placeholder="e.g., $2000-$3000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employer
            </label>
            <input
              type="text"
              name="tenantEmployer"
              value={formData.tenantEmployer || ''}
              onChange={handleChange}
              placeholder="Your employer name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              References
            </label>
            <textarea
              name="tenantReferences"
              value={formData.tenantReferences || ''}
              onChange={handleChange}
              placeholder="Previous landlord, manager, or other references"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="tenantNotes"
              value={formData.tenantNotes || ''}
              onChange={handleChange}
              placeholder="Anything else you'd like to tell the landlord..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
