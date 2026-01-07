import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectHistory extends Document {
  project: mongoose.Types.ObjectId;
  changeType: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'TEAM_CHANGED' | 'CLOSED' | 'REOPENED';
  changedBy: mongoose.Types.ObjectId;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    description?: string;
  }[];
  snapshot: {
    name: string;
    status: string;
    totalAmount: number;
    team: {
      projectManager?: string;
      teamLead?: string;
      manager?: string;
      bidder?: string;
      developers: string[];
    };
  };
  notes?: string;
  createdAt: Date;
}

const projectHistorySchema = new Schema<IProjectHistory>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    changeType: {
      type: String,
      enum: ['CREATED', 'UPDATED', 'STATUS_CHANGED', 'TEAM_CHANGED', 'CLOSED', 'REOPENED'],
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changes: [
      {
        field: { type: String, required: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
        description: { type: String },
      },
    ],
    snapshot: {
      name: String,
      status: String,
      totalAmount: Number,
      team: {
        projectManager: String,
        teamLead: String,
        manager: String,
        bidder: String,
        developers: [String],
      },
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
projectHistorySchema.index({ project: 1, createdAt: -1 });
projectHistorySchema.index({ changeType: 1 });

const ProjectHistory = mongoose.model<IProjectHistory>('ProjectHistory', projectHistorySchema);

export default ProjectHistory;

