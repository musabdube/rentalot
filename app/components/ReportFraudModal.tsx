'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface ReportFraudModalProps {
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
}

const FRAUD_TYPES = [
  { value: 'SCAM', label: 'Scam/Suspicious Listing' },
  { value: 'FAKE_LISTING', label: 'Fake Property' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content' },
  { value: 'FAKE_PROFILE', label: 'Fake Profile' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportFraudModal({ propertyId, propertyTitle, onClose }: ReportFraudModalProps) {
  const { data: session } = useSession();
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast.error('Please select a fraud type');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (!session?.user?.id) {
      toast.error('You must be signed in to report');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          description,
          propertyId,
        }),
      });

      if (response.ok) {
        toast.success('Report submitted successfully. Thank you for helping keep our platform safe.');
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Error submitting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Report Fraud</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Reporting: <span className="font-medium text-gray-900">{propertyTitle}</span>
            </p>
          </div>

          {/* Fraud Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Type of Fraud *
            </label>
            <div className="space-y-2">
              {FRAUD_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="fraudType"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about why you're reporting this property..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {description.length}/500 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
