import { Request, Response, NextFunction } from 'express';
import CommissionConfig from '../models/CommissionConfig';
import { ErrorResponse } from '../middleware/errorHandler';

/**
 * @desc    Get all commission configurations
 * @route   GET /api/commission-config
 * @access  Private
 */
export const getCommissionConfigs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const configs = await CommissionConfig.find().sort('role');

    res.status(200).json({
      success: true,
      count: configs.length,
      data: configs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single commission configuration
 * @route   GET /api/commission-config/:id
 * @access  Private
 */
export const getCommissionConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await CommissionConfig.findById(req.params.id);

    if (!config) {
      next(new ErrorResponse('Commission configuration not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get commission configuration by role
 * @route   GET /api/commission-config/role/:role
 * @access  Private
 */
export const getCommissionConfigByRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await CommissionConfig.findOne({ role: req.params.role });

    if (!config) {
      next(new ErrorResponse(`Commission configuration for role ${req.params.role} not found`, 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update commission configuration
 * @route   POST /api/commission-config
 * @access  Private (Admin only)
 */
export const createOrUpdateCommissionConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, commissionType, commissionAmount, isActive, description } = req.body;

    // Check if config exists for this role
    let config = await CommissionConfig.findOne({ role });

    if (config) {
      // Update existing config
      config.commissionType = commissionType;
      config.commissionAmount = commissionAmount;
      config.isActive = isActive !== undefined ? isActive : config.isActive;
      if (description) config.description = description;
      await config.save();
    } else {
      // Create new config
      config = await CommissionConfig.create({
        role,
        commissionType,
        commissionAmount,
        isActive,
        description
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update commission configuration
 * @route   PUT /api/commission-config/:id
 * @access  Private (Admin only)
 */
export const updateCommissionConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await CommissionConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!config) {
      next(new ErrorResponse('Commission configuration not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete commission configuration
 * @route   DELETE /api/commission-config/:id
 * @access  Private (Admin only)
 */
export const deleteCommissionConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const config = await CommissionConfig.findByIdAndDelete(req.params.id);

    if (!config) {
      next(new ErrorResponse('Commission configuration not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Commission configuration deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Initialize default commission configurations
 * @route   POST /api/commission-config/initialize
 * @access  Private (Admin only)
 */
export const initializeCommissionConfigs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const defaultConfigs = [
      {
        role: 'PM',
        commissionType: 'percentage',
        commissionAmount: 10,
        isActive: true,
        description: 'Default commission for Project Managers'
      },
      {
        role: 'TeamLead',
        commissionType: 'percentage',
        commissionAmount: 5,
        isActive: true,
        description: 'Default commission for Team Leads'
      },
      {
        role: 'Manager',
        commissionType: 'percentage',
        commissionAmount: 8,
        isActive: true,
        description: 'Default commission for Managers'
      },
      {
        role: 'Bidder',
        commissionType: 'percentage',
        commissionAmount: 3,
        isActive: true,
        description: 'Default commission for Bidders who help win projects'
      }
    ];

    const configs = [];
    for (const configData of defaultConfigs) {
      const existing = await CommissionConfig.findOne({ role: configData.role });
      if (!existing) {
        const config = await CommissionConfig.create(configData);
        configs.push(config);
      }
    }

    res.status(201).json({
      success: true,
      count: configs.length,
      message: 'Default commission configurations initialized',
      data: configs
    });
  } catch (error) {
    next(error);
  }
};

