# Migration from PostgreSQL to MongoDB Atlas - Complete Guide

## ✅ What Has Been Migrated

### 1. Database Configuration
- ✅ Removed TypeORM and PostgreSQL dependencies
- ✅ Created new Mongoose-based database configuration
- ✅ Updated environment variables for MongoDB Atlas

### 2. Data Models (Mongoose Schemas Created)
- ✅ User.model.ts
- ✅ UserProfile.model.ts  
- ✅ Category.model.ts
- ✅ Product.model.ts
- ✅ BookingOrder.model.ts
- ✅ Quotation.model.ts
- ✅ Payment.model.ts
- ✅ Enums (all status enums migrated)

### 3. Server Configuration
- ✅ Removed reflect-metadata import
- ✅ Updated to use MongoDB connection

### 4. Package Dependencies
- ✅ Removed: typeorm, pg, @types/pg, reflect-metadata, crypto
- ✅ Kept: mongoose (already installed)

## 🔧 Setup Instructions

### Step 1: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string

### Step 2: Update Environment Variables

Edit `backend/.env` file:

```env
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/rental_db?retryWrites=true&w=majority

# Other settings remain the same
PORT=3000
NODE_ENV=development
JWT_SECRET=hackathon_secret_key_2025_change_in_production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Update Controllers (Required)

All controllers need to be updated to use Mongoose instead of TypeORM. Here's the pattern:

#### TypeORM Pattern (OLD):
```typescript
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export class AuthController {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async someMethod() {
    // Find one
    const user = await this.userRepository.findOne({ where: { email } });
    
    // Create
    const user = this.userRepository.create({ name, email });
    await this.userRepository.save(user);
    
    // Update
    await this.userRepository.save(updatedUser);
    
    // Delete
    await this.userRepository.remove(user);
  }
}
```

#### Mongoose Pattern (NEW):
```typescript
import { UserModel, IUser } from '../models/User.model';
import bcrypt from 'bcryptjs';

export class AuthController {
  async someMethod() {
    // Find one
    const user = await UserModel.findOne({ email });
    
    // Create
    const user = new UserModel({ name, email, passwordHash });
    await user.save();
    
    // Update
    user.name = 'New Name';
    await user.save();
    // OR
    await UserModel.findByIdAndUpdate(userId, { name: 'New Name' });
    
    // Delete
    await UserModel.findByIdAndDelete(userId);
    // OR soft delete
    await UserModel.findByIdAndUpdate(userId, { isActive: false });
  }
}
```

### Key Differences:

| TypeORM | Mongoose |
|---------|----------|
| `user.id` (number) | `user._id` or `user.id` (ObjectId as string in JSON) |
| `this.userRepository.findOne({ where: { email } })` | `UserModel.findOne({ email })` |
| `this.userRepository.create()` then `save()` | `new Model()` then `save()` |
| `this.userRepository.save(user)` | `user.save()` or `Model.findByIdAndUpdate()` |
| `user.password = 'pwd'; await save()` (with @BeforeInsert) | Manual bcrypt: `passwordHash = await bcrypt.hash(password, 12)` |
| Relations loaded with `relations: ['profile']` | Use `.populate('userId')` or manual queries |

### Step 5: Example Controller Update

The `authController.ts` has been partially updated. Here's how to finish it:

For **login** method:
```typescript
async login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user with password - Mongoose automatically includes all fields
    const user = await UserModel.findOne({ email, isActive: true }).select('+passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if account is locked
    if (user.isLocked()) {
      res.status(423).json({
        success: false,
        message: 'Account temporarily locked'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Reset login attempts and update last login
    user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = jwtUtils.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });

    // User response (passwordHash is excluded in toJSON transform)
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: { accessToken, refreshToken, expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
```

## 📋 Controllers That Need Updating

The following controllers need to be updated to use Mongoose:

1. ✅ `authController.ts` - Partially updated (register method done)
2. ⏳ `authController.ts` - Complete all other methods
3. ⏳ `productController.ts`
4. ⏳ `bookingController.ts`
5. ⏳ `quotationController.ts`
6. ⏳ `customerController.ts`
7. ⏳ `dashboardController.ts`
8. ⏳ `categoryController.ts`
9. ⏳ `userProductController.ts`
10. ⏳ `marketplaceController.ts`

## 🚀 Running the Application

After setting up MongoDB Atlas connection string in `.env`:

```bash
# From the root directory
npm run dev
```

Or run frontend and backend separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🔍 Testing the Migration

1. **Test Database Connection**: Start the backend and check console for:
   ```
   ✅ MongoDB Connected Successfully
   📂 Database: rental_db
   🏠 Host: your-cluster.mongodb.net
   ```

2. **Test Registration**: 
   ```bash
   POST http://localhost:3000/api/auth/register
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "Password123!"
   }
   ```

3. **Test Login**:
   ```bash
   POST http://localhost:3000/api/auth/login
   {
     "email": "test@example.com",
     "password": "Password123!"
   }
   ```

## 📝 Additional Notes

- **ID Field**: MongoDB uses `_id` as ObjectId, but models are configured to return `id` in JSON responses
- **Timestamps**: `createdAt` and `updatedAt` are automatically managed by Mongoose
- **Validation**: Use mongoose schema validation or express-validator (already in use)
- **Indexes**: All important indexes have been added to schemas for performance
- **Relationships**: For now, use ObjectId references. Can add `.populate()` for related data

## ⚠️ Known Issues to Fix

1. All controller methods still reference `this.userRepository` - need to be updated
2. Entity files in `src/entities/` are no longer used (can be kept for reference)
3. Some controllers may have TypeORM-specific queries that need Mongoose equivalents
4. Middleware may need userId type changes (number → ObjectId string)

## 🎯 Next Steps

1. Update your MongoDB Atlas connection string in `.env`
2. Test the connection
3. Gradually update each controller following the pattern above
4. Test each endpoint after updating
5. Consider creating seed data for MongoDB

## 💡 Pro Tips

- Use MongoDB Compass to visualize your database
- Enable MongoDB Atlas monitoring for production
- Consider adding mongoose-paginate-v2 for pagination
- Use mongoose middleware for common operations (logging, soft deletes, etc.)
