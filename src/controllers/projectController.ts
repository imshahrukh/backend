import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';
import { ErrorResponse } from '../middleware/errorHandler';
import { assignEmployeesToProject, removeEmployeeFromProject } from '../services/projectService';
import { updateSalariesForProject } from '../services/salaryService';
import { trackProjectCreation, trackProjectUpdate, getProjectHistory } from '../services/projectHistoryService';
import { IAuthRequest } from '../types';

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('team.developers', 'name email role')
      .populate('team.projectManager', 'name email role')
      .populate('team.manager', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('team.developers', 'name email role')
      .populate('team.projectManager', 'name email role')
      .populate('team.manager', 'name email role');

    if (!project) {
      next(new ErrorResponse('Project not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await Project.create(req.body);

    // Track project creation in history
    const userId = (req as unknown as IAuthRequest).user?.id;
    if (userId) {
      trackProjectCreation(String(project._id), project.toObject() as any, userId).catch(err => {
        console.error('Failed to track project creation:', err.message);
      });
    }

    // Auto-update salaries for team members with project bonuses/commissions
    updateSalariesForProject(String(project._id)).catch(err => {
      console.error('Failed to auto-update salaries:', err.message);
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get old project data before updating
    const oldProject = await Project.findById(req.params.id)
      .populate('team.developers', '_id name')
      .populate('team.projectManager', '_id name')
      .populate('team.teamLead', '_id name')
      .populate('team.manager', '_id name')
      .populate('team.bidder', '_id name');

    if (!oldProject) {
      next(new ErrorResponse('Project not found', 404));
      return;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('team.developers', 'name email role')
      .populate('team.projectManager', 'name email role')
      .populate('team.teamLead', 'name email role')
      .populate('team.manager', 'name email role')
      .populate('team.bidder', 'name email role');

    if (!project) {
      next(new ErrorResponse('Project not found', 404));
      return;
    }

    // Track project update in history
    const userId = (req as unknown as IAuthRequest).user?.id;
    if (userId) {
      trackProjectUpdate(
        String(project._id),
        oldProject.toObject() as any,
        project.toObject() as any,
        userId
      ).catch(err => {
        console.error('Failed to track project update:', err.message);
      });
    }

    // Auto-update salaries for team members with project bonuses/commissions
    updateSalariesForProject(String(project._id)).catch(err => {
      console.error('Failed to auto-update salaries:', err.message);
    });

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      next(new ErrorResponse('Project not found', 404));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign employees to project
 * @route   POST /api/projects/:id/assign
 * @access  Private
 */
export const assignEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { developerIds, projectManagerId, managerId } = req.body;

    const project = await assignEmployeesToProject(
      req.params.id,
      developerIds || [],
      projectManagerId,
      managerId
    );

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove employee from project
 * @route   DELETE /api/projects/:id/remove/:employeeId
 * @access  Private
 */
export const removeEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await removeEmployeeFromProject(
      req.params.id,
      req.params.employeeId
    );

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project history
 * @route   GET /api/projects/:id/history
 * @access  Private
 */
export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const history = await getProjectHistory(req.params.id);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

