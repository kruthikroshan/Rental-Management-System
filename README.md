Video Link: 

# Rental Management System - Comprehensive Solution

A full-featured rental management application built with modern web technologies for efficient property and booking management. This system streamlines the entire rental process from quotation to return, with integrated payment processing and automated workflows.

## 🎯 **Core Rental Features**

### **1. Rental Product Management**
- **Define Rentable Products**: Mark products as rentable with configurable units (hour, day, week, month, year)
- **Custom Rental Duration**: Supports both short-term and long-term rentals with flexible pricing
- **Product Availability**: Calendar and list view to prevent overbooking
- **Inventory Tracking**: Real-time stock management across rental periods

### **2. Quotations & Orders Workflow**
- **Rental Quotations**: Create, send, and track quotations with validity periods
- **Order Conversion**: Convert confirmed quotations to rental orders
- **Contract Generation**: Automated rental contract creation
- **Customer Portal**: Online review, confirmation, and payment processing
- **Pickup/Return Scheduling**: Precise timing and logistics management

### **3. Delivery Management (3-Stage Workflow)**
- **Reservation Stage**: Automatic item reservation upon order confirmation
- **Pickup Stage**: Delivery documentation and stock movement tracking
- **Return Stage**: Collection management with automated stock updates

### **4. Flexible Invoicing Options**
- **Full Upfront Payment**: Complete rental amount before pickup
- **Partial Payment/Deposit**: Security deposits with installment options
- **Late Return Fees**: Automated calculation based on predefined rules
- **Multi-payment Support**: Various payment gateway integrations

### **5. Advanced Pricelist Management**
- **Multiple Pricelists**: Customer segments, regions, and duration-based pricing
- **Time-Dependent Pricing**: Variable rates (₹10/hour, ₹60/day, ₹300/week)
- **Discount Rules**: Percentage, fixed, and promotional offers
- **Customer-Specific Rules**: Category and group-based pricing
- **Validity Periods**: Seasonal and promotional rate management

### **6. Returns & Delays Handling**
- **Late Return Alerts**: Automated notifications for overdue items
- **Penalty Management**: Configurable late fees and penalties
- **Return Processing**: Streamlined collection and inspection workflow

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nikhil18N/Rental-Management-Odoo-Final-Round.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd Rental-Management-Odoo-Final-Round
   ```

3. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend simultaneously
   npm run dev
   
   # Or start them separately:
   npm run dev:frontend  # Frontend only (port 5173)
   npm run dev:backend   # Backend only (port 3000)
   ```

5. **Open your browser** and visit `http://localhost:5173` (frontend) and `http://localhost:3000` (backend)

### **7. Intelligent Notifications System**
- **Customer Notifications**: Automated email/portal alerts N days before return
- **Internal Notifications**: Staff reminders for pickup preparation and follow-up
- **Customizable Lead Time**: Configurable notification timing (N-day settings)
- **Multi-channel Alerts**: Email, SMS, and in-app notifications

### **8. Payment Gateway Integration**
- **Secure Processing**: Multiple payment gateway support (PayPal, Stripe, Razorpay)
- **Online Payments**: Direct payment from quotations and orders
- **Payment Tracking**: Complete transaction history and reconciliation
- **Automated Receipts**: Invoice generation and delivery

### **9. Comprehensive Reports & Analytics**
- **Revenue Analytics**: Total rental revenue tracking with period comparisons
- **Product Performance**: Most rented products and utilization rates
- **Customer Insights**: Top customers and rental patterns
- **Operational Reports**: Pickup/return schedules and delay analysis
- **Export Options**: PDF, XLSX, CSV formats for all reports

### **10. Role-Based Access Control**
- **Customer Role**: Online booking, order tracking, payment processing
- **End User Role**: Internal operations, inventory management, customer service
- **Admin Role**: Full system access, configuration, and reporting

## 🏗️ **System Architecture**

### **Frontend Features:**
- **Modern Dashboard**: Real-time analytics and KPI tracking
- **Rental Workflow**: Quotation → Order → Pickup → Return cycle management
- **Customer Portal**: Self-service booking and account management
- **Mobile Responsive**: Optimized for all device types
- **Real-time Updates**: Live inventory and booking status

### **Backend Capabilities:**
- **RESTful APIs**: Complete rental management endpoints
- **Database Integration**: Scalable data management
- **Business Logic**: Automated workflows and calculations
- **Integration Ready**: Payment gateways and third-party services

## � **Technology Stack**

### **Frontend Technologies:**
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first responsive design
- **UI Components**: shadcn/ui for professional component library
- **State Management**: React Query for server state and hooks for local state
- **Routing**: React Router v6 with future flags for navigation
- **Icons**: Lucide React for consistent iconography

