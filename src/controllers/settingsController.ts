import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Settings from '../models/Settings';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc    Get application settings
 * @route   GET /api/settings
 * @access  Private
 */
export const getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await (Settings as any).getSettings();
    
    res.status(200).json({
      success: true,
      data: settings,
    });
    } catch (error: any) {
    next(error);
  }
};

/**
 * @desc    Update application settings
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({
        success: false,
        message: 'Request body is required',
      });
      return;
    }

    const { usdToPkrRate, pmCommissionPercentage, teamLeadBonusAmount, bidderBonusAmount } = req.body as {
      usdToPkrRate?: number;
      pmCommissionPercentage?: number;
      teamLeadBonusAmount?: number;
      bidderBonusAmount?: number;
    };

    // Validation
    if (usdToPkrRate !== undefined && usdToPkrRate <= 0) {
      res.status(400).json({
        success: false,
        message: 'USD to PKR rate must be positive',
      });
      return;
    }

    if (pmCommissionPercentage !== undefined && (pmCommissionPercentage < 0 || pmCommissionPercentage > 100)) {
      res.status(400).json({
        success: false,
        message: 'PM commission percentage must be between 0 and 100',
      });
      return;
    }

    if (teamLeadBonusAmount !== undefined && teamLeadBonusAmount < 0) {
      res.status(400).json({
        success: false,
        message: 'Team Lead bonus amount must be positive',
      });
      return;
    }

    if (bidderBonusAmount !== undefined && bidderBonusAmount < 0) {
      res.status(400).json({
        success: false,
        message: 'Bidder bonus amount must be positive',
      });
      return;
    }

    const authReq = req as AuthRequest;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        usdToPkrRate,
        pmCommissionPercentage,
        teamLeadBonusAmount,
        bidderBonusAmount,
        lastUpdatedBy: authReq.user?.id ? new mongoose.Types.ObjectId(authReq.user.id) : undefined,
      });
    } else {
      if (usdToPkrRate !== undefined) settings.usdToPkrRate = usdToPkrRate;
      if (pmCommissionPercentage !== undefined) settings.pmCommissionPercentage = pmCommissionPercentage;
      if (teamLeadBonusAmount !== undefined) settings.teamLeadBonusAmount = teamLeadBonusAmount;
      if (bidderBonusAmount !== undefined) settings.bidderBonusAmount = bidderBonusAmount;
      settings.lastUpdatedBy = authReq.user?.id ? new mongoose.Types.ObjectId(authReq.user.id) : undefined;
      
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error: any) {
    next(error);
  }
};

