# 🏢 Rental Management System

A full-stack rental management application built with React, Node.js, Express, and MongoDB.

## ✨ Features

- 🔐 **Authentication System**: Secure JWT-based authentication with role-based access control
- 📊 **Dashboard**: Real-time statistics and analytics
- 📦 **Product Management**: Complete CRUD operations for rental products
- 👥 **Customer Management**: Manage customer information and profiles
- 📋 **Booking System**: Handle rental bookings and orders
- 💰 **Quotation System**: Create and manage quotations
- 🚀 **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Axios** for API requests
- **React Router** for navigation
- **shadcn/ui** components

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Rate Limiting** and **Helmet** for security

## 📋 Prerequisites

- **Node.js** 18+ 
- **MongoDB** (Local or MongoDB Atlas)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/rental-management-system.git
cd rental-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

**Backend .env Configuration:**
```env
# Database
MONGODB_URI=your_mongodb_connection_string
DB_NAME=rental_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file (optional - uses proxy in development)
cp .env.example .env
```

**Frontend .env Configuration:**
```env
# Leave empty for development (uses Vite proxy)
VITE_API_BASE_URL=

# For production, set your API URL
# VITE_API_BASE_URL=https://your-api-domain.com
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### 5. Default Login

```
Email: admin@test.com
Password: Admin123!
```

## 📁 Project Structure

```
rental-management-system/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── entities/       # Mongoose models
│   │   ├── middleware/     # Authentication & validation
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── main.tsx        # React entry point
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
└── README.md
```

## 🔧 Development

### Backend Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Frontend Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Option 1: Vercel (Frontend) + MongoDB Atlas (Database)

**Backend Deployment:**
1. Create account on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables from `.env.example`
4. Deploy

**Frontend Deployment:**
1. Create account on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/dist`
5. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.com`
6. Deploy

### Option 2: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Option 3: VPS Deployment

1. **Install dependencies on server:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone and setup:**
```bash
git clone https://github.com/YOUR_USERNAME/rental-management-system.git
cd rental-management-system

# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

3. **Use PM2 for process management:**
```bash
sudo npm install -g pm2
pm2 start backend/dist/server.js --name rental-api
pm2 startup
pm2 save
```

4. **Setup Nginx as reverse proxy**

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (using Mongoose)
- ✅ XSS protection

## 📝 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/profile           - Get user profile
PUT    /api/auth/profile           - Update profile
POST   /api/auth/change-password   - Change password
POST   /api/auth/logout            - Logout user
```

### Product Endpoints

```
GET    /api/products               - List all products
GET    /api/products/:id           - Get product by ID
POST   /api/products               - Create new product
PUT    /api/products/:id           - Update product
DELETE /api/products/:id           - Delete product
```

### Customer Endpoints

```
GET    /api/customers              - List all customers
GET    /api/customers/:id          - Get customer by ID
POST   /api/customers              - Create new customer
PUT    /api/customers/:id          - Update customer
DELETE /api/customers/:id          - Delete customer
```

### Dashboard Endpoints

```
GET    /api/dashboard/stats        - Get dashboard statistics
GET    /api/dashboard/recent-bookings  - Get recent bookings
GET    /api/dashboard/recent-activities - Get recent activities
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure MongoDB is running
- Check if port 3000 is available

### Frontend connection errors
- Clear browser cache (Ctrl + Shift + Delete)
- Check if backend is running on port 3000
- Verify `VITE_API_BASE_URL` in frontend `.env`

### Database connection issues
- Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)
- Check database user permissions
- Test connection string format

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with modern best practices
- MongoDB migration completed (TypeORM → Mongoose)
- Production-ready authentication system
- Responsive UI design

---

**Made with ❤️ for efficient rental management**
