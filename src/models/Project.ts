import mongoose, { Schema } from 'mongoose';
import { IProject, ProjectStatus, CommissionType } from '../types';

/**
 * Project Schema
 */
const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total project amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: false
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE
    },
    team: {
      developers: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
      }],
      projectManager: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
      },
      teamLead: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
      },
      manager: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
      },
      bidder: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
      }
    },
    bonusPool: {
      type: Number,
      default: 0,
      min: [0, 'Bonus pool cannot be negative']
    },
    pmCommission: {
      type: {
        type: String,
        enum: Object.values(CommissionType),
        default: CommissionType.PERCENTAGE
      },
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Commission amount cannot be negative']
      }
    },
    teamLeadCommission: {
      type: {
        type: String,
        enum: Object.values(CommissionType),
        default: CommissionType.PERCENTAGE
      },
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Commission amount cannot be negative']
      }
    },
    managerCommission: {
      type: {
        type: String,
        enum: Object.values(CommissionType),
        default: CommissionType.PERCENTAGE
      },
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Commission amount cannot be negative']
      }
    },
    bidderCommission: {
      type: {
        type: String,
        enum: Object.values(CommissionType),
        default: CommissionType.PERCENTAGE
      },
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Commission amount cannot be negative']
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });

// Validate end date is after start date (only if end date is provided)
projectSchema.pre('save', function(this: IProject) {
  if (this.endDate && this.endDate <= this.startDate) {
    throw new Error('End date must be after start date');
  }
});

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;

