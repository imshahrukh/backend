import mongoose, { Schema, Document } from 'mongoose';

/**
 * Monthly Project Revenue Interface
 */
export interface IMonthlyProjectRevenue extends Document {
  project: string;
  month: string; // Format: YYYY-MM
  amountCollected: number; // Amount collected in USD
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Monthly Project Revenue Schema
 */
const monthlyProjectRevenueSchema = new Schema<IMonthlyProjectRevenue>(
  {
    project: {
      type: Schema.Types.ObjectId as any,
      ref: 'Project',
      required: [true, 'Project is required']
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
    },
    amountCollected: {
      type: Number,
      required: [true, 'Amount collected is required'],
      min: [0, 'Amount cannot be negative']
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId as any,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one entry per project per month
monthlyProjectRevenueSchema.index({ project: 1, month: 1 }, { unique: true });

// Indexes for queries
monthlyProjectRevenueSchema.index({ month: 1 });
monthlyProjectRevenueSchema.index({ project: 1 });

const MonthlyProjectRevenue = mongoose.model<IMonthlyProjectRevenue>(
  'MonthlyProjectRevenue',
  monthlyProjectRevenueSchema
);

export default MonthlyProjectRevenue;

