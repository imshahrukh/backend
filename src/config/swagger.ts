import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Salary & Project Management System API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the Salary and Project Management System. This system manages employees, projects, salaries, commissions, and provides detailed financial tracking.',
      contact: {
        name: 'API Support',
        email: 'support@company.com'
      },
      license: {
        name: 'Proprietary',
        url: 'https://company.com/license'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.company.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        Employee: {
          type: 'object',
          required: ['name', 'email', 'role', 'department', 'baseSalary'],
          properties: {
            _id: {
              type: 'string',
              description: 'Employee ID'
            },
            name: {
              type: 'string',
              description: 'Employee full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Employee email address'
            },
            role: {
              type: 'string',
              enum: ['Developer', 'PM', 'TeamLead', 'Manager', 'Bidder', 'Admin'],
              description: 'Employee role in the organization'
            },
            department: {
              type: 'string',
              description: 'Department ID reference'
            },
            techStack: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Technologies and skills'
            },
            baseSalary: {
              type: 'number',
              description: 'Monthly base salary'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Inactive'],
              description: 'Employment status'
            },
            projects: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of project IDs'
            }
          }
        },
        Project: {
          type: 'object',
          required: ['name', 'clientName', 'totalAmount', 'startDate', 'endDate'],
          properties: {
            _id: {
              type: 'string'
            },
            name: {
              type: 'string',
              description: 'Project name'
            },
            clientName: {
              type: 'string',
              description: 'Client company name'
            },
            totalAmount: {
              type: 'number',
              description: 'Total project value'
            },
            startDate: {
              type: 'string',
              format: 'date'
            },
            endDate: {
              type: 'string',
              format: 'date'
            },
            status: {
              type: 'string',
              enum: ['Active', 'Completed']
            },
            team: {
              type: 'object',
              properties: {
                developers: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                projectManager: {
                  type: 'string'
                },
                teamLead: {
                  type: 'string'
                },
                manager: {
                  type: 'string'
                },
                bidder: {
                  type: 'string'
                }
              }
            },
            bonusPool: {
              type: 'number',
              description: 'Total bonus amount for developers'
            },
            pmCommission: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['percentage', 'fixed']
                },
                amount: {
                  type: 'number'
                }
              }
            },
            teamLeadCommission: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['percentage', 'fixed']
                },
                amount: {
                  type: 'number'
                }
              }
            },
            managerCommission: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['percentage', 'fixed']
                },
                amount: {
                  type: 'number'
                }
              }
            },
            bidderCommission: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['percentage', 'fixed']
                },
                amount: {
                  type: 'number'
                }
              }
            }
          }
        },
        Salary: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            employee: {
              type: 'string',
              description: 'Employee ID reference'
            },
            month: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}$',
              description: 'Salary month in YYYY-MM format'
            },
            baseSalary: {
              type: 'number'
            },
            projectBonuses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string'
                  },
                  amount: {
                    type: 'number'
                  }
                }
              }
            },
            pmCommissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string'
                  },
                  amount: {
                    type: 'number'
                  }
                }
              }
            },
            managerCommissions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  project: {
                    type: 'string'
                  },
                  amount: {
                    type: 'number'
                  }
                }
              }
            },
            totalAmount: {
              type: 'number',
              description: 'Total salary amount'
            },
            status: {
              type: 'string',
              enum: ['Paid', 'Pending']
            },
            paidDate: {
              type: 'string',
              format: 'date-time'
            },
            paymentReference: {
              type: 'string'
            }
          }
        },
        CommissionConfig: {
          type: 'object',
          required: ['role', 'commissionType', 'commissionAmount'],
          properties: {
            _id: {
              type: 'string'
            },
            role: {
              type: 'string',
              enum: ['PM', 'TeamLead', 'Manager', 'Bidder'],
              description: 'Role for which commission is configured'
            },
            commissionType: {
              type: 'string',
              enum: ['percentage', 'fixed'],
              description: 'Type of commission calculation'
            },
            commissionAmount: {
              type: 'number',
              description: 'Commission percentage or fixed amount'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether this configuration is active'
            },
            description: {
              type: 'string'
            }
          }
        },
        Department: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Employees',
        description: 'Employee management endpoints'
      },
      {
        name: 'Projects',
        description: 'Project management and team assignment endpoints'
      },
      {
        name: 'Salaries',
        description: 'Salary calculation and management endpoints'
      },
      {
        name: 'Departments',
        description: 'Department management endpoints'
      },
      {
        name: 'Commission Config',
        description: 'Global commission configuration endpoints'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard metrics and analytics endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

