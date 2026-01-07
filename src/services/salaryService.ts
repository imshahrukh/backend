import mongoose from 'mongoose';
import Salary from '../models/Salary';
import Employee from '../models/Employee';
import Project from '../models/Project';
import Settings from '../models/Settings';
import MonthlyProjectRevenue from '../models/MonthlyProjectRevenue';
import { IProjectBonus, CommissionType, EmployeeRole, ProjectStatus, EmployeeStatus } from '../types';

/**
 * Get current USD to PKR exchange rate from settings
 */
export const getExchangeRate = async (): Promise<number> => {
  const settings = await (Settings as any).getSettings();
  return settings.usdToPkrRate || 271.2; // Fallback to 271.2 if not set
};

/**
 * Convert USD to PKR using current exchange rate from settings
 */
export const usdToPkr = async (usdAmount: number): Promise<number> => {
  const rate = await getExchangeRate();
  return usdAmount * rate;
};

/**
 * Calculate commission based on type (percentage or fixed)
 * Note: totalAmount should be in PKR, commissionAmount is returned in PKR
 */
export const calculateCommission = (
  totalAmount: number,
  commissionType: CommissionType,
  commissionAmount: number
): number => {
  if (commissionType === CommissionType.PERCENTAGE) {
    return (totalAmount * commissionAmount) / 100;
  }
  return commissionAmount;
};

/**
 * Dynamically calculate bonuses and commissions for salaries based on active projects and monthly revenue
 * This is called at runtime when fetching salaries to ensure latest project data is used
 */
export const enrichSalariesWithProjectData = async (salaries: any[]): Promise<any[]> => {
  if (salaries.length === 0) return salaries;

  // Get exchange rate once for all calculations
  const exchangeRate = await getExchangeRate();

  // Get the month from the first salary (all salaries in the array should be for the same month)
  const month = salaries[0].month;

  // Get all monthly revenue entries for this month
  const monthlyRevenues = await MonthlyProjectRevenue.find({ month });
  const revenueMap = new Map(
    monthlyRevenues.map(rev => [String(rev.project), rev.amountCollected])
  );

  // Get all active projects with team members populated
  const activeProjects = await Project.find({ status: ProjectStatus.ACTIVE })
    .populate('team.developers team.projectManager team.teamLead team.manager team.bidder');

  // Enrich each salary with calculated bonuses and commissions
  const enrichedSalaries = salaries.map((salary) => {
    const salaryObj = salary.toObject ? salary.toObject() : salary;
    const employeeId = String(salaryObj.employee._id || salaryObj.employee);

    const projectBonuses: any[] = [];
    const pmCommissions: any[] = [];
    const managerCommissions: any[] = [];
    const teamLeadCommissions: any[] = [];
    const bidderCommissions: any[] = [];

    // Calculate bonuses and commissions from all active projects
    for (const project of activeProjects) {
      const projectId = String(project._id);
      
      // Get monthly revenue for this project (in USD)
      const monthlyRevenueUSD = revenueMap.get(projectId);
      
      // Skip this project if no revenue was collected this month
      if (!monthlyRevenueUSD || monthlyRevenueUSD === 0) {
        continue;
      }
      
      // Check if employee is a developer on this project
      const isDeveloper = project.team.developers.some(
        (dev: any) => String(dev._id) === employeeId
      );

      if (isDeveloper) {
        // Calculate developer bonus from bonus pool
        const developerCount = project.team.developers.length;
        const bonusAmount = calculateDeveloperBonus(project.bonusPool, developerCount);
        
        if (bonusAmount > 0) {
          projectBonuses.push({
            project: { _id: projectId, name: project.name },
            amount: bonusAmount
          });
        }
      }

      // Convert monthly revenue from USD to PKR for commission calculations
      const projectAmountPKR = monthlyRevenueUSD * exchangeRate;

      // Check if employee is PM on this project
      if (
        project.team.projectManager &&
        String((project.team.projectManager as any)._id) === employeeId
      ) {
        const commission = calculateCommission(
          projectAmountPKR,
          project.pmCommission.type,
          project.pmCommission.amount
        );

        if (commission > 0) {
          pmCommissions.push({
            project: { _id: projectId, name: project.name },
            amount: commission,
            commissionType: project.pmCommission.type,
            commissionRate: project.pmCommission.amount
          });
        }
      }

      // Check if employee is Team Lead on this project
      if (
        project.team.teamLead &&
        String((project.team.teamLead as any)._id) === employeeId
      ) {
        const commission = calculateCommission(
          projectAmountPKR,
          project.teamLeadCommission.type,
          project.teamLeadCommission.amount
        );

        if (commission > 0) {
          teamLeadCommissions.push({
            project: { _id: projectId, name: project.name },
            amount: commission,
            commissionType: project.teamLeadCommission.type,
            commissionRate: project.teamLeadCommission.amount
          });
        }
      }

      // Check if employee is Manager on this project
      if (
        project.team.manager &&
        String((project.team.manager as any)._id) === employeeId
      ) {
        const commission = calculateCommission(
          projectAmountPKR,
          project.managerCommission.type,
          project.managerCommission.amount
        );

        if (commission > 0) {
          managerCommissions.push({
            project: { _id: projectId, name: project.name },
            amount: commission,
            commissionType: project.managerCommission.type,
            commissionRate: project.managerCommission.amount
          });
        }
      }

      // Check if employee is Bidder on this project
      if (
        project.team.bidder &&
        String((project.team.bidder as any)._id) === employeeId
      ) {
        const commission = calculateCommission(
          projectAmountPKR,
          project.bidderCommission.type,
          project.bidderCommission.amount
        );

        if (commission > 0) {
          bidderCommissions.push({
            project: { _id: projectId, name: project.name },
            amount: commission,
            commissionType: project.bidderCommission.type,
            commissionRate: project.bidderCommission.amount
          });
        }
      }
    }

    // Calculate total amount
    let totalAmount = salaryObj.baseSalary;
    projectBonuses.forEach(b => totalAmount += b.amount);
    pmCommissions.forEach(c => totalAmount += c.amount);
    managerCommissions.forEach(c => totalAmount += c.amount);
    teamLeadCommissions.forEach(c => totalAmount += c.amount);
    bidderCommissions.forEach(c => totalAmount += c.amount);

    // Return enriched salary object
    return {
      ...salaryObj,
      projectBonuses,
      pmCommissions,
      managerCommissions,
      teamLeadCommissions,
      bidderCommissions,
      totalAmount
    };
  });

  return enrichedSalaries;
};

