import { Request, Response, NextFunction } from 'express';
import MonthlyProjectRevenue from '../models/MonthlyProjectRevenue';
import Project from '../models/Project';
import { IAuthRequest } from '../types';

/**
 * @desc    Get all monthly revenues (optionally filtered by month)
 * @route   GET /api/monthly-revenues
 * @access  Private
 */
export const getMonthlyRevenues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month } = req.query;
    
    const query: any = {};
    if (month) {
      query.month = month;
    }

    const revenues = await MonthlyProjectRevenue.find(query)
      .populate('project', 'name clientName status totalAmount')
      .populate('createdBy', 'email')
      .sort({ month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: revenues.length,
      data: revenues
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @desc    Get monthly revenue by ID
 * @route   GET /api/monthly-revenues/:id
 * @access  Private
 */
export const getMonthlyRevenueById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const revenue = await MonthlyProjectRevenue.findById(req.params.id)
      .populate('project', 'name clientName status totalAmount')
      .populate('createdBy', 'email');

    if (!revenue) {
      res.status(404).json({
        success: false,
        message: 'Monthly revenue not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: revenue
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @desc    Get revenues for a specific month (with active projects that don't have entries)
 * @route   GET /api/monthly-revenues/month/:month
 * @access  Private
 */
export const getRevenuesByMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { month } = req.params; // Format: YYYY-MM

    // Get all existing revenues for this month
    const existingRevenues = await MonthlyProjectRevenue.find({ month })
      .populate('project', 'name clientName status totalAmount team')
      .sort({ createdAt: -1 });

    // Get all active projects
    const allProjects = await Project.find({ status: 'Active' })
      .populate('team.projectManager team.teamLead team.manager team.bidder', 'name email');

    // Create a set of project IDs that already have revenue entries
    const projectsWithRevenue = new Set(
      existingRevenues.map(rev => {
        const project = rev.project as any;
        return (typeof project === 'string' ? project : project._id).toString();
      })
    );

    // Find projects without revenue entries
    const projectsWithoutRevenue = allProjects.filter(
      project => !projectsWithRevenue.has(project._id.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        existingRevenues,
        projectsWithoutRevenue
      }
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @desc    Create monthly revenue
 * @route   POST /api/monthly-revenues
 * @access  Private (Admin only)
 */
export const createMonthlyRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { project, month, amountCollected, notes } = req.body;

    // Validate required fields
    if (!project || !month || amountCollected === undefined) {
      res.status(400).json({
        success: false,
        message: 'Please provide project, month, and amountCollected'
      });
      return;
    }

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Check if revenue entry already exists for this project and month
    const existingRevenue = await MonthlyProjectRevenue.findOne({ project, month });
    if (existingRevenue) {
      res.status(400).json({
        success: false,
        message: 'Revenue entry already exists for this project and month'
      });
      return;
    }

    const revenue = await MonthlyProjectRevenue.create({
      project,
      month,
      amountCollected,
      notes,
      createdBy: (req as unknown as IAuthRequest).user?.id
    });

    const populatedRevenue = await MonthlyProjectRevenue.findById(revenue._id)
      .populate('project', 'name clientName status totalAmount')
      .populate('createdBy', 'email');

    res.status(201).json({
      success: true,
      message: 'Monthly revenue created successfully',
      data: populatedRevenue
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @desc    Update monthly revenue
 * @route   PUT /api/monthly-revenues/:id
 * @access  Private (Admin only)
 */
export const updateMonthlyRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amountCollected, notes } = req.body;

    const revenue = await MonthlyProjectRevenue.findById(req.params.id);
    if (!revenue) {
      res.status(404).json({
        success: false,
        message: 'Monthly revenue not found'
      });
      return;
    }

    // Update fields
    if (amountCollected !== undefined) revenue.amountCollected = amountCollected;
    if (notes !== undefined) revenue.notes = notes;

    await revenue.save();

    const populatedRevenue = await MonthlyProjectRevenue.findById(revenue._id)
      .populate('project', 'name clientName status totalAmount')
      .populate('createdBy', 'email');

    res.status(200).json({
      success: true,
      message: 'Monthly revenue updated successfully',
      data: populatedRevenue
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @desc    Delete monthly revenue
 * @route   DELETE /api/monthly-revenues/:id
 * @access  Private (Admin only)
 */
export const deleteMonthlyRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const revenue = await MonthlyProjectRevenue.findById(req.params.id);
    
    if (!revenue) {
      res.status(404).json({
        success: false,
        message: 'Monthly revenue not found'
      });
      return;
    }

    await revenue.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Monthly revenue deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @desc    Bulk create/update monthly revenues
 * @route   POST /api/monthly-revenues/bulk
 * @access  Private (Admin only)
 */
export const bulkUpsertRevenues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { revenues } = req.body; // Array of { project, month, amountCollected, notes }

    if (!Array.isArray(revenues) || revenues.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide an array of revenues'
      });
      return;
    }

    const results = [];
    const errors = [];

    for (const revenueData of revenues) {
      try {
        const { project, month, amountCollected, notes } = revenueData;

        // Validate required fields
        if (!project || !month || amountCollected === undefined) {
          errors.push({ project, month, error: 'Missing required fields' });
          continue;
        }

        // Upsert (update if exists, create if not)
        const revenue = await MonthlyProjectRevenue.findOneAndUpdate(
          { project, month },
          {
            amountCollected,
            notes,
            createdBy: (req as unknown as IAuthRequest).user?.id
          },
          {
            new: true,
            upsert: true,
            runValidators: true
          }
        ).populate('project', 'name clientName status totalAmount');

        results.push(revenue);
      } catch (error: any) {
        errors.push({
          project: revenueData.project,
          month: revenueData.month,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.length} revenues successfully`,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    next(error);
  }
};

