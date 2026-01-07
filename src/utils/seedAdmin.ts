import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Department from '../models/Department';
import Employee from '../models/Employee';
import Project from '../models/Project';
import User from '../models/User';
import Salary from '../models/Salary';
import OnboardingRequest from '../models/OnboardingRequest';
import Settings from '../models/Settings';
import { EmployeeRole, EmployeeStatus } from '../types';

dotenv.config();

/**
 * Seed database with single admin user
 */
const seedAdminOnly = async () => {
  try {
    console.log('🌱 Starting admin-only database seeding...\n');

    // Connect to database
    await connectDatabase();

    // Clear ALL existing data
    console.log('🗑️  Clearing ALL existing data...');
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    await Salary.deleteMany({});
    await OnboardingRequest.deleteMany({});
    await Settings.deleteMany({});
    console.log('✅ All data cleared\n');

    // Create a single department for admin
    console.log('📁 Creating Admin department...');
    const adminDepartment = await Department.create({
      name: 'Administration',
      description: 'Administrative department'
    });
    console.log('✅ Created Admin department\n');

    // Create single admin employee
    console.log('👤 Creating admin employee...');
    const adminEmployee = await Employee.create({
      name: 'TriageAI Admin',
      email: 'triageai@info.com',
      role: EmployeeRole.ADMIN,
      department: adminDepartment._id as any,
      techStack: [],
      baseSalary: 0,
      status: EmployeeStatus.ACTIVE
    });
    console.log('✅ Created admin employee\n');

    // Create admin user for login
    console.log('🔐 Creating admin user...');
    const adminUser = new User({
      email: 'triageai@info.com',
      password: 'triageai@info.com',
      role: EmployeeRole.ADMIN,
      employee: adminEmployee._id as any
    });
    await adminUser.save();
    console.log('✅ Created admin user\n');

    // Create default settings
    console.log('⚙️  Creating application settings...');
    const settings = await Settings.create({
      usdToPkrRate: 271.2,
      pmCommissionPercentage: 10,
      teamLeadBonusAmount: 10000,
      bidderBonusAmount: 5000,
      lastUpdatedBy: (adminUser as any)._id,
    });
    console.log(`✅ Created application settings (USD to PKR: ${settings.usdToPkrRate})\n`);

    console.log('✅ Admin-only database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Departments: 1 (Administration)`);
    console.log(`   - Employees: 1 (Admin only)`);
    console.log(`   - Projects: 0`);
    console.log(`   - Salaries: 0`);
    console.log(`   - Settings: 1 (USD to PKR: ${settings.usdToPkrRate})`);
    console.log(`   - Users: 1\n`);
    console.log('🔑 Login Credentials:');
    console.log(`   Email: triageai@info.com`);
    console.log(`   Password: triageai@info.com\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedAdminOnly();

