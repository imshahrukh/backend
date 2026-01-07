import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  // Currency Settings
  usdToPkrRate: number; // e.g., 278.50 (1 USD = 278.50 PKR)
  
  // Commission & Bonus Settings
  pmCommissionPercentage: number; // PM commission percentage
  teamLeadBonusAmount: number; // Team Lead bonus in PKR
  bidderBonusAmount: number; // Bidder bonus in PKR
  
  // Metadata
  lastUpdatedBy?: mongoose.Types.ObjectId; // Reference to User
  updatedAt: Date;
  createdAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    usdToPkrRate: {
      type: Number,
      required: [true, 'USD to PKR conversion rate is required'],
      min: [0, 'Conversion rate must be positive'],
      default: 278.50,
    },
    pmCommissionPercentage: {
      type: Number,
      required: [true, 'PM commission percentage is required'],
      min: [0, 'Commission percentage must be positive'],
      max: [100, 'Commission percentage cannot exceed 100%'],
      default: 10,
    },
    teamLeadBonusAmount: {
      type: Number,
      required: [true, 'Team Lead bonus amount is required'],
      min: [0, 'Bonus amount must be positive'],
      default: 10000, // PKR
    },
    bidderBonusAmount: {
      type: Number,
      required: [true, 'Bidder bonus amount is required'],
      min: [0, 'Bonus amount must be positive'],
      default: 5000, // PKR
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

export default Settings;


