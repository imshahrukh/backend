import { Request, Response, NextFunction } from 'express';
import Salary from '../models/Salary';
import { ErrorResponse } from '../middleware/errorHandler';
import { generateMonthlySalaries, calculateEmployeeSalary, getSalaryBreakdown, autoGenerateNextMonthSalaries, getNextMonth, recalculateEmployeeSalary, enrichSalariesWithProjectData } from '../services/salaryService';

/**
 * @desc    Get all salaries
 * @route   GET /api/salaries
 * @access  Private
 */
export const getSalaries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Auto-generate next month's salaries in the background
    autoGenerateNextMonthSalaries().catch(err => {
      console.log('Auto-generation skipped:', err.message);
    });

    const { status, month, employee, project } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (month) query.month = month;
    if (employee) query.employee = employee;
    if (project) {
      query.$or = [
        { 'projectBonuses.project': project },
        { 'pmCommissions.project': project },
        { 'managerCommissions.project': project }
      ];
    }

    const salaries = await Salary.find(query)
      .populate('employee', 'name email role department')
      .sort('-month');

    // Dynamically calculate bonuses and commissions from active projects
    const enrichedSalaries = await enrichSalariesWithProjectData(salaries);

    res.status(200).json({
      success: true,
      count: enrichedSalaries.length,
      data: enrichedSalaries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single salary
 * @route   GET /api/salaries/:id
 * @access  Private
 */
export const getSalary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const salary = await getSalaryBreakdown(req.params.id);

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate monthly salaries
 * @route   POST /api/salaries/generate
 * @access  Private
 */
export const generateSalaries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month } = req.body;

    if (!month) {
      next(new ErrorResponse('Month is required (format: YYYY-MM)', 400));
      return;
    }

    const result = await generateMonthlySalaries(month);

    // Auto-generate next month's salaries
    const nextMonth = getNextMonth(month);
    generateMonthlySalaries(nextMonth).then(() => {
      console.log(`✅ Auto-generated salaries for next month: ${nextMonth}`);
    }).catch(err => {
      console.log(`ℹ️  Next month (${nextMonth}) salaries already exist or skipped:`, err.message);
    });

    res.status(201).json({
      success: true,
      data: result,
      message: `Salaries generated for ${month}. Next month (${nextMonth}) will be generated automatically.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Recalculate salaries for a specific month
 * @route   POST /api/salaries/recalculate
 * @access  Private
 */
export const recalculateSalaries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month } = req.body;

    if (!month) {
      next(new ErrorResponse('Month is required (format: YYYY-MM)', 400));
      return;
    }

    // Get all salaries for the specified month
    const existingSalaries = await Salary.find({ month });
    
    if (existingSalaries.length === 0) {
      next(new ErrorResponse(`No salaries found for ${month}. Please generate salaries first.`, 404));
      return;
    }

    // Recalculate each employee's salary
    const employeeIds = existingSalaries.map(s => s.employee.toString());
    let recalculatedCount = 0;

    for (const employeeId of employeeIds) {
      try {
        await recalculateEmployeeSalary(employeeId, month);
        recalculatedCount++;
      } catch (error: any) {
        console.error(`Failed to recalculate salary for employee ${employeeId}:`, error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully recalculated ${recalculatedCount} out of ${employeeIds.length} salaries for ${month}`,
      data: {
        month,
        total: employeeIds.length,
        recalculated: recalculatedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update salary status
 * @route   PUT /api/salaries/:id/status
 * @access  Private
 */
export const updateSalaryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, paidDate, paymentReference } = req.body;

    const updateData: any = { status };

    if (status === 'Paid') {
      updateData.paidDate = paidDate || new Date();
      if (paymentReference) {
        updateData.paymentReference = paymentReference;
      }
    }

    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('employee', 'name email');

    if (!salary) {
      next(new ErrorResponse('Salary not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get employee salary history
 * @route   GET /api/salaries/employee/:employeeId
 * @access  Private
 */
export const getEmployeeSalaryHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const salaries = await Salary.find({ employee: req.params.employeeId })
      .populate('projectBonuses.project', 'name')
      .populate('pmCommissions.project', 'name')
      .populate('managerCommissions.project', 'name')
      .sort('-month');

    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate employee salary (preview)
 * @route   GET /api/salaries/calculate/:employeeId
 * @access  Private
 */
export const calculateSalary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month } = req.query;

    if (!month) {
      next(new ErrorResponse('Month query parameter is required', 400));
      return;
    }

    const salary = await calculateEmployeeSalary(req.params.employeeId, month as string);

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