/**
 * Calculate bonus per developer from bonus pool
 */
export const calculateDeveloperBonus = (
  bonusPool: number,
  numberOfDevelopers: number
): number => {
  if (numberOfDevelopers === 0) return 0;
  return bonusPool / numberOfDevelopers;
};

/**
 * Get next month in YYYY-MM format
 */
export const getNextMonth = (currentMonth: string): string => {
  const [year, month] = currentMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() + 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
};

/**
 * Auto-generate salaries for next month if they don't exist
 */
export const autoGenerateNextMonthSalaries = async (): Promise<void> => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const nextMonth = getNextMonth(currentMonth);

    // Check if next month salaries already exist
    const existingSalaries = await Salary.find({ month: nextMonth });
    if (existingSalaries.length === 0) {
      // Generate salaries for next month
      await generateMonthlySalaries(nextMonth);
      console.log(`✅ Auto-generated salaries for ${nextMonth}`);
    }
  } catch (error: any) {
    // Silently fail if salaries already exist or other errors
    console.log(`ℹ️  Skipped auto-generation: ${error.message}`);
  }
};

/**
 * Update salaries when a project is added or modified
 * This recalculates bonuses and commissions for affected employees
 */
export const updateSalariesForProject = async (projectId: string): Promise<void> => {
  try {
    const project = await Project.findById(projectId)
      .populate('team.developers team.projectManager team.teamLead team.manager team.bidder');
    
    if (!project) {
      throw new Error('Project not found');
    }

    // Get current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get the project start month
    const projectStartDate = new Date(project.startDate);
    const projectMonth = `${projectStartDate.getFullYear()}-${String(projectStartDate.getMonth() + 1).padStart(2, '0')}`;

    // Use the later of the two months (current or project start)
    const targetMonth = projectMonth >= currentMonth ? projectMonth : currentMonth;

    // Collect all affected employee IDs
    const affectedEmployeeIds = new Set<string>();
    
    // Add developers
    project.team.developers.forEach((dev: any) => {
      affectedEmployeeIds.add(String(dev._id));
    });
    
    // Add other team members
    if (project.team.projectManager) {
      affectedEmployeeIds.add(String((project.team.projectManager as any)._id));
    }
    if (project.team.teamLead) {
      affectedEmployeeIds.add(String((project.team.teamLead as any)._id));
    }
    if (project.team.manager) {
      affectedEmployeeIds.add(String((project.team.manager as any)._id));
    }
    if (project.team.bidder) {
      affectedEmployeeIds.add(String((project.team.bidder as any)._id));
    }

    // Get or create salaries for affected employees for the target month
    for (const employeeId of affectedEmployeeIds) {
      await recalculateEmployeeSalary(employeeId, targetMonth);
    }

    console.log(`✅ Updated salaries for ${affectedEmployeeIds.size} employees for month ${targetMonth}`);
  } catch (error: any) {
    console.error(`❌ Error updating salaries for project: ${error.message}`);
    throw error;
  }
};

