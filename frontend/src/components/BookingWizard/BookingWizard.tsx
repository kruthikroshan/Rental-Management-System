import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  Package, 
  Calendar, 
  PlusCircle, 
  FileText 
} from 'lucide-react';
import {
  CustomerStep,
  ProductStep,
  DatesStep,
  ServicesStep,
  ReviewStep
} from './steps';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  available: boolean;
  description?: string;
}

export interface BookingDates {
  startDate: Date | null;
  endDate: Date | null;
  duration: number;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface BookingData {
  customer: Customer | null;
  products: Product[];
  dates: BookingDates;
  services: AdditionalService[];
  notes: string;
  totalPrice: number;
}

const STEPS = [
  { id: 1, name: 'Customer', icon: User, description: 'Select or add customer' },
  { id: 2, name: 'Products', icon: Package, description: 'Choose products to rent' },
  { id: 3, name: 'Dates', icon: Calendar, description: 'Select rental period' },
  { id: 4, name: 'Services', icon: PlusCircle, description: 'Add extra services' },
  { id: 5, name: 'Review', icon: FileText, description: 'Review and confirm' },
];

const BookingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    customer: null,
    products: [],
    dates: {
      startDate: null,
      endDate: null,
      duration: 0,
    },
    services: [],
    notes: '',
    totalPrice: 0,
  });

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const calculateTotalPrice = () => {
    const productTotal = bookingData.products.reduce(
      (sum, product) => sum + product.price * bookingData.dates.duration,
      0
    );
    const servicesTotal = bookingData.services
      .filter((service) => service.selected)
      .reduce((sum, service) => sum + service.price, 0);
    return productTotal + servicesTotal;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.customer !== null;
      case 2:
        return bookingData.products.length > 0;
      case 3:
        return bookingData.dates.startDate !== null && bookingData.dates.endDate !== null;
      case 4:
        return true; // Services are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const totalPrice = calculateTotalPrice();
    const finalBookingData = { ...bookingData, totalPrice };

    try {
      // TODO: Submit booking to API
      console.log('Submitting booking:', finalBookingData);
      
      // Show success message and redirect
      alert('Booking created successfully!');
      navigate('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      navigate('/bookings');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerStep
            selectedCustomer={bookingData.customer}
            onSelectCustomer={(customer) => updateBookingData({ customer })}
          />
        );
      case 2:
        return (
          <ProductStep
            selectedProducts={bookingData.products}
            onUpdateProducts={(products) => updateBookingData({ products })}
          />
        );
      case 3:
        return (
          <DatesStep
            dates={bookingData.dates}
            onUpdateDates={(dates) => updateBookingData({ dates })}
          />
        );
      case 4:
        return (
          <ServicesStep
            services={bookingData.services}
            onUpdateServices={(services) => updateBookingData({ services })}
          />
        );
      case 5:
        return (
          <ReviewStep
            bookingData={bookingData}
            totalPrice={calculateTotalPrice()}
            onUpdateNotes={(notes) => updateBookingData({ notes })}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Booking</h1>
            <p className="text-gray-500 mt-1">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-1 ${
                  step.id === currentStep ? 'text-blue-600' : 
                  step.id < currentStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.id === currentStep
                      ? 'border-blue-600 bg-blue-50'
                      : step.id < currentStep
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: 'w-6 h-6' })}
              <span>{STEPS[currentStep - 1].name}</span>
            </CardTitle>
            <p className="text-sm text-gray-500">{STEPS[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent className="min-h-[400px]">{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              <span>Create Booking</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
