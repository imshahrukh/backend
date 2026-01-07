import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Employee from '../models/Employee';
import { ErrorResponse } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { IJWTPayload } from '../types';

/**
 * Generate JWT Token
 */
const generateToken = (payload: IJWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpire = process.env.JWT_EXPIRE || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload as any, jwtSecret, { expiresIn: jwtExpire } as any);
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role, employeeId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      next(new ErrorResponse('User already exists with this email', 400));
      return;
    }

    // If employeeId provided, validate employee exists
    if (employeeId) {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        next(new ErrorResponse('Employee not found', 404));
        return;
      }
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: role || 'Developer',
      employee: employeeId
    });

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      next(new ErrorResponse('Please provide email and password', 400));
      return;
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      next(new ErrorResponse('Invalid credentials', 401));
      return;
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      next(new ErrorResponse('Invalid credentials', 401));
      return;
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = await User.findById(authReq.user?.id).populate('employee');

    if (!user) {
      next(new ErrorResponse('User not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employee
      }
    });
  } catch (error) {
    next(error);
  }
};

