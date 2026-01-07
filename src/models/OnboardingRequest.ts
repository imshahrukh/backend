import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingRequest extends Document {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Employment Information
  role: string;
  department: string;
  joiningDate: Date;
  baseSalary: number;
  techStack: string[];
  
  // Banking Information
  bankName: string;
  accountHolderName: string;
  iban: string;
  swiftCode?: string;
  
  // Payoneer Information (Optional)
  hasPayoneer: boolean;
  payoneerEmail?: string;
  payoneerAccountId?: string;
  
  // Request Status
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // Created Employee (if approved)
  employeeId?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const OnboardingRequestSchema = new Schema<IOnboardingRequest>(
  {
    // Personal Information
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: String,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    emergencyPhone: {
      type: String,
      trim: true,
    },
    
    // Employment Information
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['Developer', 'PM', 'TeamLead', 'Manager', 'Bidder', 'Admin'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
  baseSalary: {
    type: Number,
    required: false, // Will be set by admin during review
    min: [0, 'Base salary must be positive'],
    default: 0,
  },
    techStack: [{
      type: String,
      trim: true,
    }],
    
    // Banking Information
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
    },
    iban: {
      type: String,
      required: [true, 'IBAN is required'],
      trim: true,
    },
    swiftCode: {
      type: String,
      trim: true,
    },
    
    // Payoneer Information
    hasPayoneer: {
      type: Boolean,
      default: false,
    },
    payoneerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    payoneerAccountId: {
      type: String,
      trim: true,
    },
    
    // Request Status
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      trim: true,
    },
    
    // Created Employee
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
OnboardingRequestSchema.index({ email: 1 });
OnboardingRequestSchema.index({ status: 1 });
OnboardingRequestSchema.index({ createdAt: -1 });

export default mongoose.model<IOnboardingRequest>('OnboardingRequest', OnboardingRequestSchema);

