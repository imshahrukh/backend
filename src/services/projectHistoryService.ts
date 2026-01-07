import ProjectHistory from '../models/ProjectHistory';
import Employee from '../models/Employee';

interface ProjectData {
  _id?: string;
  name?: string;
  clientName?: string;
  totalAmount?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  team?: {
    projectManager?: any;
    teamLead?: any;
    manager?: any;
    bidder?: any;
    developers?: any[];
  };
  bonusPool?: number;
  pmCommission?: any;
  teamLeadCommission?: any;
  managerCommission?: any;
  bidderCommission?: any;
}

/**
 * Get employee name by ID
 */
const getEmployeeName = async (employeeId: any): Promise<string> => {
  if (!employeeId) return '';
  const id = typeof employeeId === 'string' ? employeeId : employeeId._id || employeeId;
  const employee = await Employee.findById(id);
  return employee?.name || 'Unknown';
};

/**
 * Get employee names from array of IDs
 */
const getEmployeeNames = async (employeeIds: any[]): Promise<string[]> => {
  if (!employeeIds || employeeIds.length === 0) return [];
  const names = await Promise.all(employeeIds.map((id) => getEmployeeName(id)));
  return names.filter((name) => name !== 'Unknown');
};

/**
 * Track project creation
 */
export const trackProjectCreation = async (
  projectId: string,
  projectData: ProjectData,
  userId: string
): Promise<void> => {
  try {
    const teamSnapshot = {
      projectManager: await getEmployeeName(projectData.team?.projectManager),
      teamLead: await getEmployeeName(projectData.team?.teamLead),
      manager: await getEmployeeName(projectData.team?.manager),
      bidder: await getEmployeeName(projectData.team?.bidder),
      developers: await getEmployeeNames(projectData.team?.developers || []),
    };

    await ProjectHistory.create({
      project: projectId,
      changeType: 'CREATED',
      changedBy: userId,
      changes: [
        {
          field: 'project',
          oldValue: null,
          newValue: projectData.name,
          description: 'Project created',
        },
      ],
      snapshot: {
        name: projectData.name || '',
        status: projectData.status || '',
        totalAmount: projectData.totalAmount || 0,
        team: teamSnapshot,
      },
    });
  } catch (error) {
    console.error('Error tracking project creation:', error);
  }
};

/**
 * Track project updates
 */
