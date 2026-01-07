import mongoose, { Schema } from 'mongoose';
import { CommissionType } from '../types';

/**
 * Global Commission Configuration Interface
 */
export interface ICommissionConfig extends mongoose.Document {
  role: string; // PM, TeamLead, Manager, Bidder
  commissionType: CommissionType;
  commissionAmount: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Commission Configuration Schema
 * This stores global default commission rates for different roles
 */
const commissionConfigSchema = new Schema<ICommissionConfig>(
  {
    role: {
      type: String,
      required: [true, 'Role is required'],
      unique: true,
      enum: ['PM', 'TeamLead', 'Manager', 'Bidder']
    },
    commissionType: {
      type: String,
      enum: Object.values(CommissionType),
      required: [true, 'Commission type is required']
    },
    commissionAmount: {
      type: Number,
      required: [true, 'Commission amount is required'],
      min: [0, 'Commission amount cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const CommissionConfig = mongoose.model<ICommissionConfig>('CommissionConfig', commissionConfigSchema);

export default CommissionConfig;

