import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon,
  User,
  Building,
  CreditCard,
  Shield,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Key,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  DollarSign,
  Percent
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState({
    businessName: "RentEase Solutions",
    businessAddress: "123 Business Street, City, State 12345",
    phone: "+91 98765 43210",
    email: "admin@rentease.com",
    website: "www.rentease.com",
    gstNumber: "27AAAAA0000A1Z5",
    currency: "INR",
    timezone: "Asia/Kolkata",
    businessHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "18:00", isOpen: true },
      saturday: { open: "10:00", close: "16:00", isOpen: true },
      sunday: { open: "10:00", close: "16:00", isOpen: false }
    }
  });

  // Rental Settings
  const [rentalSettings, setRentalSettings] = useState({
    defaultRentalPeriod: 1,
    minimumRentalPeriod: 1,
    maximumRentalPeriod: 30,
    securityDepositPercentage: 20,
    lateFeePercentage: 5,
    cancellationWindow: 24,
    advanceBookingDays: 60,
    autoConfirmBookings: false,
    requireSecurityDeposit: true,
    allowPartialPayments: true,
    enableDeliveryCharges: true,
    baseDeliveryCharge: 500
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    enableOnlinePayments: true,
    enableCashPayments: true,
    enableCardPayments: true,
    enableUPI: true,
    enableNetBanking: true,
    razorpayKeyId: "rzp_test_xxxxxxxxxxxxx",
    stripePublishableKey: "pk_test_xxxxxxxxxxxxx",
    paymentGateway: "razorpay",
    autoGenerateInvoices: true,
    sendPaymentReminders: true,
    reminderDaysBefore: 2
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    bookingConfirmations: true,
    paymentReminders: true,
    returnReminders: true,
    maintenanceAlerts: true,
    inventoryAlerts: true,
    lowStockThreshold: 5
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    loginAttempts: 5,
    requireStrongPasswords: true,
    allowRememberMe: true,
    apiRateLimit: 100,
    enableAuditLog: true
  });

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "business", label: "Business", icon: Building },
    { id: "rental", label: "Rental", icon: Calendar },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Mail },
    { id: "security", label: "Security", icon: Shield }
  ];

  const saveSettings = () => {
    // In real app, this would save to database
    console.log("Saving settings...", {
      businessSettings,
      rentalSettings,
      paymentSettings,
      notificationSettings,
      securitySettings
    });
  };

  const exportSettings = () => {
    // In real app, this would export settings as JSON/CSV
    const settings = {
      business: businessSettings,
      rental: rentalSettings,
      payments: paymentSettings,
      notifications: notificationSettings,
      security: securitySettings
    };
    console.log("Exporting settings:", settings);
  };

  const resetToDefaults = () => {
    // In real app, this would reset to default settings
    console.log("Resetting to default settings");
  };

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Configure your rental management system
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={exportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveSettings} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <select id="theme" className="w-full px-3 py-2 border rounded-md">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select id="language" className="w-full px-3 py-2 border rounded-md">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                        <option value="gu">Gujarati</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <select id="dateFormat" className="w-full px-3 py-2 border rounded-md">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <select id="timeFormat" className="w-full px-3 py-2 border rounded-md">
                        <option value="12">12 Hour</option>
                        <option value="24">24 Hour</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Settings */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={businessSettings.businessName}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, businessName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                          id="gstNumber"
                          value={businessSettings.gstNumber}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, gstNumber: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Textarea
                        id="businessAddress"
                        value={businessSettings.businessAddress}
                        onChange={(e) => setBusinessSettings(prev => ({ ...prev, businessAddress: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={businessSettings.phone}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={businessSettings.email}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={businessSettings.website}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(businessSettings.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={hours.isOpen}
                              onCheckedChange={(checked) => 
                                setBusinessSettings(prev => ({
                                  ...prev,
                                  businessHours: {
                                    ...prev.businessHours,
                                    [day]: { ...hours, isOpen: checked }
                                  }
                                }))
                              }
                            />
                            <span className="font-medium capitalize">{day}</span>
                          </div>
                          {hours.isOpen && (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) => 
                                  setBusinessSettings(prev => ({
                                    ...prev,
                                    businessHours: {
                                      ...prev.businessHours,
                                      [day]: { ...hours, open: e.target.value }
                                    }
                                  }))
                                }
                                className="w-20"
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) => 
                                  setBusinessSettings(prev => ({
                                    ...prev,
                                    businessHours: {
                                      ...prev.businessHours,
                                      [day]: { ...hours, close: e.target.value }
                                    }
                                  }))
                                }
                                className="w-20"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Rental Settings */}
            {activeTab === "rental" && (
              <Card>
                <CardHeader>
                  <CardTitle>Rental Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="defaultRentalPeriod">Default Rental Period (days)</Label>
                      <Input
                        id="defaultRentalPeriod"
                        type="number"
                        value={rentalSettings.defaultRentalPeriod}
                        onChange={(e) => setRentalSettings(prev => ({ ...prev, defaultRentalPeriod: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimumRentalPeriod">Minimum Rental Period (days)</Label>
                      <Input
                        id="minimumRentalPeriod"
                        type="number"
                        value={rentalSettings.minimumRentalPeriod}
                        onChange={(e) => setRentalSettings(prev => ({ ...prev, minimumRentalPeriod: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maximumRentalPeriod">Maximum Rental Period (days)</Label>
                      <Input
                        id="maximumRentalPeriod"
                        type="number"
                        value={rentalSettings.maximumRentalPeriod}
                        onChange={(e) => setRentalSettings(prev => ({ ...prev, maximumRentalPeriod: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="securityDepositPercentage">Security Deposit (%)</Label>
                      <Input
                        id="securityDepositPercentage"
                        type="number"
                        value={rentalSettings.securityDepositPercentage}
                        onChange={(e) => setRentalSettings(prev => ({ ...prev, securityDepositPercentage: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lateFeePercentage">Late Fee (%)</Label>
                      <Input
                        id="lateFeePercentage"
                        type="number"
                        value={rentalSettings.lateFeePercentage}
                        onChange={(e) => setRentalSettings(prev => ({ ...prev, lateFeePercentage: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoConfirmBookings">Auto-confirm bookings</Label>
                      <Switch
                        id="autoConfirmBookings"
                        checked={rentalSettings.autoConfirmBookings}
                        onCheckedChange={(checked) => setRentalSettings(prev => ({ ...prev, autoConfirmBookings: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSecurityDeposit">Require security deposit</Label>
                      <Switch
                        id="requireSecurityDeposit"
                        checked={rentalSettings.requireSecurityDeposit}
                        onCheckedChange={(checked) => setRentalSettings(prev => ({ ...prev, requireSecurityDeposit: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowPartialPayments">Allow partial payments</Label>
                      <Switch
                        id="allowPartialPayments"
                        checked={rentalSettings.allowPartialPayments}
                        onCheckedChange={(checked) => setRentalSettings(prev => ({ ...prev, allowPartialPayments: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Settings */}
            {activeTab === "payments" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Payment Methods</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableOnlinePayments">Online Payments</Label>
                        <Switch
                          id="enableOnlinePayments"
                          checked={paymentSettings.enableOnlinePayments}
                          onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableOnlinePayments: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableCashPayments">Cash Payments</Label>
                        <Switch
                          id="enableCashPayments"
                          checked={paymentSettings.enableCashPayments}
                          onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableCashPayments: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableUPI">UPI Payments</Label>
                        <Switch
                          id="enableUPI"
                          checked={paymentSettings.enableUPI}
                          onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableUPI: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableCardPayments">Card Payments</Label>
                        <Switch
                          id="enableCardPayments"
                          checked={paymentSettings.enableCardPayments}
                          onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableCardPayments: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Payment Gateway</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentGateway">Primary Gateway</Label>
                        <select
                          id="paymentGateway"
                          value={paymentSettings.paymentGateway}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, paymentGateway: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="razorpay">Razorpay</option>
                          <option value="stripe">Stripe</option>
                          <option value="payu">PayU</option>
                          <option value="cashfree">Cashfree</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                        <Input
                          id="razorpayKeyId"
                          value={paymentSettings.razorpayKeyId}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                          placeholder="rzp_test_xxxxxxxxxxxxx"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Delivery Methods</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <Switch
                          id="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <Switch
                          id="smsNotifications"
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="bookingConfirmations">Booking Confirmations</Label>
                        <Switch
                          id="bookingConfirmations"
                          checked={notificationSettings.bookingConfirmations}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, bookingConfirmations: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="paymentReminders">Payment Reminders</Label>
                        <Switch
                          id="paymentReminders"
                          checked={notificationSettings.paymentReminders}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentReminders: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="inventoryAlerts">Inventory Alerts</Label>
                        <Switch
                          id="inventoryAlerts"
                          checked={notificationSettings.inventoryAlerts}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, inventoryAlerts: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <Switch
                        id="twoFactorAuth"
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireStrongPasswords">Require Strong Passwords</Label>
                      <Switch
                        id="requireStrongPasswords"
                        checked={securitySettings.requireStrongPasswords}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: checked }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Security Recommendations</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Enable two-factor authentication for admin accounts</li>
                      <li>• Require strong passwords with special characters</li>
                      <li>• Set session timeout to 30 minutes or less</li>
                      <li>• Limit login attempts to prevent brute force attacks</li>
                      <li>• Enable audit logging for compliance</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
