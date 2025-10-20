import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer'
}

export enum UserPermission {
  READ_ALL = 'read_all',
  WRITE_ALL = 'write_all',
  DELETE_ALL = 'delete_all',
  MANAGE_USERS = 'manage_users',
  READ_RENTALS = 'read_rentals',
  WRITE_RENTALS = 'write_rentals',
  DELETE_RENTALS = 'delete_rentals',
  MANAGE_CUSTOMERS = 'manage_customers',
  READ_OWN = 'read_own',
  WRITE_OWN = 'write_own',
  VIEW_REPORTS = 'view_reports',
  MANAGE_SETTINGS = 'manage_settings'
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  permissions: UserPermission[];
  googleId?: string;
  authProvider?: 'local' | 'google';
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): void;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function() {
        return this.authProvider === 'local' || !this.authProvider;
      },
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    phone: {
      type: String,
      maxlength: 20,
    },
    avatarUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    permissions: {
      type: [String],
      enum: Object.values(UserPermission),
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Indexes (email unique index already created via schema definition)
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Pre-save middleware to set default permissions
UserSchema.pre('save', function (next) {
  if (this.isNew && this.permissions.length === 0) {
    switch (this.role) {
      case UserRole.ADMIN:
        this.permissions = [
          UserPermission.READ_ALL,
          UserPermission.WRITE_ALL,
          UserPermission.DELETE_ALL,
          UserPermission.MANAGE_USERS,
          UserPermission.VIEW_REPORTS,
          UserPermission.MANAGE_SETTINGS,
        ];
        break;
      case UserRole.MANAGER:
        this.permissions = [
          UserPermission.READ_RENTALS,
          UserPermission.WRITE_RENTALS,
          UserPermission.MANAGE_CUSTOMERS,
          UserPermission.VIEW_REPORTS,
        ];
        break;
      case UserRole.CUSTOMER:
        this.permissions = [UserPermission.READ_OWN, UserPermission.WRITE_OWN];
        break;
    }
  }
  next();
});

// Instance Methods
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  this.loginAttempts += 1;

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts >= 5 && !this.isLocked()) {
    this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }

  await this.save();
};

UserSchema.methods.resetLoginAttempts = function (): void {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
};

// Static method to hash password
UserSchema.statics.hashPassword = async function (password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
