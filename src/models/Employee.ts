import mongoose, { Schema } from 'mongoose';
import { IEmployee, EmployeeRole, EmployeeStatus } from '../types';

/**
 * Employee Schema
 */
const employeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    role: {
      type: String,
      enum: Object.values(EmployeeRole),
      required: [true, 'Role is required']
    },
    department: {
      type: Schema.Types.ObjectId as any,
      ref: 'Department',
      required: [true, 'Department is required']
    },
    techStack: {
      type: [String],
      default: []
    },
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [0, 'Base salary cannot be negative']
    },
    status: {
      type: String,
      enum: Object.values(EmployeeStatus),
      default: EmployeeStatus.ACTIVE
    },
    projects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }],
    onboardingData: {
      phone: String,
      address: String,
      dateOfBirth: String,
      emergencyContact: String,
      emergencyPhone: String,
      joiningDate: Date,
      banking: {
        bankName: String,
        accountHolderName: String,
        iban: String,
        swiftCode: String,
      },
      payoneer: {
        email: String,
        accountId: String,
      },
    }
  },
  {
    timestamps: true
  }
);

// Indexes
employeeSchema.index({ email: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ department: 1 });

const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);

export default Employee;

