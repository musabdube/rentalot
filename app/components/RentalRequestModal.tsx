'use client';

import { useState } from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Property } from '@/app/types/property';
import { TenantInfoData } from './TenantInfoModal';

interface RentalRequestModalProps {
  property: Property;
  onClose: () => void;
  onSuccess?: () => void;
  tenantInfo?: TenantInfoData;
}

export function RentalRequestModal({ property, onClose, onSuccess, tenantInfo }: RentalRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [moveInDate, setMoveInDate] = useState('');
  const [moveOutDate, setMoveOutDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!moveInDate) {
      toast.error('Please select a move-in date');
      return;
    }

    const moveInDateObj = new Date(moveInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (moveInDateObj < today) {
      toast.error('Move-in date must be in the future');
      return;
    }

    if (moveOutDate) {
      const moveOutDateObj = new Date(moveOutDate);
      if (moveOutDateObj <= moveInDateObj) {
        toast.error('Move-out date must be after move-in date');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          moveInDate,
          moveOutDate: moveOutDate || null,
          ...tenantInfo,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Request submitted successfully!');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
              <p className="text-gray-600">
                Your rental request has been sent to the landlord. They will review it shortly.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Rental Request</h2>
              <p className="text-gray-600 mb-6">
                {property.title} - ${property.rentAmount?.toLocaleString()} {property.currency}/month
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Move-in Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Move-in Date *
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">When do you want to move in?</p>
                </div>

                {/* Move-out Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Move-out Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                    min={moveInDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-600 mt-1">When do you plan to move out? (Leave blank for open-ended)</p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    The landlord will review your request. You can track the status in your dashboard.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
