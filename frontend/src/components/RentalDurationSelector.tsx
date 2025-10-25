import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar, Clock, DollarSign, TrendingDown, AlertCircle } from 'lucide-react';

export type RentalUnit = 'hour' | 'day' | 'week' | 'month' | 'year';

interface RentalDurationSelectorProps {
  baseRentalRate: number; // Rate per day as base
  minDuration?: number;
  maxDuration?: number;
  onDurationChange: (duration: number, unit: RentalUnit, totalCost: number) => void;
  initialDuration?: number;
  initialUnit?: RentalUnit;
  className?: string;
  // Pricing tiers for different durations
  pricingRules?: {
    hourlyRate?: number;
    dailyRate: number;
    weeklyRate?: number;
    monthlyRate?: number;
    yearlyRate?: number;
    // Discounts for longer durations
    weekDiscount?: number; // percentage
    monthDiscount?: number;
    yearDiscount?: number;
  };
}

export const RentalDurationSelector: React.FC<RentalDurationSelectorProps> = ({
  baseRentalRate,
  minDuration = 1,
  maxDuration = 365,
  onDurationChange,
  initialDuration = 1,
  initialUnit = 'day',
  className = '',
  pricingRules
}) => {
  const [duration, setDuration] = useState<number>(initialDuration);
  const [unit, setUnit] = useState<RentalUnit>(initialUnit);

  // Default pricing rules
  const pricing = pricingRules || {
    hourlyRate: baseRentalRate / 8, // Assume 8 hours in a day
    dailyRate: baseRentalRate,
    weeklyRate: baseRentalRate * 6, // 1 day free
    monthlyRate: baseRentalRate * 25, // ~17% discount
    yearlyRate: baseRentalRate * 250, // ~32% discount
    weekDiscount: 15,
    monthDiscount: 17,
    yearDiscount: 32
  };

  // Calculate total cost based on duration and unit
  const calculateCost = (dur: number, rentalUnit: RentalUnit): number => {
    switch (rentalUnit) {
      case 'hour':
        return (pricing.hourlyRate || baseRentalRate / 8) * dur;
      case 'day':
        return pricing.dailyRate * dur;
      case 'week':
        return (pricing.weeklyRate || pricing.dailyRate * 7 * (1 - (pricing.weekDiscount || 0) / 100)) * dur;
      case 'month':
        return (pricing.monthlyRate || pricing.dailyRate * 30 * (1 - (pricing.monthDiscount || 0) / 100)) * dur;
      case 'year':
        return (pricing.yearlyRate || pricing.dailyRate * 365 * (1 - (pricing.yearDiscount || 0) / 100)) * dur;
      default:
        return pricing.dailyRate * dur;
    }
  };

  // Get rate per unit
  const getRatePerUnit = (rentalUnit: RentalUnit): number => {
    switch (rentalUnit) {
      case 'hour':
        return pricing.hourlyRate || baseRentalRate / 8;
      case 'day':
        return pricing.dailyRate;
      case 'week':
        return pricing.weeklyRate || pricing.dailyRate * 7 * (1 - (pricing.weekDiscount || 0) / 100);
      case 'month':
        return pricing.monthlyRate || pricing.dailyRate * 30 * (1 - (pricing.monthDiscount || 0) / 100);
      case 'year':
        return pricing.yearlyRate || pricing.dailyRate * 365 * (1 - (pricing.yearDiscount || 0) / 100);
      default:
        return pricing.dailyRate;
    }
  };

  // Calculate discount percentage
  const getDiscountPercentage = (rentalUnit: RentalUnit): number => {
    const ratePerUnit = getRatePerUnit(rentalUnit);
    const equivalentDays = getEquivalentDays(1, rentalUnit);
    const regularPrice = pricing.dailyRate * equivalentDays;
    const discountedPrice = ratePerUnit;
    
    if (regularPrice <= discountedPrice) return 0;
    return Math.round(((regularPrice - discountedPrice) / regularPrice) * 100);
  };

  // Convert duration to days for comparison
  const getEquivalentDays = (dur: number, rentalUnit: RentalUnit): number => {
    switch (rentalUnit) {
      case 'hour':
        return dur / 24;
      case 'day':
        return dur;
      case 'week':
        return dur * 7;
      case 'month':
        return dur * 30;
      case 'year':
        return dur * 365;
      default:
        return dur;
    }
  };

  const totalCost = calculateCost(duration, unit);
  const ratePerUnit = getRatePerUnit(unit);
  const discountPercentage = getDiscountPercentage(unit);

  // Notify parent component of changes
  useEffect(() => {
    onDurationChange(duration, unit, totalCost);
  }, [duration, unit]);

  // Validation for min/max duration
  const handleDurationChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const equivalentDays = getEquivalentDays(numValue, unit);
    
    if (equivalentDays < minDuration) {
      setDuration(Math.ceil(minDuration / (getEquivalentDays(1, unit) || 1)));
    } else if (equivalentDays > maxDuration) {
      setDuration(Math.floor(maxDuration / (getEquivalentDays(1, unit) || 1)));
    } else {
      setDuration(numValue);
    }
  };

  // Get suggested quick durations
  const getQuickDurations = (): { value: number; unit: RentalUnit; label: string }[] => {
    return [
      { value: 4, unit: 'hour', label: '4 Hours' },
      { value: 1, unit: 'day', label: '1 Day' },
      { value: 3, unit: 'day', label: '3 Days' },
      { value: 1, unit: 'week', label: '1 Week' },
      { value: 2, unit: 'week', label: '2 Weeks' },
      { value: 1, unit: 'month', label: '1 Month' }
    ];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Select Rental Duration
        </CardTitle>
        <CardDescription>
          Choose how long you need this item
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom Duration Input */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={(value) => setUnit(value as RentalUnit)}>
              <SelectTrigger id="unit" className="text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hour">Hour(s)</SelectItem>
                <SelectItem value="day">Day(s)</SelectItem>
                <SelectItem value="week">Week(s)</SelectItem>
                <SelectItem value="month">Month(s)</SelectItem>
                <SelectItem value="year">Year(s)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Duration Buttons */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Quick Select</Label>
          <div className="flex flex-wrap gap-2">
            {getQuickDurations().map((quick, index) => (
              <button
                key={index}
                onClick={() => {
                  setDuration(quick.value);
                  setUnit(quick.unit);
                }}
                className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                  duration === quick.value && unit === quick.unit
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {quick.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Display */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Rate per {unit}</span>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-semibold">₹{ratePerUnit.toFixed(2)}</span>
            </div>
          </div>

          {discountPercentage > 0 && (
            <div className="flex items-center justify-between bg-green-100 rounded-md px-3 py-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Discount Applied</span>
              </div>
              <Badge className="bg-green-600">
                {discountPercentage}% OFF
              </Badge>
            </div>
          )}

          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-700">Total Cost</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{totalCost.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  for {duration} {unit}{duration > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Equivalent days info */}
          {unit !== 'day' && (
            <div className="flex items-start gap-2 text-xs text-gray-600 bg-white rounded-md p-2">
              <Calendar className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                Equivalent to {getEquivalentDays(duration, unit).toFixed(1)} day(s)
              </span>
            </div>
          )}
        </div>

        {/* Duration limits warning */}
        {(getEquivalentDays(duration, unit) < minDuration || getEquivalentDays(duration, unit) > maxDuration) && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-700">
              <p className="font-medium">Duration Limit</p>
              <p className="text-xs mt-1">
                Rental must be between {minDuration} and {maxDuration} days
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RentalDurationSelector;
