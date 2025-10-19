import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Shield, Truck, Wrench, HelpCircle } from 'lucide-react';
import { AdditionalService } from '../BookingWizard';

interface ServicesStepProps {
  services: AdditionalService[];
  onUpdateServices: (services: AdditionalService[]) => void;
}

const ServicesStep: React.FC<ServicesStepProps> = ({ services, onUpdateServices }) => {
  const [availableServices, setAvailableServices] = useState<AdditionalService[]>([]);

  useEffect(() => {
    // Mock services data
    const mockServices: AdditionalService[] = [
      {
        id: '1',
        name: 'Damage Insurance',
        price: 50,
        selected: false,
      },
      {
        id: '2',
        name: 'Delivery & Pickup',
        price: 75,
        selected: false,
      },
      {
        id: '3',
        name: 'Installation & Setup',
        price: 100,
        selected: false,
      },
      {
        id: '4',
        name: '24/7 Support',
        price: 30,
        selected: false,
      },
    ];

    // If services already exist, use them; otherwise use mock data
    if (services.length > 0) {
      setAvailableServices(services);
    } else {
      setAvailableServices(mockServices);
      onUpdateServices(mockServices);
    }
  }, []);

  const toggleService = (serviceId: string) => {
    const updatedServices = availableServices.map((service) =>
      service.id === serviceId ? { ...service, selected: !service.selected } : service
    );
    setAvailableServices(updatedServices);
    onUpdateServices(updatedServices);
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.includes('Insurance')) return Shield;
    if (serviceName.includes('Delivery')) return Truck;
    if (serviceName.includes('Installation')) return Wrench;
    if (serviceName.includes('Support')) return HelpCircle;
    return HelpCircle;
  };

  const getServiceColor = (serviceName: string) => {
    if (serviceName.includes('Insurance')) return 'blue';
    if (serviceName.includes('Delivery')) return 'purple';
    if (serviceName.includes('Installation')) return 'green';
    if (serviceName.includes('Support')) return 'orange';
    return 'gray';
  };

  const selectedServices = availableServices.filter((s) => s.selected);
  const totalServicesCost = selectedServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">Enhance Your Rental Experience</h3>
        <p className="text-gray-500 mt-2">
          Add optional services to make your rental even better (all services are optional)
        </p>
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-900">
                {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
              </h4>
              <p className="text-sm text-green-700">
                {selectedServices.map((s) => s.name).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-900">${totalServicesCost}</p>
              <p className="text-xs text-green-700">Additional cost</p>
            </div>
          </div>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableServices.map((service) => {
          const Icon = getServiceIcon(service.name);
          const color = getServiceColor(service.name);

          return (
            <Card
              key={service.id}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                service.selected
                  ? 'border-2 border-green-500 bg-green-50'
                  : 'hover:border-blue-300'
              }`}
              onClick={() => toggleService(service.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {service.name === 'Damage Insurance' &&
                        'Protect your rental with comprehensive damage coverage'}
                      {service.name === 'Delivery & Pickup' &&
                        'We deliver to your location and pick up when done'}
                      {service.name === 'Installation & Setup' &&
                        'Professional installation and setup service'}
                      {service.name === '24/7 Support' &&
                        'Round-the-clock technical support and assistance'}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-gray-900">${service.price}</p>
                      {service.selected && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Added
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {service.selected && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 ml-2">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {service.name === 'Damage Insurance' && (
                    <>
                      <Badge variant="secondary" className="text-xs">Coverage up to $5,000</Badge>
                      <Badge variant="secondary" className="text-xs">$0 deductible</Badge>
                    </>
                  )}
                  {service.name === 'Delivery & Pickup' && (
                    <>
                      <Badge variant="secondary" className="text-xs">Within 25 miles</Badge>
                      <Badge variant="secondary" className="text-xs">Same day available</Badge>
                    </>
                  )}
                  {service.name === 'Installation & Setup' && (
                    <>
                      <Badge variant="secondary" className="text-xs">Professional team</Badge>
                      <Badge variant="secondary" className="text-xs">1-2 hours</Badge>
                    </>
                  )}
                  {service.name === '24/7 Support' && (
                    <>
                      <Badge variant="secondary" className="text-xs">Phone & chat</Badge>
                      <Badge variant="secondary" className="text-xs">Instant help</Badge>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* No Services Selected Message */}
      {selectedServices.length === 0 && (
        <Card className="p-6 bg-gray-50 border-dashed border-2">
          <p className="text-center text-gray-600">
            No additional services selected. You can proceed without adding any services.
          </p>
        </Card>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Service Information</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>All services are one-time charges added to your booking</li>
              <li>You can modify services before confirming the booking</li>
              <li>Some services may require scheduling in advance</li>
              <li>Contact support if you need custom service arrangements</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ServicesStep;
