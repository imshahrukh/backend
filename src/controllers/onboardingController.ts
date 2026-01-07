import { Response, Request } from 'express';
import OnboardingRequest from '../models/OnboardingRequest';
import Employee from '../models/Employee';
import Department from '../models/Department';

/**
 * @swagger
 * /api/onboarding/submit:
 *   post:
 *     summary: Submit onboarding request (Public - No Auth Required)
 *     tags: [Onboarding]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Onboarding request submitted successfully
 */
export const submitOnboardingRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      emergencyContact,
      emergencyPhone,
      role,
      department,
      joiningDate,
      techStack,
      bankName,
      accountHolderName,
      iban,
      swiftCode,
      hasPayoneer,
      payoneerEmail,
      payoneerAccountId,
    } = req.body;

    // Check if email already exists in onboarding requests or employees
    const existingRequest = await OnboardingRequest.findOne({ email });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'An onboarding request with this email already exists',
      });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists',
      });
    }

    // Create onboarding request
    const onboardingRequest = await OnboardingRequest.create({
      name,
      email,
      phone,
      address,
      dateOfBirth,
      emergencyContact,
      emergencyPhone,
      role,
      department,
      joiningDate,
      baseSalary: 0, // Will be set by admin during review
      techStack: techStack || [],
      bankName,
      accountHolderName,
      iban,
      swiftCode,
      hasPayoneer: hasPayoneer || false,
      payoneerEmail,
      payoneerAccountId,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Onboarding request submitted successfully',
      data: onboardingRequest,
    });
  } catch (error: any) {
    console.error('Error submitting onboarding request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit onboarding request',
    });
  }
};

/**
 * @swagger
 * /api/onboarding/requests:
 *   get:
 *     summary: Get all onboarding requests (Admin only)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of onboarding requests
 */
export const getOnboardingRequests = async (req: any, res: Response): Promise<any> => {
  try {
    const { status } = req.query as any;
    
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const requests = await OnboardingRequest.find(filter)
      .populate('reviewedBy', 'email')
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('Error fetching onboarding requests:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch onboarding requests',
    });
  }
};

/**
 * @swagger
 * /api/onboarding/requests/{id}:
 *   get:
 *     summary: Get single onboarding request
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Onboarding request details
 */
export const getOnboardingRequest = async (req: any, res: Response): Promise<any> => {
  try {
    const request = await OnboardingRequest.findById((req as any).params.id)
      .populate('reviewedBy', 'email')
      .populate('employeeId', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error: any) {
    console.error('Error fetching onboarding request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch onboarding request',
    });
  }
};

/**
 * @swagger
 * /api/onboarding/requests/{id}:
 *   put:
 *     summary: Update onboarding request (Admin only)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Onboarding request updated
 */
export const updateOnboardingRequest = async (req: any, res: Response): Promise<any> => {
  try {
    const requestBody = req.body as any;
    const request = await OnboardingRequest.findById((req as any).params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding request not found',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'name', 'email', 'phone', 'address', 'dateOfBirth',
      'emergencyContact', 'emergencyPhone', 'role', 'department',
      'joiningDate', 'baseSalary', 'techStack', 'bankName',
      'accountHolderName', 'iban', 'swiftCode', 'hasPayoneer',
      'payoneerEmail', 'payoneerAccountId'
    ];

    allowedFields.forEach(field => {
      if (requestBody[field] !== undefined) {
        (request as any)[field] = requestBody[field];
      }
    });

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding request updated successfully',
      data: request,
    });
  } catch (error: any) {
    console.error('Error updating onboarding request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update onboarding request',
    });
  }
};

/**
 * @swagger
 * /api/onboarding/requests/{id}/approve:
 *   post:
 *     summary: Approve onboarding request and create employee
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Onboarding request approved
 */
export const approveOnboardingRequest = async (req: any, res: Response): Promise<any> => {
  try {
    const requestBody = req.body as any;
    const request = await OnboardingRequest.findById((req as any).params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding request not found',
      });
    }

    if (request.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been approved',
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email: request.email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists',
      });
    }

    // Find or create department
    let department = await Department.findOne({ name: request.department });
    if (!department) {
      department = await Department.create({
        name: request.department,
        description: `${request.department} Department`,
      });
    }

    // Use base salary from request body if provided, otherwise from request
    const baseSalary = requestBody.baseSalary !== undefined ? Number(requestBody.baseSalary) : request.baseSalary;
    
    // Update the request with the final base salary
    request.baseSalary = baseSalary;

    // Create employee with all onboarding information
    const employee = await Employee.create({
      name: request.name,
      email: request.email,
      role: request.role,
      department: department._id as any,
      techStack: request.techStack,
      baseSalary: baseSalary,
      status: 'Active',
      projects: [],
      onboardingData: {
        phone: request.phone,
        address: request.address,
        dateOfBirth: request.dateOfBirth,
        emergencyContact: request.emergencyContact,
        emergencyPhone: request.emergencyPhone,
        joiningDate: request.joiningDate,
        banking: {
          bankName: request.bankName,
          accountHolderName: request.accountHolderName,
          iban: request.iban,
          swiftCode: request.swiftCode,
        },
        payoneer: request.hasPayoneer ? {
          email: request.payoneerEmail,
          accountId: request.payoneerAccountId,
        } : undefined,
      },
    });

    // Delete the onboarding request after successful employee creation
    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Employee created successfully. Onboarding request has been processed and removed.',
      data: {
        employee,
      },
    });
  } catch (error: any) {
    console.error('Error approving onboarding request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve onboarding request',
    });
  }
};

/**
 * @swagger
 * /api/onboarding/requests/{id}/reject:
 *   post:
 *     summary: Reject onboarding request
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Onboarding request rejected
 */
export const rejectOnboardingRequest = async (req: any, res: Response): Promise<any> => {
  try {
    const requestBody = req.body as any;
    const request = await OnboardingRequest.findById((req as any).params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding request not found',
      });
    }

    if (request.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an approved request',
      });
    }

    request.status = 'Rejected';
    request.reviewedBy = req.user?.id as any;
    request.reviewedAt = new Date();
    request.reviewNotes = requestBody.reviewNotes || '';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding request rejected',
      data: request,
    });
  } catch (error: any) {
    console.error('Error rejecting onboarding request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject onboarding request',
    });
  }
};

/**
 * @swagger
 * /api/onboarding/requests/{id}:
 *   delete:
 *     summary: Delete onboarding request
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Onboarding request deleted
 */
export const deleteOnboardingRequest = async (req: any, res: Response): Promise<any> => {
  try {
    const request = await OnboardingRequest.findById((req as any).params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding request not found',
      });
    }

    // Allow deletion of any request (approved requests are auto-deleted during approval)
    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Onboarding request deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting onboarding request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete onboarding request',
    });
  }
};
