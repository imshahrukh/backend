import mongoose, { Schema } from 'mongoose';
import { ISalary, SalaryStatus } from '../types';

/**
 * Salary Schema
 */
const salarySchema = new Schema<ISalary>(
  {
    employee: {
      type: Schema.Types.ObjectId as any,
      ref: 'Employee',
      required: [true, 'Employee is required']
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
    },
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [0, 'Base salary cannot be negative']
    },
    projectBonuses: [{
      project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Bonus amount cannot be negative']
      }
    }],
    pmCommissions: [{
      project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Commission amount cannot be negative']
      }
    }],
    managerCommissions: [{
      project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Commission amount cannot be negative']
      }
    }],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    status: {
      type: String,
      enum: Object.values(SalaryStatus),
      default: SalaryStatus.PENDING
    },
    paidDate: {
      type: Date
    },
    paymentReference: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
salarySchema.index({ employee: 1, month: 1 }, { unique: true });
salarySchema.index({ status: 1 });
salarySchema.index({ month: 1 });

// Calculate total before saving
salarySchema.pre('save', function(this: ISalary) {
  let total = this.baseSalary;
  
  // Add all project bonuses
  this.projectBonuses.forEach((bonus: any) => {
    total += bonus.amount;
  });
  
  // Add all PM commissions
  this.pmCommissions.forEach((commission: any) => {
    total += commission.amount;
  });
  
  // Add all manager commissions
  this.managerCommissions.forEach((commission: any) => {
    total += commission.amount;
  });
  
  this.totalAmount = total;
});

const Salary = mongoose.model<ISalary>('Salary', salarySchema);

export default Salary;

