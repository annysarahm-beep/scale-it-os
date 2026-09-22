import './PlaceholderPage.css';

export function OrganizationPage() {
  return (
    <div className="page-container">
      <div className="placeholder-content">
        <h1>🏢 Organization</h1>
        <p>Manage your organization settings, teams, and members.</p>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <h3>Employees</h3>
            <p>Manage team members and roles</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👫</span>
            <h3>Teams</h3>
            <p>Organize teams and departments</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔐</span>
            <h3>Roles & Permissions</h3>
            <p>Define roles and access control</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚙️</span>
            <h3>Organization Settings</h3>
            <p>Configure organization details</p>
          </div>
        </div>
        <p className="coming-soon">🚀 Coming Soon</p>
      </div>
    </div>
  );
}

export function EmployeesPage() {
  return (
    <div className="page-container">
      <div className="placeholder-content">
        <h1>👥 Employees</h1>
        <p>Manage your team members and their roles.</p>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-icon">➕</span>
            <h3>Add Employee</h3>
            <p>Invite new team members</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✏️</span>
            <h3>Edit Profiles</h3>
            <p>Update employee information</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔑</span>
            <h3>Assign Roles</h3>
            <p>Set roles and permissions</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">❌</span>
            <h3>Deactivate Users</h3>
            <p>Remove team members</p>
          </div>
        </div>
        <p className="coming-soon">🚀 Coming Soon</p>
      </div>
    </div>
  );
}

export function TeamsPage() {
  return (
    <div className="page-container">
      <div className="placeholder-content">
        <h1>👫 Teams</h1>
        <p>Organize your employees into teams and departments.</p>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-icon">🆕</span>
            <h3>Create Team</h3>
            <p>Set up a new team or department</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👤</span>
            <h3>Add Members</h3>
            <p>Assign employees to teams</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👔</span>
            <h3>Team Lead</h3>
            <p>Designate team leaders</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <h3>Team Analytics</h3>
            <p>View team performance metrics</p>
          </div>
        </div>
        <p className="coming-soon">🚀 Coming Soon</p>
      </div>
    </div>
  );
}

export function RolesPage() {
  return (
    <div className="page-container">
      <div className="placeholder-content">
        <h1>🔐 Roles & Permissions</h1>
        <p>Define roles and manage access control.</p>
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-icon">⚙️</span>
            <h3>Manage Roles</h3>
            <p>Create and edit roles</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <h3>Permissions</h3>
            <p>Set detailed permissions</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👤</span>
            <h3>Assign Roles</h3>
            <p>Assign roles to employees</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <h3>Role Templates</h3>
            <p>Use predefined role templates</p>
          </div>
        </div>
        <p className="coming-soon">🚀 Coming Soon</p>
      </div>
    </div>
  );
}
