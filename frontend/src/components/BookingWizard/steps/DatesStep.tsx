import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { BookingDates } from '../BookingWizard';

interface DatesStepProps {
  dates: BookingDates;
  onUpdateDates: (dates: BookingDates) => void;
}

const DatesStep: React.FC<DatesStepProps> = ({ dates, onUpdateDates }) => {
  const calculateDuration = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value ? new Date(e.target.value) : null;
    const duration = calculateDuration(newStartDate, dates.endDate);
    onUpdateDates({
      ...dates,
      startDate: newStartDate,
      duration,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value ? new Date(e.target.value) : null;
    const duration = calculateDuration(dates.startDate, newEndDate);
    onUpdateDates({
      ...dates,
      endDate: newEndDate,
      duration,
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const isValidDateRange = dates.startDate && dates.endDate && dates.startDate <= dates.endDate;
  const minEndDate = dates.startDate ? formatDate(dates.startDate) : '';

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <Label htmlFor="startDate" className="text-base font-semibold">
                  Start Date
                </Label>
                <p className="text-sm text-gray-500">When does the rental begin?</p>
              </div>
            </div>
            <Input
              id="startDate"
              type="date"
              value={formatDate(dates.startDate)}
              onChange={handleStartDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="text-lg"
            />
            {dates.startDate && (
              <p className="text-sm text-gray-600">
                {dates.startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </Card>

        {/* End Date */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-base font-semibold">
                  End Date
                </Label>
                <p className="text-sm text-gray-500">When will it be returned?</p>
              </div>
            </div>
            <Input
              id="endDate"
              type="date"
              value={formatDate(dates.endDate)}
              onChange={handleEndDateChange}
              min={minEndDate || new Date().toISOString().split('T')[0]}
              disabled={!dates.startDate}
              className="text-lg"
            />
            {dates.endDate && (
              <p className="text-sm text-gray-600">
                {dates.endDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Duration Summary */}
      {isValidDateRange ? (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {dates.duration} {dates.duration === 1 ? 'Day' : 'Days'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Total rental duration</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              {dates.duration} {dates.duration === 1 ? 'day' : 'days'}
            </Badge>
          </div>

          {/* Timeline Visualization */}
          <div className="mt-6 pt-6 border-t border-blue-200">
            <div className="relative">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs font-medium text-gray-900">Start</p>
                  <p className="text-xs text-gray-600">
                    {dates.startDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-4"></div>
                <div className="text-center">
                  <div className="w-4 h-4 rounded-full bg-purple-600 mx-auto mb-2"></div>
                  <p className="text-xs font-medium text-gray-900">End</p>
                  <p className="text-xs text-gray-600">
                    {dates.endDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : dates.startDate && dates.endDate && dates.startDate > dates.endDate ? (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Invalid Date Range</p>
              <p className="text-sm text-red-700">End date must be after the start date</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center border-dashed border-2">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Select both start and end dates to see duration</p>
        </Card>
      )}

      {/* Additional Information */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Rental Policy</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Minimum rental period is 1 day</li>
              <li>Products must be returned by 6 PM on the end date</li>
              <li>Late returns may incur additional charges</li>
              <li>Weekend rates may apply for Saturday and Sunday rentals</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DatesStep;
