# 🤖 AI-Powered Smart Recommendations & Usage Insights

## Overview
This document describes the AI-powered recommendation system and usage insights feature that provides personalized product suggestions and detailed analytics to users based on their rental history.

## Features

### 🎯 Smart Recommendations (AI-Powered)

The system analyzes user behavior and rental patterns to provide intelligent product recommendations using a multi-strategy approach:

#### **Recommendation Strategies:**

1. **Similar Products (60% weight)**
   - Analyzes user's favorite categories
   - Recommends products from frequently rented categories
   - Match score: 90-100%
   - Example: "Similar to Cameras you rented 5 times"

2. **Complementary Products (30% weight)**
   - Suggests accessories and related items
   - Based on category relationships:
     - Cameras → Lenses, Accessories, Lighting
     - Drones → Accessories, Cameras
     - Lighting → Cameras, Accessories
     - Audio → Cameras, Accessories
   - Match score: 75-90%
   - Example: "Perfect companion for your Camera rentals"

3. **Trending Products (10% weight)**
   - Popular items among all users
   - High rental count products
   - Match score: 70-80%
   - Example: "Popular choice among other renters"

#### **Recommendation Algorithm:**
```typescript
function generateRecommendations(userHistory, limit) {
  // 1. Analyze user preferences from booking history
  const preferences = analyzeUserPreferences(userHistory);
  
  // 2. Get similar products (60%)
  const similar = getSimilarProducts(preferences, Math.ceil(limit * 0.6));
  
  // 3. Get complementary products (30%)
  const complementary = getComplementaryProducts(preferences, Math.ceil(limit * 0.3));
  
  // 4. Get trending products (10%)
  const trending = getTrendingProducts(Math.ceil(limit * 0.1));
  
  // 5. Combine and sort by match score
  return [...similar, ...complementary, ...trending]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
```

### 📊 Usage Insights & Analytics

Comprehensive analytics dashboard showing user's rental patterns:

#### **Key Metrics:**

1. **Total Spending**
   - Lifetime rental expenditure
   - Trend percentage (comparing recent vs historical)
   - Color: Green
   - Icon: DollarSign

2. **Total Bookings**
   - Number of products rented
   - Growth indicator
   - Color: Blue
   - Icon: Package

3. **Average Rental Duration**
   - Mean booking period in days
   - Duration trend
   - Color: Purple
   - Icon: Clock

4. **Favorite Category**
   - Most frequently rented category
   - Number of rentals in that category
   - Color: Orange
   - Icon: Star

5. **Monthly Average**
   - Average monthly spending
   - Spending trend
   - Color: Indigo
   - Icon: TrendingUp

6. **Member Status**
   - Loyalty tier based on spending:
     - Bronze: < ₹25,000
     - Silver: ₹25,000 - ₹50,000
     - Gold: > ₹50,000
   - Color: Yellow
   - Icon: Award

#### **Category Breakdown:**
- Visual progress bars showing rental distribution
- Percentage calculation per category
- Total spending per category
- Number of rentals per category

#### **Trend Analysis:**
- Compares last 30 days vs previous 30 days
- Bookings growth percentage
- Spending growth percentage

## API Endpoints

### **GET /api/recommendations**
Get AI-powered product recommendations

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of recommendations (default: 4)

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": 101,
        "name": "Nikon Z9",
        "sku": "CAM-NIK-Z9",
        "category": "Cameras",
        "baseRentalRate": 5500,
        "images": [...],
        "matchScore": 95,
        "reason": "Similar to Canon EOS R5 you rented 3 times"
      }
    ],
    "preferences": [...]
  }
}
```

### **GET /api/recommendations/usage-insights**
Get detailed usage insights and analytics

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBookings": 15,
    "totalSpent": 125000,
    "averageDuration": 3.5,
    "favoriteCategory": "Cameras",
    "monthlyAverage": 25000,
    "memberStatus": "Silver",
    "categoryBreakdown": [
      {
        "category": "Cameras",
        "count": 8,
        "totalAmount": 75000,
        "percentage": 53.3
      }
    ],
    "recentTrends": {
      "bookingsGrowth": 12.5,
      "spendingGrowth": 8.3
    }
  }
}
```

## Frontend Components

### **UserProfile.tsx**
Main profile page displaying all AI features

**Location:** `frontend/src/pages/UserProfile.tsx`

**Features:**
- User info card with gradient background
- 6 insight cards with icons and trends
- 4 AI-recommended products with match scores
- Recent rental history (last 5 bookings)
- Category breakdown with progress bars

**Key Sections:**

1. **User Info Card**
   - Avatar placeholder
   - Name, email, phone
   - Member since date
   - Member status badge

2. **Usage Insights Grid**
   - Responsive 3-column grid
   - Hover effects
   - Color-coded cards
   - Trend badges

3. **Smart Recommendations**
   - 4-column product grid
   - Match score badges
   - AI reasoning display
   - Quick rent buttons
   - Hover zoom effects

4. **Booking History**
   - List view with product images
   - Category badges
   - Date and duration display
   - Amount and status

5. **Category Breakdown**
   - Progress bars
   - Percentage calculations
   - Count and total amount

## Backend Implementation

### **recommendationController.ts**
Core recommendation logic

**Location:** `backend/src/controllers/recommendationController.ts`

**Key Methods:**

