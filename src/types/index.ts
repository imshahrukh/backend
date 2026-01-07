import { Document } from 'mongoose';

/**
 * Employee Roles
 */
export enum EmployeeRole {
  DEVELOPER = 'Developer',
  PM = 'PM',
  TEAM_LEAD = 'TeamLead',
  MANAGER = 'Manager',
  BIDDER = 'Bidder',
  ADMIN = 'Admin'
}

/**
 * Employee Status
 */
export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

/**
 * Project Status
 */
export enum ProjectStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed'
}

/**
 * Salary Payment Status
 */
export enum SalaryStatus {
  PAID = 'Paid',
  PENDING = 'Pending'
}

/**
 * Commission Type
 */
export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

/**
 * Commission Configuration Interface
 */
export interface ICommission {
  type: CommissionType;
  amount: number;
}

/**
 * Project Bonus Interface
 */
export interface IProjectBonus {
  project: string;
  amount: number;
}

/**
 * Employee Interface
 */
export interface IEmployee extends Document {
  name: string;
  email: string;
  role: EmployeeRole;
  department: string;
  techStack: string[];
  baseSalary: number;
  status: EmployeeStatus;
  projects: string[];
  onboardingData?: {
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    joiningDate?: Date;
    banking?: {
      bankName?: string;
      accountHolderName?: string;
      iban?: string;
      swiftCode?: string;
    };
    payoneer?: {
      email?: string;
      accountId?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Department Interface
 */
export interface IDepartment extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Team Interface
 */
export interface IProjectTeam {
  developers: string[];
  projectManager?: string;
  teamLead?: string;
  manager?: string;
  bidder?: string;
}

/**
 * Project Interface
 */
export interface IProject extends Document {
  name: string;
  clientName: string;
  totalAmount: number;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  team: IProjectTeam;
  bonusPool: number;
  pmCommission: ICommission;
  teamLeadCommission: ICommission;
  managerCommission: ICommission;
  bidderCommission: ICommission;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Salary Interface
 */
export interface ISalary extends Document {
  employee: string;
  month: string;
  baseSalary: number;
  projectBonuses: IProjectBonus[];
  pmCommissions: IProjectBonus[];
  managerCommissions: IProjectBonus[];
  totalAmount: number;
  status: SalaryStatus;
  paidDate?: Date;
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Monthly Project Revenue Interface
 */
export interface IMonthlyProjectRevenue extends Document {
  project: string;
  month: string;
  amountCollected: number;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Interface (for authentication)
 */
export interface IUser extends Document {
  email: string;
  password: string;
  role: EmployeeRole;
  employee?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * JWT Payload Interface
 */
export interface IJWTPayload {
  id: string;
  email: string;
  role: EmployeeRole;
}

/**
 * Request with User
 */
export interface IAuthRequest extends Request {
  user?: IJWTPayload;
}

