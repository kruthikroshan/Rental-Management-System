import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Package, 
  Calendar, 
  DollarSign, 
  FileText, 
  Check,
  ShoppingCart 
} from 'lucide-react';
import { BookingData } from '../BookingWizard';

interface ReviewStepProps {
  bookingData: BookingData;
  totalPrice: number;
  onUpdateNotes: (notes: string) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ bookingData, totalPrice, onUpdateNotes }) => {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const productSubtotal = bookingData.products.reduce(
    (sum, product) => sum + product.price * bookingData.dates.duration,
    0
  );

  const servicesSubtotal = bookingData.services
    .filter((service) => service.selected)
    .reduce((sum, service) => sum + service.price, 0);

  const selectedServices = bookingData.services.filter((s) => s.selected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">Review Your Booking</h3>
        <p className="text-gray-500 mt-2">Please review all details before confirming</p>
      </div>

      {/* Customer Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Customer Information</h4>
            <p className="text-sm text-gray-500">Billing and contact details</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {bookingData.customer?.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{bookingData.customer?.name}</p>
              <p className="text-sm text-gray-600">{bookingData.customer?.email}</p>
              <p className="text-sm text-gray-600">{bookingData.customer?.phone}</p>
              {bookingData.customer?.address && (
                <p className="text-sm text-gray-500">{bookingData.customer.address}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Products */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Rental Products</h4>
            <p className="text-sm text-gray-500">{bookingData.products.length} item{bookingData.products.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="space-y-3">
          {bookingData.products.map((product) => (
            <div key={product.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">${product.price}/day × {bookingData.dates.duration} days</p>
                </div>
              </div>
              <p className="font-bold text-gray-900">${product.price * bookingData.dates.duration}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Rental Period */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Rental Period</h4>
            <p className="text-sm text-gray-500">{bookingData.dates.duration} day{bookingData.dates.duration !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Start Date</p>
              <p className="font-medium text-gray-900">{formatDate(bookingData.dates.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">End Date</p>
              <p className="font-medium text-gray-900">{formatDate(bookingData.dates.endDate)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Services */}
      {selectedServices.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Additional Services</h4>
              <p className="text-sm text-gray-500">{selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <p className="font-medium text-gray-900">{service.name}</p>
                </div>
                <p className="font-semibold text-gray-900">${service.price}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Price Breakdown */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Price Breakdown</h4>
            <p className="text-sm text-gray-600">Total rental cost</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-gray-700">
              Products ({bookingData.products.length} × {bookingData.dates.duration} days)
            </p>
            <p className="font-semibold text-gray-900">${productSubtotal.toFixed(2)}</p>
          </div>
          {servicesSubtotal > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-gray-700">Additional Services</p>
              <p className="font-semibold text-gray-900">${servicesSubtotal.toFixed(2)}</p>
            </div>
          )}
          <div className="border-t-2 border-gray-300 pt-3">
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold text-gray-900">Total Amount</p>
              <p className="text-3xl font-bold text-blue-600">${totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Additional Notes</h4>
            <p className="text-sm text-gray-500">Optional</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Any special instructions or requirements?</Label>
          <Textarea
            id="notes"
            placeholder="Enter any additional notes here..."
            value={bookingData.notes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
      </Card>

      {/* Confirmation Message */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-semibold mb-1">Ready to Confirm</p>
            <p className="text-green-800">
              By clicking "Create Booking" below, you confirm that all information is correct and
              agree to the rental terms and conditions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReviewStep;