export const trackProjectUpdate = async (
  projectId: string,
  oldData: ProjectData,
  newData: ProjectData,
  userId: string
): Promise<void> => {
  try {
    const changes: any[] = [];
    let changeType: any = 'UPDATED';

    // Check status change
    if (oldData.status !== newData.status) {
      changes.push({
        field: 'status',
        oldValue: oldData.status,
        newValue: newData.status,
        description: `Status changed from "${oldData.status}" to "${newData.status}"`,
      });

      if (newData.status === 'Completed') {
        changeType = 'CLOSED';
      } else if (oldData.status === 'Completed' && newData.status === 'Active') {
        changeType = 'REOPENED';
      } else {
        changeType = 'STATUS_CHANGED';
      }
    }

    // Check basic field changes
    if (oldData.name !== newData.name) {
      changes.push({
        field: 'name',
        oldValue: oldData.name,
        newValue: newData.name,
        description: `Project name changed from "${oldData.name}" to "${newData.name}"`,
      });
    }

    if (oldData.clientName !== newData.clientName) {
      changes.push({
        field: 'clientName',
        oldValue: oldData.clientName,
        newValue: newData.clientName,
        description: `Client name changed from "${oldData.clientName}" to "${newData.clientName}"`,
      });
    }

    if (oldData.totalAmount !== newData.totalAmount) {
      changes.push({
        field: 'totalAmount',
        oldValue: oldData.totalAmount,
        newValue: newData.totalAmount,
        description: `Total amount changed from $${oldData.totalAmount} to $${newData.totalAmount}"`,
      });
    }

    // Check team changes
    const oldTeam = oldData.team || {};
    const newTeam = newData.team || {};

    const oldPM = oldTeam.projectManager?._id || oldTeam.projectManager;
    const newPM = newTeam.projectManager?._id || newTeam.projectManager;
    if (String(oldPM) !== String(newPM)) {
      const oldPMName = await getEmployeeName(oldPM);
      const newPMName = await getEmployeeName(newPM);
      changes.push({
        field: 'team.projectManager',
        oldValue: oldPMName,
        newValue: newPMName,
        description: `Project Manager changed from "${oldPMName}" to "${newPMName}"`,
      });
      if (changeType === 'UPDATED') changeType = 'TEAM_CHANGED';
    }

    const oldTL = oldTeam.teamLead?._id || oldTeam.teamLead;
    const newTL = newTeam.teamLead?._id || newTeam.teamLead;
    if (String(oldTL) !== String(newTL)) {
      const oldTLName = await getEmployeeName(oldTL);
      const newTLName = await getEmployeeName(newTL);
      changes.push({
        field: 'team.teamLead',
        oldValue: oldTLName,
        newValue: newTLName,
        description: `Team Lead changed from "${oldTLName}" to "${newTLName}"`,
      });
      if (changeType === 'UPDATED') changeType = 'TEAM_CHANGED';
    }

    const oldManager = oldTeam.manager?._id || oldTeam.manager;
    const newManager = newTeam.manager?._id || newTeam.manager;
    if (String(oldManager) !== String(newManager)) {
      const oldManagerName = await getEmployeeName(oldManager);
      const newManagerName = await getEmployeeName(newManager);
      changes.push({
        field: 'team.manager',
        oldValue: oldManagerName,
        newValue: newManagerName,
        description: `Manager changed from "${oldManagerName}" to "${newManagerName}"`,
      });
      if (changeType === 'UPDATED') changeType = 'TEAM_CHANGED';
    }

    const oldBidder = oldTeam.bidder?._id || oldTeam.bidder;
    const newBidder = newTeam.bidder?._id || newTeam.bidder;
    if (String(oldBidder) !== String(newBidder)) {
      const oldBidderName = await getEmployeeName(oldBidder);
      const newBidderName = await getEmployeeName(newBidder);
      changes.push({
        field: 'team.bidder',
        oldValue: oldBidderName,
        newValue: newBidderName,
        description: `Bidder changed from "${oldBidderName}" to "${newBidderName}"`,
      });
      if (changeType === 'UPDATED') changeType = 'TEAM_CHANGED';
    }

    // Check developers changes
    const oldDevIds = (oldTeam.developers || []).map((d: any) => String(d._id || d));
    const newDevIds = (newTeam.developers || []).map((d: any) => String(d._id || d));
    const addedDevs = newDevIds.filter((id) => !oldDevIds.includes(id));
    const removedDevs = oldDevIds.filter((id) => !newDevIds.includes(id));

    if (addedDevs.length > 0 || removedDevs.length > 0) {
      for (const devId of addedDevs) {
        const devName = await getEmployeeName(devId);
        changes.push({
          field: 'team.developers',
          oldValue: null,
          newValue: devName,
          description: `Developer "${devName}" added to project`,
        });
      }
      for (const devId of removedDevs) {
        const devName = await getEmployeeName(devId);
        changes.push({
          field: 'team.developers',
          oldValue: devName,
          newValue: null,
          description: `Developer "${devName}" removed from project`,
        });
      }
      if (changeType === 'UPDATED') changeType = 'TEAM_CHANGED';
    }

    // Only create history entry if there are changes
    if (changes.length > 0) {
      const teamSnapshot = {
        projectManager: await getEmployeeName(newTeam.projectManager),
        teamLead: await getEmployeeName(newTeam.teamLead),
        manager: await getEmployeeName(newTeam.manager),
        bidder: await getEmployeeName(newTeam.bidder),
        developers: await getEmployeeNames(newTeam.developers || []),
      };

      await ProjectHistory.create({
        project: projectId,
        changeType,
        changedBy: userId,
        changes,
        snapshot: {
          name: newData.name || '',
          status: newData.status || '',
          totalAmount: newData.totalAmount || 0,
          team: teamSnapshot,
        },
      });
    }
  } catch (error) {
    console.error('Error tracking project update:', error);
  }
};

/**
 * Get project history
 */
export const getProjectHistory = async (projectId: string): Promise<any[]> => {
  try {
    const history = await ProjectHistory.find({ project: projectId })
      .populate('changedBy', 'email')
      .sort({ createdAt: -1 });
    
    return history;
  } catch (error) {
    console.error('Error fetching project history:', error);
    return [];
  }
};