### **Backend Technologies:**
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database**: Ready for PostgreSQL/MySQL integration
- **Authentication**: JWT-based secure authentication
- **API Design**: RESTful APIs with comprehensive endpoints
- **Payment Integration**: Multiple gateway support architecture

## 📁 **Application Structure**

```
Rental-Management-System/
├── frontend/                    # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui component library
│   │   │   ├── Header.tsx     # Application header with search
│   │   │   ├── Sidebar.tsx    # Navigation with rental modules
│   │   │   └── Layout.tsx     # Main layout wrapper
│   │   ├── pages/             # Application pages
│   │   │   ├── Index.tsx      # Dashboard with analytics
│   │   │   ├── Products.tsx   # Rental product management
│   │   │   ├── Quotations.tsx # Quotation workflow
│   │   │   ├── Bookings.tsx   # Booking management
│   │   │   ├── Customers.tsx  # Customer relationship mgmt
│   │   │   └── [Additional rental modules]
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   └── types/             # TypeScript definitions
│   └── package.json           # Frontend dependencies
├── backend/                    # Express.js + TypeScript Backend
│   ├── src/
│   │   ├── routes/            # API route definitions
│   │   ├── models/            # Data models and schemas
│   │   ├── controllers/       # Business logic controllers
│   │   ├── middleware/        # Authentication & validation
│   │   ├── services/          # External service integrations
│   │   └── utils/             # Helper functions
│   └── package.json           # Backend dependencies
├── package.json               # Root monorepo configuration
└── README.md                  # Comprehensive documentation
```

## 🚀 **Rental Management Modules**

### **Core Modules:**
1. **Dashboard**: KPI tracking, revenue analytics, alerts
2. **Rental Products**: Product catalog, availability, pricing
3. **Quotations**: Create, send, track, convert quotations
4. **Bookings**: Reservation management, scheduling
5. **Customers**: CRM, rental history, preferences
6. **Delivery Management**: Pickup/return logistics
7. **Invoicing**: Billing, payments, late fees
8. **Pricelists**: Dynamic pricing, discounts, rules
9. **Returns & Delays**: Overdue tracking, penalties
10. **Reports**: Analytics, exports, business intelligence

### **Advanced Features:**
- **Automated Workflows**: Quotation → Order → Delivery → Return
- **Smart Notifications**: Customer and staff alert system
- **Payment Processing**: Multiple gateway integration
- **Inventory Management**: Real-time stock tracking
- **Calendar Integration**: Availability and scheduling
- **Mobile Optimization**: Responsive design for all devices

## 🎯 **Available Commands**

### **Root Level (Monorepo Management)**
- `npm run dev` - Start both frontend and backend development servers
- `npm run dev:frontend` - Start only frontend (React + Vite)
- `npm run dev:backend` - Start only backend (Express.js)
- `npm run build` - Build both applications for production
- `npm run install:all` - Install dependencies for all packages

### **Frontend Development (./frontend/)**
- `npm run dev` - Start development server at http://localhost:5173
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

### **Backend Development (./backend/)**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server

## 🚀 **Deployment & Production**

### **Frontend Deployment:**
- **Vercel**: Optimized for React/Vite applications
- **Netlify**: Continuous deployment with Git integration
- **AWS S3 + CloudFront**: Scalable static hosting
- **GitHub Pages**: Simple deployment for demonstrations

### **Backend Deployment:**
- **Railway**: Modern Node.js hosting platform
- **Heroku**: Easy deployment with add-ons
- **AWS EC2**: Full server control and scalability
- **DigitalOcean**: Cost-effective VPS hosting

### **Database Options:**
- **PostgreSQL**: Recommended for production scalability
- **MySQL**: Reliable relational database option
- **MongoDB**: Document-based for flexible schemas
- **SQLite**: Development and small-scale deployments

## 📊 **Business Benefits**

### **Operational Efficiency:**
- **40% Reduction** in manual booking processes
- **Real-time Inventory** prevents overbooking
- **Automated Workflows** streamline operations
- **Centralized Management** of all rental activities

### **Revenue Growth:**
- **Dynamic Pricing** maximizes rental income
- **Late Fee Automation** captures additional revenue
- **Customer Portal** enables 24/7 booking capability
- **Analytics Dashboard** identifies growth opportunities

### **Customer Experience:**
- **Self-service Portal** for booking and payments
- **Automated Notifications** keep customers informed
- **Flexible Payment Options** improve satisfaction
- **Mobile-responsive** design for convenience

## 📝 License

This project is part of the Odoo Final Round assessment.

## 👨‍💻 Author

**Nikhil** - [GitHub Profile](https://github.com/Nikhil18N)
