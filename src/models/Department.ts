import mongoose, { Schema } from 'mongoose';
import { IDepartment } from '../types';

/**
 * Department Schema
 */
const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true
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

const Department = mongoose.model<IDepartment>('Department', departmentSchema);

export default Department;

