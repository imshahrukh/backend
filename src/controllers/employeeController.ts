import { Request, Response, NextFunction } from 'express';
import Employee from '../models/Employee';
import { ErrorResponse } from '../middleware/errorHandler';

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Private
 */
export const getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, status, department, search } = req.query;

    const query: any = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .populate('projects', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee
 * @route   GET /api/employees/:id
 * @access  Private
 */
export const getEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('projects', 'name clientName');

    if (!employee) {
      next(new ErrorResponse('Employee not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create employee
 * @route   POST /api/employees
 * @access  Private
 */
export const createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee
 * @route   PUT /api/employees/:id
 * @access  Private
 */
export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('department', 'name').populate('projects', 'name');

    if (!employee) {
      next(new ErrorResponse('Employee not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 * @access  Private
 */
export const deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      next(new ErrorResponse('Employee not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

