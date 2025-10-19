import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell,
  Mail,
  MessageSquare,
  Users,
  Package,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Settings,
  Send,
  Eye,
  Trash2
} from "lucide-react";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: "booking",
      title: "New Booking Received",
      message: "Rajesh Kumar has booked Professional Camera Kit for Aug 15-17",
      timestamp: "2 minutes ago",
      isRead: false,
      priority: "high",
      icon: Package,
      customer: "Rajesh Kumar",
      amount: "₹15,000"
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Overdue",
      message: "Payment of ₹8,500 is overdue for booking #B-2025-089",
      timestamp: "1 hour ago",
      isRead: false,
      priority: "urgent",
      icon: DollarSign,
      customer: "Priya Sharma",
      amount: "₹8,500"
    },
    {
      id: 3,
      type: "return",
      title: "Item Return Due Today",
      message: "Wedding Decoration Set should be returned by 6 PM today",
      timestamp: "3 hours ago",
      isRead: true,
      priority: "medium",
      icon: Calendar,
      customer: "Arjun Singh",
      amount: "₹12,000"
    },
    {
      id: 4,
      type: "maintenance",
      title: "Maintenance Required",
      message: "Sound System Pro needs maintenance check",
      timestamp: "1 day ago",
      isRead: true,
      priority: "low",
      icon: AlertTriangle,
      customer: "System",
      amount: null
    },
    {
      id: 5,
      type: "customer",
      title: "New Customer Registered",
      message: "Meera Gupta has created a new account",
      timestamp: "2 days ago",
      isRead: true,
      priority: "low",
      icon: Users,
      customer: "Meera Gupta",
      amount: null
    },
    {
      id: 6,
      type: "delivery",
      title: "Delivery Completed",
      message: "Furniture Set Deluxe delivered successfully to Vikram Patel",
      timestamp: "2 days ago",
      isRead: true,
      priority: "low",
      icon: CheckCircle,
      customer: "Vikram Patel",
      amount: "₹18,000"
    }
  ];

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    bookingAlerts: true,
    paymentReminders: true,
    returnReminders: true,
    maintenanceAlerts: true,
    customerMessages: true,
    marketingEmails: false,
    weeklyReports: true
  });

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === "all" || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const markAllAsRead = () => {
    // In real app, this would update the database
    console.log("Marking all notifications as read");
  };

  const deleteNotification = (id: number) => {
    // In real app, this would delete from database
    console.log(`Deleting notification ${id}`);
  };

  const updateSetting = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
              Stay updated with business activities ({unreadCount} unread)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="booking">Bookings</option>
                    <option value="payment">Payments</option>
                    <option value="return">Returns</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="customer">Customers</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <Card key={notification.id} className={`${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-2 rounded-full ${
                            notification.priority === 'urgent' ? 'bg-red-100' :
                            notification.priority === 'high' ? 'bg-orange-100' :
                            notification.priority === 'medium' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            <IconComponent className={`w-4 h-4 ${
                              notification.priority === 'urgent' ? 'text-red-600' :
                              notification.priority === 'high' ? 'text-orange-600' :
                              notification.priority === 'medium' ? 'text-yellow-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className={`font-medium ${!notification.isRead ? 'font-bold' : ''}`}>
                                {notification.title}
                              </h3>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              {!notification.isRead && (
                                <Badge className="bg-blue-100 text-blue-800">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.timestamp}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {notification.customer}
                              </span>
                              {notification.amount && (
                                <span className="flex items-center">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {notification.amount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Notification Settings Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Notifications</span>
                  <Badge variant="outline">{notifications.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unread</span>
                  <Badge className="bg-blue-100 text-blue-800">{unreadCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Urgent</span>
                  <Badge className="bg-red-100 text-red-800">
                    {notifications.filter(n => n.priority === 'urgent').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High Priority</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {notifications.filter(n => n.priority === 'high').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">Email Notifications</span>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">SMS Notifications</span>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span className="text-sm">Push Notifications</span>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Booking Alerts</span>
                      <Switch
                        checked={notificationSettings.bookingAlerts}
                        onCheckedChange={(checked) => updateSetting('bookingAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Reminders</span>
                      <Switch
                        checked={notificationSettings.paymentReminders}
                        onCheckedChange={(checked) => updateSetting('paymentReminders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Return Reminders</span>
                      <Switch
                        checked={notificationSettings.returnReminders}
                        onCheckedChange={(checked) => updateSetting('returnReminders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Maintenance Alerts</span>
                      <Switch
                        checked={notificationSettings.maintenanceAlerts}
                        onCheckedChange={(checked) => updateSetting('maintenanceAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Customer Messages</span>
                      <Switch
                        checked={notificationSettings.customerMessages}
                        onCheckedChange={(checked) => updateSetting('customerMessages', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
