'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, User, Phone } from 'lucide-react';
import { Property } from '../types/property';
import toast from 'react-hot-toast';

interface ViewingScheduleModalProps {
  property: Property;
  onClose: () => void;
  onSubmit?: (data: ViewingRequest) => void;
}

export interface ViewingRequest {
  propertyId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

export function ViewingScheduleModal({
  property,
  onClose,
  onSubmit,
}: ViewingScheduleModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Array<{ id: string; startTime: string; endTime: string }>>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [step, setStep] = useState<'calendar' | 'details'>('calendar');
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    notes: '',
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isDateAvailable = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const handleDateSelect = (day: number) => {
    if (!isDateAvailable(day)) return;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedSlotId(null);
    fetchSlots(dateStr);
  };

  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Fetch available slots for selectedDate
  const fetchSlots = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/viewings/slots?propertyId=${property.id}&date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(
          Array.isArray(data)
            ? data.map((s: any) => ({ id: s.id, startTime: s.startTime, endTime: s.endTime }))
            : []
        );
      }
    } catch (err) {
      console.error('Failed to fetch slots', err);
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    const data: ViewingRequest = {
      propertyId: property.id,
      visitorName: formData.visitorName,
      visitorEmail: formData.visitorEmail,
      visitorPhone: formData.visitorPhone,
      preferredDate: selectedDate,
      preferredTime: selectedTime,
      notes: formData.notes,
    };

    if (onSubmit) {
      onSubmit(data);
    } else {
      try {
        const bodyToSend: any = { ...data };
        if (selectedSlotId) bodyToSend.slotId = selectedSlotId;

        const response = await fetch('/api/viewings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyToSend),
        });

        if (response.ok) {
          toast.success('Viewing scheduled successfully!');
          onClose();
        }
      } catch (error) {
        console.error('Failed to schedule viewing:', error);
      }
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const canProceed =
    step === 'calendar'
      ? selectedDate && selectedTime
      : formData.visitorName && formData.visitorEmail && formData.visitorPhone;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule a Viewing</h2>
            <p className="text-gray-600 text-sm mt-1">{property.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {step === 'calendar' ? (
            <div>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-xl font-bold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2 mb-8">
                {days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => day && handleDateSelect(day)}
                    disabled={!isDateAvailable(day)}
                    className={`aspect-square rounded-lg font-semibold transition-all ${
                      day === null
                        ? 'bg-transparent'
                        : isDateAvailable(day)
                        ? selectedDate ===
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            day
                          )
                            .toISOString()
                            .split('T')[0]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-gray-900 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    Select Time
                  </h4>
                  <div className="grid grid-cols-4 gap-3 mb-8">
                    {/* show available slots if any, otherwise fall back to default timeSlots */}
                    {availableSlots.length > 0
                      ? availableSlots.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => { setSelectedTime(s.startTime); setSelectedSlotId(s.id); }}
                            className={`py-3 rounded-lg font-medium transition-all ${
                              selectedSlotId === s.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            {s.startTime} - {s.endTime}
                          </button>
                        ))
                      : timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => { setSelectedTime(time); setSelectedSlotId(null); }}
                            className={`py-3 rounded-lg font-medium transition-all ${
                              selectedTime === time
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                  </div>
                </div>
              )}

              {/* Navigation Button */}
              <button
                onClick={() => setStep('details')}
                disabled={!canProceed}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Visitor Information
              </h3>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.visitorName}
                    onChange={(e) =>
                      setFormData({ ...formData, visitorName: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.visitorEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, visitorEmail: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.visitorPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, visitorPhone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any special requests or questions?"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-emerald-50 rounded-lg p-4 mb-8">
                <h4 className="font-semibold text-gray-900 mb-3">Viewing Summary</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Date:</span> {selectedDate}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {selectedTime}
                  </p>
                  <p>
                    <span className="font-medium">Property:</span> {property.title}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('calendar')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Schedule Viewing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
