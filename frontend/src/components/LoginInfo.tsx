import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Info } from 'lucide-react';

export default function LoginInfo() {
  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Login Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Welcome to RentEase</h3>
            <p className="text-sm text-blue-700">
              Please enter your credentials to access the rental management system. 
              Contact your administrator if you need help accessing your account.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
