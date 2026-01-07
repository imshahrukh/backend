import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Department from '../models/Department';
import Employee from '../models/Employee';
import Project from '../models/Project';
import User from '../models/User';
import Salary from '../models/Salary';
import OnboardingRequest from '../models/OnboardingRequest';
import Settings from '../models/Settings';
import { EmployeeRole, EmployeeStatus, ProjectStatus, CommissionType, SalaryStatus } from '../types';

dotenv.config();

/**
 * Seed database with real production data
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    await Salary.deleteMany({});
    await OnboardingRequest.deleteMany({});
    await Settings.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Departments
    console.log('📁 Creating departments...');
    const departments = await Department.insertMany([
      { name: 'Engineering', description: 'Software development and engineering' },
      { name: 'Design', description: 'UI/UX and graphic design' },
      { name: 'Management', description: 'Project and team management' },
      { name: 'Operations', description: 'Operations and administration' },
    ]);
    console.log(`✅ Created ${departments.length} departments\n`);

    // Create Employees - Based on screenshots
    console.log('👥 Creating employees...');
    const employees = await Employee.insertMany([
      // Paid Employees
      {
        name: 'Farhat',
        email: 'farhat@company.com',
        role: EmployeeRole.PM,
        department: departments[0]._id,
        techStack: ['React', 'Node.js', 'TypeScript'],
        baseSalary: 462000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Khuzima',
        email: 'khuzima@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['React', 'JavaScript'],
        baseSalary: 300000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Ali Abbas',
        email: 'aliabbas@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['Vue.js', 'Node.js'],
        baseSalary: 300000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Shazaib',
        email: 'shazaib@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['Python', 'Django'],
        baseSalary: 250000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Dawood',
        email: 'dawood@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['React', 'TypeScript'],
        baseSalary: 200000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Zain',
        email: 'zain@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['Angular', 'Node.js'],
        baseSalary: 100000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Hammad',
        email: 'hammad@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['React', 'JavaScript'],
        baseSalary: 62600,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Ali Shewar',
        email: 'alishewar@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['React Native', 'JavaScript'],
        baseSalary: 130000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Hamza',
        email: 'hamza@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['Flutter', 'Dart'],
        baseSalary: 210000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Adeel Shezad',
        email: 'adeelshezad@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['React', 'Node.js'],
        baseSalary: 200000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Abdul Wahab',
        email: 'abdulwahab@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['HTML', 'CSS', 'JavaScript'],
        baseSalary: 80000,
        status: EmployeeStatus.ACTIVE
      },
      // Pending Employees
      {
        name: 'Mohsin',
        email: 'mohsin@company.com',
        role: EmployeeRole.PM,
        department: departments[2]._id,
        techStack: ['Project Management'],
        baseSalary: 300000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Raheel',
        email: 'raheel@company.com',
        role: EmployeeRole.PM,
        department: departments[2]._id,
        techStack: ['Project Management'],
        baseSalary: 250000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Shahrukh',
        email: 'shahrukh@company.com',
        role: EmployeeRole.PM,
        department: departments[2]._id,
        techStack: ['Project Management'],
        baseSalary: 250000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Usama',
        email: 'usama@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['React', 'Node.js'],
        baseSalary: 200000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Amir',
        email: 'amir@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['Python', 'FastAPI'],
        baseSalary: 300000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Farhan',
        email: 'farhan@company.com',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['React', 'TypeScript'],
        baseSalary: 140000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Calm Kaj',
        email: 'calmkaj@company.com',
        role: EmployeeRole.MANAGER,
        department: departments[2]._id,
        techStack: ['Management'],
        baseSalary: 550000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Internet + Food',
        email: 'operations@company.com',
        role: EmployeeRole.ADMIN,
        department: departments[3]._id,
        techStack: [],
        baseSalary: 200000,
        status: EmployeeStatus.ACTIVE
      },
      // Bidders
      {
        name: 'Ahmed Khan',
        email: 'ahmedkhan@company.com',
        role: EmployeeRole.BIDDER,
        department: departments[2]._id,
        techStack: ['Bidding', 'Business Development'],
        baseSalary: 250000,
        status: EmployeeStatus.ACTIVE
      },
      {
        name: 'Sarah Ali',
        email: 'sarahali@company.com',
        role: EmployeeRole.BIDDER,
        department: departments[2]._id,
        techStack: ['Bidding', 'Sales'],
        baseSalary: 230000,
        status: EmployeeStatus.ACTIVE
      },
    ]);
    console.log(`✅ Created ${employees.length} employees\n`);

    // Create Projects - Based on exact project data (Projects are in USD)
    console.log('📊 Creating projects...');
    const projects = await Project.insertMany([
      {
        name: 'Dare',
        clientName: 'Client A',
        totalAmount: 2054.99262, // USD (PKR: 556903)
        startDate: new Date('2024-12-04'),
        endDate: new Date('2025-06-04'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[1]._id, employees[2]._id],
          projectManager: employees[0]._id, // Farhat
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'Loop',
        clientName: 'Client B',
        totalAmount: 1800, // USD (PKR: 488160)
        startDate: new Date('2024-12-04'),
        endDate: new Date('2025-05-04'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[3]._id, employees[4]._id],
          projectManager: employees[0]._id, // Farhat
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'UX palot',
        clientName: 'Client C',
        totalAmount: 2970, // USD (PKR: 805464)
        startDate: new Date('2024-12-05'),
        endDate: new Date('2025-06-05'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[5]._id, employees[6]._id],
          projectManager: employees[11]._id, // Mohsin
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'Blends Lab',
        clientName: 'Client D',
        totalAmount: 2500, // USD (PKR: 678000)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-07-01'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[7]._id],
          projectManager: employees[12]._id, // Raheel
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'Doctor Adam',
        clientName: 'Client E',
        totalAmount: 1000, // USD (PKR: 271200)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-04-01'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[8]._id],
          projectManager: employees[13]._id, // Shahrukh
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'Policy chat',
        clientName: 'Client F',
        totalAmount: 1600, // USD (PKR: 433920)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-05-01'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[9]._id],
          projectManager: employees[11]._id, // Mohsin
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'Jelly Vision',
        clientName: 'Client G',
        totalAmount: 3000, // USD (PKR: 813600)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-01'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[10]._id],
          projectManager: employees[11]._id, // Mohsin
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'Ramzay',
        clientName: 'Client H',
        totalAmount: 3100, // USD (PKR: 840720)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-01'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[14]._id],
          projectManager: employees[11]._id, // Mohsin
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'Emergent Tech',
        clientName: 'Client I',
        totalAmount: 1600, // USD (PKR: 433920)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-05-01'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[15]._id],
          projectManager: employees[11]._id, // Mohsin
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
      {
        name: 'Mechel + karl',
        clientName: 'Client J',
        totalAmount: 10000, // USD (PKR: 2712000)
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-01'),
        status: ProjectStatus.ACTIVE,
        team: {
          developers: [employees[16]._id],
          projectManager: employees[11]._id, // Mohsin
        },
        bonusPool: 0,
        pmCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 10
        },
        managerCommission: {
          type: CommissionType.PERCENTAGE,
          amount: 5
        }
      },
    ]);
    console.log(`✅ Created ${projects.length} projects\n`);

    // Update employees with project assignments
    console.log('🔗 Updating employee project assignments...');
    for (const project of projects) {
      const teamMembers: any[] = [...project.team.developers];
      if (project.team.projectManager) teamMembers.push(project.team.projectManager);

      await Employee.updateMany(
        { _id: { $in: teamMembers } },
        { $addToSet: { projects: project._id } }
      );
    }
    console.log('✅ Project assignments updated\n');

    // Create Users (for authentication)
    console.log('🔐 Creating users...');
    const user1 = new User({
      email: 'admin@company.com',
      password: 'admin123',
      role: EmployeeRole.ADMIN
    });
    const user2 = new User({
      email: 'farhat@company.com',
      password: 'password123',
      role: EmployeeRole.PM,
      employee: employees[0]._id
    });
    const user3 = new User({
      email: 'mohsin@company.com',
      password: 'password123',
      role: EmployeeRole.PM,
      employee: employees[11]._id
    });
    await Promise.all([user1.save(), user2.save(), user3.save()]);
    console.log('✅ Created 3 users (admin@company.com / admin123)\n');

    // Create Salaries - Based on provided data (Salaries are in PKR, USD conversion at 271.2 rate)
    console.log('💰 Creating salaries...');
    
    // Paid salaries with actual payment dates
    const paidSalaries = [
      {
        employee: employees[0]._id, // Farhat - 462000 PKR = 1705 USD
        month: '2026-03',
        baseSalary: 462000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 462000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-03-01')
      },
      {
        employee: employees[1]._id, // Khuzima - 300000 PKR = 1106 USD
        month: '2026-05',
        baseSalary: 300000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 300000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-05-01')
      },
      {
        employee: employees[2]._id, // Ali Abbas - 300000 PKR = 1106 USD
        month: '2026-05',
        baseSalary: 300000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 300000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-05-01')
      },
      {
        employee: employees[3]._id, // Shazaib - 250000 PKR = 922 USD
        month: '2026-05',
        baseSalary: 250000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 250000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-05-01')
      },
      {
        employee: employees[4]._id, // Dawood - 200000 PKR = 737 USD
        month: '2026-05',
        baseSalary: 200000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 200000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-05-01')
      },
      {
        employee: employees[5]._id, // Zain - 100000 PKR = 369 USD
        month: '2026-05',
        baseSalary: 100000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 100000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-05-01')
      },
      {
        employee: employees[6]._id, // Hammad - 62600 PKR = 231 USD
        month: '2026-05',
        baseSalary: 62600,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 62600,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-05-01')
      },
      {
        employee: employees[7]._id, // Ali Shewar - 130000 PKR = 479 USD
        month: '2026-05',
        baseSalary: 130000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 130000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-05-01')
      },
      {
        employee: employees[8]._id, // Hamza - 210000 PKR = 774 USD
        month: '2026-06',
        baseSalary: 210000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 210000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-06-01')
      },
      {
        employee: employees[9]._id, // Adeel Shezad - 200000 PKR = 737 USD
        month: '2026-06',
        baseSalary: 200000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 200000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-06-01')
      },
      {
        employee: employees[10]._id, // Abdul Wahab - 80000 PKR = 295 USD
        month: '2026-06',
        baseSalary: 80000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 80000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-06-01')
      },
    ];

    // Pending salaries for August 2025
    const pendingSalaries = [
      {
        employee: employees[11]._id, // Mohsin - 300000 PKR = 1106 USD
        month: '2025-08',
        baseSalary: 300000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 300000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[12]._id, // Raheel - 250000 PKR = 922 USD
        month: '2025-08',
        baseSalary: 250000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 250000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[13]._id, // Shahrukh - 250000 PKR = 922 USD
        month: '2025-08',
        baseSalary: 250000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 250000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[14]._id, // Usama - 200000 PKR = 737 USD
        month: '2025-08',
        baseSalary: 200000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 200000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[15]._id, // Amir - 300000 PKR = 1106 USD
        month: '2025-08',
        baseSalary: 300000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 300000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[16]._id, // Farhan - 140000 PKR = 516 USD
        month: '2025-08',
        baseSalary: 140000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 140000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[17]._id, // Calm Kaj - 550000 PKR = 2028 USD
        month: '2025-08',
        baseSalary: 550000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 550000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[18]._id, // Internet + Food - 200000 PKR = 737 USD
        month: '2025-08',
        baseSalary: 200000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 200000,
        status: SalaryStatus.PENDING,
      },
    ];

    // January 2026 salaries (current month - for dashboard display)
    const january2026Salaries = [
      // Paid salaries for January 2026
      {
        employee: employees[0]._id, // Farhat - 462000 PKR = 1705 USD
        month: '2026-01',
        baseSalary: 462000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 462000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[1]._id, // Khuzima - 300000 PKR = 1106 USD
        month: '2026-01',
        baseSalary: 300000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 300000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[2]._id, // Ali Abbas - 300000 PKR = 1106 USD
        month: '2026-01',
        baseSalary: 300000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 300000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[3]._id, // Shazaib - 250000 PKR = 922 USD
        month: '2026-01',
        baseSalary: 250000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 250000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[4]._id, // Dawood - 200000 PKR = 737 USD
        month: '2026-01',
        baseSalary: 200000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 200000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[5]._id, // Zain - 100000 PKR = 369 USD
        month: '2026-01',
        baseSalary: 100000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 100000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[6]._id, // Hammad - 62600 PKR = 231 USD
        month: '2026-01',
        baseSalary: 62600,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 62600,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[7]._id, // Ali Shewar - 130000 PKR = 479 USD
        month: '2026-01',
        baseSalary: 130000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 130000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[8]._id, // Hamza - 210000 PKR = 774 USD
        month: '2026-01',
        baseSalary: 210000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 210000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[9]._id, // Adeel Shezad - 200000 PKR = 737 USD
        month: '2026-01',
        baseSalary: 200000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 200000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      {
        employee: employees[10]._id, // Abdul Wahab - 80000 PKR = 295 USD
        month: '2026-01',
        baseSalary: 80000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 80000,
        status: SalaryStatus.PAID,
        paidDate: new Date('2026-01-05')
      },
      // Pending salaries for January 2026
      {
        employee: employees[11]._id, // Mohsin - 300000 PKR = 1106 USD
        month: '2026-01',
        baseSalary: 300000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 300000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[12]._id, // Raheel - 250000 PKR = 922 USD
        month: '2026-01',
        baseSalary: 250000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 250000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[13]._id, // Shahrukh - 250000 PKR = 922 USD
        month: '2026-01',
        baseSalary: 250000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 250000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[14]._id, // Usama - 200000 PKR = 737 USD
        month: '2026-01',
        baseSalary: 200000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 200000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[15]._id, // Amir - 300000 PKR = 1106 USD
        month: '2026-01',
        baseSalary: 300000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 300000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[16]._id, // Farhan - 140000 PKR = 516 USD
        month: '2026-01',
        baseSalary: 140000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 140000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[17]._id, // Calm Kaj - 550000 PKR = 2028 USD
        month: '2026-01',
        baseSalary: 550000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 550000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[18]._id, // Internet + Food - 200000 PKR = 737 USD
        month: '2026-01',
        baseSalary: 200000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 200000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[19]._id, // Ahmed Khan - 250000 PKR = 922 USD
        month: '2026-01',
        baseSalary: 250000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 250000,
        status: SalaryStatus.PENDING,
      },
      {
        employee: employees[20]._id, // Sarah Ali - 230000 PKR = 848 USD
        month: '2026-01',
        baseSalary: 230000,
        projectBonuses: [],
        pmCommissions: [],
        managerCommissions: [],
        totalAmount: 230000,
        status: SalaryStatus.PENDING,
      },
    ];

    await Salary.insertMany([...paidSalaries, ...pendingSalaries, ...january2026Salaries]);
    console.log(`✅ Created ${paidSalaries.length + pendingSalaries.length + january2026Salaries.length} salary records\n`);

    // Create Onboarding Requests
    console.log('📋 Creating onboarding requests...');
    const onboardingRequests = await OnboardingRequest.insertMany([
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+92-300-1234567',
        address: '123 Street, Lahore, Pakistan',
        dateOfBirth: '1995-03-15',
        emergencyContact: 'Michael Johnson',
        emergencyPhone: '+92-300-7654321',
        role: EmployeeRole.DEVELOPER,
        department: departments[0]._id,
        techStack: ['Python', 'Django', 'PostgreSQL'],
        joiningDate: new Date('2026-02-01'),
        baseSalary: 0,
        bankName: 'HBL',
        accountHolderName: 'Sarah Johnson',
        iban: 'PK36HABB0012345678901234',
        swiftCode: 'HABBPKKA',
        hasPayoneer: true,
        payoneerEmail: 'sarah.j@payoneer.com',
        payoneerAccountId: 'SJ123456',
        status: 'Pending',
      },
    ]);
    console.log(`✅ Created ${onboardingRequests.length} onboarding requests\n`);

    // Create Settings
    console.log('⚙️  Creating application settings...');
    const settings = await Settings.create({
      usdToPkrRate: 271.2, // 1 USD = 271.2 PKR (Exchange rate from project data)
      pmCommissionPercentage: 10, // 10% commission for PMs
      teamLeadBonusAmount: 10000, // 10,000 PKR bonus for Team Leads
      bidderBonusAmount: 5000, // 5,000 PKR bonus for Bidders
      lastUpdatedBy: user1._id, // Admin user
    });
    console.log(`✅ Created application settings (USD to PKR: ${settings.usdToPkrRate})\n`);

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Employees: ${employees.length}`);
    console.log(`   - Projects: ${projects.length}`);
    
    const totalSalaries = paidSalaries.length + pendingSalaries.length + 19; // 19 January 2026 records
    const totalPaid = paidSalaries.length + 11; // 11 paid in January 2026
    const totalPending = pendingSalaries.length + 8; // 8 pending in January 2026
    
    console.log(`   - Salaries: ${totalSalaries} (${totalPaid} paid, ${totalPending} pending)`);
    console.log(`   - Onboarding Requests: ${onboardingRequests.length}`);
    console.log(`   - Settings: 1 (USD to PKR: ${settings.usdToPkrRate})`);
    console.log(`   - Users: 3 (admin@company.com / admin123)\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