1. `getRecommendations()` - Main recommendation endpoint
2. `getUsageInsights()` - Analytics calculation
3. `analyzeUserPreferences()` - Preference analysis
4. `generateRecommendations()` - Multi-strategy recommendation
5. `getSimilarProducts()` - Category-based recommendations
6. `getComplementaryProducts()` - Accessory recommendations
7. `getTrendingProducts()` - Popular product recommendations
8. `calculateUsageInsights()` - Metrics calculation

### **Routes**
**File:** `backend/src/routes/recommendationRoutes.ts`

```typescript
router.get('/', authenticate, getRecommendations);
router.get('/usage-insights', authenticate, getUsageInsights);
```

## Database Schema

Uses existing entities:
- `BookingOrder` - User rental history
- `BookingOrderItem` - Individual rented products
- `Product` - Product catalog
- `Category` - Product categories
- `User` - Customer information

## UI/UX Features

### **Visual Design:**
- Gradient backgrounds (blue to purple)
- Color-coded metric cards
- Progress bars for categories
- Match score badges (green)
- AI sparkle icons (yellow/purple)
- Hover effects and transitions
- Responsive grid layouts

### **Icons:**
- DollarSign - Total spending
- Package - Total bookings
- Clock - Average duration
- Star - Favorite category
- TrendingUp - Monthly average
- Award - Member status
- Zap - Smart recommendations
- Sparkles - AI reasoning
- Target - Match score
- ShoppingCart - Quick rent

### **Color Scheme:**
```css
Green (spending): bg-green-50, text-green-600
Blue (bookings): bg-blue-50, text-blue-600
Purple (duration): bg-purple-50, text-purple-600
Orange (favorite): bg-orange-50, text-orange-600
Indigo (monthly): bg-indigo-50, text-indigo-600
Yellow (status): bg-yellow-50, text-yellow-600
```

## Navigation

### **Access Points:**

1. **Header Menu**
   - User avatar dropdown
   - "Profile" button → `/profile`

2. **Settings Page**
   - "Edit Profile" button → `/profile`

3. **Direct URL**
   - `/profile` (protected route)

## Testing

### **Test Cases:**

1. **New User (No History)**
   - Should show popular products
   - Zero metrics with "New" status
   - Empty category breakdown

2. **Active User**
   - Personalized recommendations
   - Accurate metrics calculation
   - Category preferences reflected

3. **Heavy User**
   - Gold member status
   - High match scores
   - Multiple category preferences

### **Manual Testing:**

1. Navigate to `/profile`
2. Verify user info displays correctly
3. Check all 6 insight cards render
4. Verify recommendations have match scores
5. Check AI reasoning is displayed
6. Verify booking history shows last 5
7. Check category breakdown percentages
8. Test "Rent" button on recommendations
9. Test "View All Products" link
10. Verify responsive layout on mobile

## Performance Considerations

### **Optimizations:**

1. **Recommendation Caching**
   - Cache user preferences for 1 hour
   - Invalidate on new booking

2. **Database Queries**
   - Indexed lookups on customerId
   - Limit results with `.take()`
   - Select only required fields

3. **Frontend Rendering**
   - Lazy load product images
   - Debounce API calls
   - Memoize calculations

4. **API Response Size**
   - Limit recommendations to 4
   - Paginate booking history
   - Optimize image URLs

## Future Enhancements

### **Phase 2 Features:**

1. **Machine Learning Integration**
   - TensorFlow.js for client-side predictions
   - Collaborative filtering
   - Time-series forecasting

2. **Advanced Analytics**
   - Spending predictions
   - Seasonal trend analysis
   - Peer comparison

3. **Personalization**
   - Save favorite products
   - Wishlist functionality
   - Email notifications for recommendations

4. **Social Features**
   - Share rental experiences
   - Review recommendations
   - Community insights

5. **A/B Testing**
   - Test recommendation strategies
   - Optimize match score algorithms
   - Measure conversion rates

## Security

### **Authentication:**
- JWT token required for all endpoints
- User ID extracted from token
- No cross-user data leakage

### **Authorization:**
- User can only view their own data
- Protected routes in frontend
- Middleware validation in backend

### **Data Privacy:**
- No PII in recommendations
- Anonymized trend analysis
- GDPR-compliant data usage

## Deployment

### **Environment Variables:**
```env
VITE_API_URL=http://localhost:3000/api
```

### **Build Steps:**
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### **Production Checklist:**
- [ ] Enable recommendation caching
- [ ] Set up analytics tracking
- [ ] Configure CDN for images
- [ ] Enable compression
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Enable HTTPS

## Monitoring & Metrics

### **Track:**
- Recommendation click-through rate
- Conversion from recommendation to rental
- Average match score
- API response times
- User engagement time on profile page
- Category distribution changes

### **Success Metrics:**
- CTR > 15%
- Conversion > 10%
- Page load < 2s
- API response < 500ms

---

## Summary

The AI-Powered Smart Recommendations feature provides:
✅ Personalized product suggestions based on rental history
✅ Multi-strategy recommendation algorithm
✅ Comprehensive usage analytics and insights
✅ Beautiful, responsive UI with gradient designs
✅ Real-time trend analysis
✅ Loyalty tier system
✅ Category-based intelligence
✅ Secure, authenticated API endpoints

This feature significantly enhances user experience by helping customers discover relevant products and understand their rental patterns.