/**
 * Recalculate a single employee's salary for a specific month
 * Creates a new salary if it doesn't exist, or updates existing one
 */
export const recalculateEmployeeSalary = async (employeeId: string, month: string): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const employee = await Employee.findById(employeeId).session(session);
    if (!employee || employee.status !== EmployeeStatus.ACTIVE) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    // Get exchange rate for USD to PKR conversion
    const exchangeRate = await getExchangeRate();

    // Get all monthly revenue entries for this month
    const monthlyRevenues = await MonthlyProjectRevenue.find({ month }).session(session);
    const revenueMap = new Map(
      monthlyRevenues.map(rev => [String(rev.project), rev.amountCollected])
    );

    // Get all active projects
    const activeProjects = await Project.find({ status: ProjectStatus.ACTIVE })
      .populate('team.developers team.projectManager team.teamLead team.manager team.bidder')
      .session(session);

    const salaryData: any = {
      employee: employee._id,
      month,
      baseSalary: employee.baseSalary,
      projectBonuses: [],
      pmCommissions: [],
      managerCommissions: [],
      totalAmount: employee.baseSalary,
      status: 'Pending'
    };

    // Calculate bonuses and commissions from all projects
    for (const project of activeProjects) {
      const projectId = String(project._id);
      
      // Get monthly revenue for this project (in USD)
      const monthlyRevenueUSD = revenueMap.get(projectId);
      
      // Skip this project if no revenue was collected this month
      if (!monthlyRevenueUSD || monthlyRevenueUSD === 0) {
        continue;
      }
      
      // Convert monthly revenue from USD to PKR for commission calculations
      const projectAmountPKR = monthlyRevenueUSD * exchangeRate;
      
      // Developer bonuses
      const isDeveloper = project.team.developers.some(
        (dev: any) => String(dev._id) === String(employee._id)
      );

      if (isDeveloper && employee.role === EmployeeRole.DEVELOPER) {
        const developerCount = project.team.developers.length;
        const bonusAmount = calculateDeveloperBonus(project.bonusPool, developerCount);
        
        if (bonusAmount > 0) {
          salaryData.projectBonuses.push({
            project: projectId,
            amount: bonusAmount
          });
        }
      }

      // PM commissions
      if (
        project.team.projectManager &&
        String((project.team.projectManager as any)._id) === String(employee._id) &&
        employee.role === EmployeeRole.PM
      ) {
        const commission = calculateCommission(
          projectAmountPKR,
          project.pmCommission.type,
          project.pmCommission.amount
        );

        if (commission > 0) {
          salaryData.pmCommissions.push({
            project: projectId,
            amount: commission
          });
        }
      }

      // Manager commissions
      if (
        project.team.manager &&
        String((project.team.manager as any)._id) === String(employee._id) &&
        employee.role === EmployeeRole.MANAGER
      ) {
        const commission = calculateCommission(
          projectAmountPKR,
          project.managerCommission.type,
          project.managerCommission.amount
        );

        if (commission > 0) {
          salaryData.managerCommissions.push({
            project: projectId,
            amount: commission
          });
        }
      }
    }

    // Check if salary already exists for this employee and month
    const existingSalary = await Salary.findOne({ employee: employeeId, month }).session(session);

    if (existingSalary) {
      // Update existing salary
      existingSalary.projectBonuses = salaryData.projectBonuses;
      existingSalary.pmCommissions = salaryData.pmCommissions;
      existingSalary.managerCommissions = salaryData.managerCommissions;
      await existingSalary.save({ session } as any);
    } else {
      // Create new salary
      const salary = new Salary(salaryData);
      await salary.save({ session } as any);
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Generate salaries for all active employees for a specific month
 */
export const generateMonthlySalaries = async (month: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      throw new Error('Month must be in YYYY-MM format');
    }

    // Check if salaries already exist for this month
    const existingSalaries = await Salary.find({ month }).session(session);
    const existingEmployeeIds = existingSalaries.map(s => s.employee.toString());

    // Get all active employees who don't have salaries for this month yet
    const employees = await Employee.find({ 
      status: EmployeeStatus.ACTIVE,
      _id: { $nin: existingEmployeeIds }
    })
      .populate('projects')
      .session(session);

    if (employees.length === 0) {
      if (existingSalaries.length > 0) {
        await session.commitTransaction();
        session.endSession();
        return {
          success: true,
          count: 0,
          month,
          salaries: [],
          message: `All ${existingSalaries.length} active employees already have salaries for ${month}. No new salaries generated.`
        };
      }
      throw new Error('No active employees found');
    }

    const salaries = [];

    // Get exchange rate
    const exchangeRate = await getExchangeRate();

    // Get all monthly revenue entries for this month
    const monthlyRevenues = await MonthlyProjectRevenue.find({ month }).session(session);
    const revenueMap = new Map(
      monthlyRevenues.map(rev => [String(rev.project), rev.amountCollected])
    );

    // Get all active projects
    const activeProjects = await Project.find({ status: ProjectStatus.ACTIVE })
      .populate('team.developers team.projectManager team.manager')
      .session(session);

    for (const employee of employees) {
      const salaryData: any = {
        employee: employee._id,
        month,
        baseSalary: employee.baseSalary,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: employee.baseSalary,
        status: 'Pending'
      };

      // Calculate bonuses and commissions based on role
      for (const project of activeProjects) {
        const projectId = String(project._id);
        
        // Get monthly revenue for this project (in USD)
        const monthlyRevenueUSD = revenueMap.get(projectId);
        
        // Skip this project if no revenue was collected this month
        if (!monthlyRevenueUSD || monthlyRevenueUSD === 0) {
          continue;
        }
        
        // Convert monthly revenue from USD to PKR for commission calculations
        const projectAmountPKR = monthlyRevenueUSD * exchangeRate;
        
        // Check if employee is a developer on this project
        const isDeveloper = project.team.developers.some(
          (dev: any) => String(dev._id) === String(employee._id)
        );

        if (isDeveloper && employee.role === EmployeeRole.DEVELOPER) {
          // Calculate developer bonus
          const developerCount = project.team.developers.length;
          const bonusAmount = calculateDeveloperBonus(project.bonusPool, developerCount);
          
          if (bonusAmount > 0) {
            salaryData.projectBonuses.push({
              project: projectId,
              amount: bonusAmount
            });
          }
        }

        // Check if employee is PM on this project
        if (
          project.team.projectManager &&
          String((project.team.projectManager as any)._id) === String(employee._id) &&
          employee.role === EmployeeRole.PM
        ) {
          const commission = calculateCommission(
            projectAmountPKR,
            project.pmCommission.type,
            project.pmCommission.amount
          );

          if (commission > 0) {
            salaryData.pmCommissions.push({
              project: projectId,
              amount: commission
            });
          }
        }

        // Check if employee is Manager on this project
        if (
          project.team.manager &&
          String((project.team.manager as any)._id) === String(employee._id) &&
          employee.role === EmployeeRole.MANAGER
        ) {
          const commission = calculateCommission(
            projectAmountPKR,
            project.managerCommission.type,
            project.managerCommission.amount
          );

          if (commission > 0) {
            salaryData.managerCommissions.push({
              project: projectId,
              amount: commission
            });
          }
        }
      }

      // Salary model will auto-calculate totalAmount in pre-save hook
      const salary = new Salary(salaryData);
      await salary.save({ session } as any);
      salaries.push(salary);
    }

    await session.commitTransaction();
    session.endSession();

    const totalEmployees = existingSalaries.length + salaries.length;
    const message = existingSalaries.length > 0 
      ? `Generated ${salaries.length} new salaries for ${month}. ${existingSalaries.length} employees already had salaries. Total: ${totalEmployees} employees.`
      : `Generated ${salaries.length} salaries for ${month}`;

    return {
      success: true,
      count: salaries.length,
      month,
      salaries,
      existingCount: existingSalaries.length,
      totalCount: totalEmployees,
      message
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Calculate salary for a specific employee
 */
export const calculateEmployeeSalary = async (
  employeeId: string,
  month: string
): Promise<any> => {
  const employee = await Employee.findById(employeeId).populate('projects');

  if (!employee) {
    throw new Error('Employee not found');
  }

  let totalSalary = employee.baseSalary;
  const projectBonuses: IProjectBonus[] = [];
  const pmCommissions: IProjectBonus[] = [];
  const managerCommissions: IProjectBonus[] = [];

  // Get active projects
  const activeProjects = await Project.find({
    status: ProjectStatus.ACTIVE,
    $or: [
      { 'team.developers': employeeId },
      { 'team.projectManager': employeeId },
      { 'team.manager': employeeId }
    ]
  });

  for (const project of activeProjects) {
    // Convert project amount from USD to PKR for commission calculations
    const projectAmountPKR = await usdToPkr(project.totalAmount);
    
    // Developer bonus
    if (
      project.team.developers.includes(employeeId as any) &&
      employee.role === EmployeeRole.DEVELOPER
    ) {
      const bonus = calculateDeveloperBonus(
        project.bonusPool,
        project.team.developers.length
      );
      if (bonus > 0) {
        projectBonuses.push({
          project: project._id.toString(),
          amount: bonus
        });
        totalSalary += bonus;
      }
    }

    // PM commission
    if (
      project.team.projectManager?.toString() === employeeId &&
      employee.role === EmployeeRole.PM
    ) {
      const commission = calculateCommission(
        projectAmountPKR,
        project.pmCommission.type,
        project.pmCommission.amount
      );
      if (commission > 0) {
        pmCommissions.push({
          project: project._id.toString(),
          amount: commission
        });
        totalSalary += commission;
      }
    }

    // Manager commission
    if (
      project.team.manager?.toString() === employeeId &&
      employee.role === EmployeeRole.MANAGER
    ) {
      const commission = calculateCommission(
        projectAmountPKR,
        project.managerCommission.type,
        project.managerCommission.amount
      );
      if (commission > 0) {
        managerCommissions.push({
          project: project._id.toString(),
          amount: commission
        });
        totalSalary += commission;
      }
    }
  }

  return {
    employee: {
      id: employee._id,
      name: employee.name,
      role: employee.role
    },
    month,
    baseSalary: employee.baseSalary,
    projectBonuses,
    pmCommissions,
    managerCommissions,
    totalAmount: totalSalary
  };
};

/**
 * Get salary breakdown for a specific salary record
 */
export const getSalaryBreakdown = async (salaryId: string): Promise<any> => {
  const salary = await Salary.findById(salaryId)
    .populate('employee', 'name email role')
    .populate('projectBonuses.project', 'name clientName')
    .populate('pmCommissions.project', 'name clientName')
    .populate('managerCommissions.project', 'name clientName');

  if (!salary) {
    throw new Error('Salary record not found');
  }

  return {
    employee: salary.employee,
    month: salary.month,
    breakdown: {
      baseSalary: salary.baseSalary,
      projectBonuses: salary.projectBonuses,
      pmCommissions: salary.pmCommissions,
      managerCommissions: salary.managerCommissions,
      totalAmount: salary.totalAmount
    },
    status: salary.status,
    paidDate: salary.paidDate,
    paymentReference: salary.paymentReference
  };
};

