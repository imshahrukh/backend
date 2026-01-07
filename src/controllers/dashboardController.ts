import { Request, Response, NextFunction } from 'express';
import Employee from '../models/Employee';
import Salary from '../models/Salary';
import MonthlyProjectRevenue from '../models/MonthlyProjectRevenue';
import { EmployeeStatus, SalaryStatus } from '../types';

/**
 * @desc    Get dashboard metrics
 * @route   GET /api/dashboard/metrics
 * @access  Private
 */
export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month } = req.query;

    // Get current month if not provided
    const currentMonth = month || new Date().toISOString().slice(0, 7);

    // Total active employees
    const totalActiveEmployees = await Employee.countDocuments({ status: EmployeeStatus.ACTIVE });

    // Total paid salary for the month
    const paidSalariesAgg = await Salary.aggregate([
      {
        $match: {
          month: currentMonth,
          status: SalaryStatus.PAID
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Total pending salary for the month
    const pendingSalariesAgg = await Salary.aggregate([
      {
        $match: {
          month: currentMonth,
          status: SalaryStatus.PENDING
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Total project revenue collected for the selected month
    const projectPayout = await MonthlyProjectRevenue.aggregate([
      {
        $match: {
          month: currentMonth
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountCollected' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get actual salary records for tables
    const paidSalaries = await Salary.find({
      month: currentMonth,
      status: SalaryStatus.PAID
    })
      .populate({
        path: 'employee',
        select: 'name email role department',
        populate: { path: 'department', select: 'name' }
      })
      .populate('projectBonuses.project', 'name')
      .sort('-paidDate')
      .limit(10);

    const pendingSalaries = await Salary.find({
      month: currentMonth,
      status: SalaryStatus.PENDING
    })
      .populate({
        path: 'employee',
        select: 'name email role department',
        populate: { path: 'department', select: 'name' }
      })
      .populate('projectBonuses.project', 'name')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalActiveEmployees,
        totalPaidSalary: paidSalariesAgg[0]?.total || 0,
        totalPendingSalary: pendingSalariesAgg[0]?.total || 0,
        totalProjectPayout: projectPayout[0]?.total || 0,
        salaryOverview: {
          paid: paidSalaries,
          pending: pendingSalaries
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get salary overview
 * @route   GET /api/dashboard/salary-overview
 * @access  Private
 */
export const getSalaryOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month } = req.query;

    const currentMonth = month || new Date().toISOString().slice(0, 7);

    // Build match query
    const matchQuery: any = { month: currentMonth };

    // Paid salaries
    const paidSalaries = await Salary.find({
      ...matchQuery,
      status: SalaryStatus.PAID
    })
      .populate({
        path: 'employee',
        select: 'name email role department',
        populate: { path: 'department', select: 'name' }
      })
      .populate('projectBonuses.project', 'name')
      .sort('-paidDate');

    // Pending salaries
    const pendingSalaries = await Salary.find({
      ...matchQuery,
      status: SalaryStatus.PENDING
    })
      .populate({
        path: 'employee',
        select: 'name email role department',
        populate: { path: 'department', select: 'name' }
      })
      .populate('projectBonuses.project', 'name')
      .sort('-createdAt');

    // Department-wise breakdown
    const departmentBreakdown = await Salary.aggregate([
      {
        $match: { month: currentMonth }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData'
        }
      },
      {
        $unwind: '$employeeData'
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'employeeData.department',
          foreignField: '_id',
          as: 'departmentData'
        }
      },
      {
        $unwind: '$departmentData'
      },
      {
        $group: {
          _id: '$departmentData.name',
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        month: currentMonth,
        paid: {
          count: paidSalaries.length,
          total: paidSalaries.reduce((sum, s) => sum + s.totalAmount, 0),
          salaries: paidSalaries
        },
        pending: {
          count: pendingSalaries.length,
          total: pendingSalaries.reduce((sum, s) => sum + s.totalAmount, 0),
          salaries: pendingSalaries
        },
        departmentBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

