import mongoose from 'mongoose';
import Project from '../models/Project';
import Employee from '../models/Employee';
import { ErrorResponse } from '../middleware/errorHandler';

/**
 * Assign employees to a project
 */
export const assignEmployeesToProject = async (
  projectId: string,
  developerIds: string[],
  projectManagerId?: string,
  managerId?: string
): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const project = await Project.findById(projectId).session(session);

    if (!project) {
      throw new ErrorResponse('Project not found', 404);
    }

    // Validate all employees exist
    const allEmployeeIds = [
      ...developerIds,
      ...(projectManagerId ? [projectManagerId] : []),
      ...(managerId ? [managerId] : [])
    ];

    const employees = await Employee.find({
      _id: { $in: allEmployeeIds }
    }).session(session);

    if (employees.length !== allEmployeeIds.length) {
      throw new ErrorResponse('One or more employees not found', 404);
    }

    // Update project team
    project.team.developers = developerIds as any;
    if (projectManagerId) {
      project.team.projectManager = projectManagerId as any;
    }
    if (managerId) {
      project.team.manager = managerId as any;
    }

    await project.save({ session });

    // Update employees' projects array
    await Employee.updateMany(
      { _id: { $in: allEmployeeIds } },
      { $addToSet: { projects: projectId } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return await Project.findById(projectId).populate('team.developers team.projectManager team.manager');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Remove employee from project
 */
export const removeEmployeeFromProject = async (
  projectId: string,
  employeeId: string
): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const project = await Project.findById(projectId).session(session);

    if (!project) {
      throw new ErrorResponse('Project not found', 404);
    }

    // Remove from developers
    project.team.developers = project.team.developers.filter(
      (dev: any) => dev.toString() !== employeeId
    );

    // Remove from PM
    if (project.team.projectManager?.toString() === employeeId) {
      project.team.projectManager = undefined;
    }

    // Remove from manager
    if (project.team.manager?.toString() === employeeId) {
      project.team.manager = undefined;
    }

    await project.save({ session });

    // Remove project from employee's projects array
    await Employee.findByIdAndUpdate(
      employeeId,
      { $pull: { projects: projectId } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return project;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

