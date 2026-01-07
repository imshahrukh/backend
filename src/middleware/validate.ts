import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from './errorHandler';

/**
 * Validation middleware to check required fields
 */
export const validateFields = (requiredFields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      next(new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400));
      return;
    }

    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate date format (YYYY-MM)
 */
export const validateMonthFormat = (month: string): boolean => {
  const monthRegex = /^\d{4}-\d{2}$/;
  return monthRegex.test(month);
};

/**
 * Validate ObjectId
 */
export const validateObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

