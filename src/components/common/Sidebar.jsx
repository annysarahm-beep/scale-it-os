import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import './Sidebar.css';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = authService.getSession();

  if (!session) return null;

  const isActive = (path) => location.pathname.startsWith(path);

  // Menu items based on role
  const getMenuItems = () => {
    const role = session.role;
    const commonItems = [
      { label: 'Dashboard', path: '/dashboard', roles: ['*'] },
    ];

    const businessItems = [
      { label: 'CRM', path: '/crm', roles: ['Owner', 'Admin', 'Manager', 'Sales', 'Finance', 'Employee'] },
      { label: '  Customers', path: '/crm/customers', roles: ['Owner', 'Admin', 'Manager', 'Sales', 'Finance', 'Employee'] },
      { label: '  Leads', path: '/crm/leads', roles: ['Owner', 'Admin', 'Sales', 'Employee'] },
      { label: 'Sales', path: '/sales', roles: ['Owner', 'Admin', 'Sales'] },
      { label: 'Tasks', path: '/tasks', roles: ['Owner', 'Admin', 'Manager', 'Sales', 'Finance', 'Employee'] },
      { label: 'Invoices', path: '/invoices', roles: ['Owner', 'Admin', 'Finance'] },
    ];

    const organizationItems = [
      { label: 'Organization', path: '/organization', roles: ['Owner', 'Admin'] },
      { label: '  Employees', path: '/organization/employees', roles: ['Owner', 'Admin'] },
      { label: '  Teams', path: '/organization/teams', roles: ['Owner', 'Admin'] },
      { label: '  Roles', path: '/organization/roles', roles: ['Owner', 'Admin'] },
    ];

    const intelligenceItems = [
      { label: 'Analytics', path: '/analytics', roles: ['Owner', 'Admin', 'Manager'] },
      { label: 'AI Assistant', path: '/ai', roles: ['Owner', 'Admin', 'Manager'] },
      { label: 'Automation', path: '/automation', roles: ['Owner', 'Admin'] },
    ];

    const systemItems = [
      { label: 'Notifications', path: '/notifications', roles: ['*'] },
      { label: 'Profile', path: '/profile', roles: ['*'] },
      { label: 'Settings', path: '/settings', roles: ['*'] },
    ];

    const allItems = [...commonItems, ...businessItems, ...organizationItems, ...intelligenceItems, ...systemItems];
    return allItems.filter(item => item.roles.includes('*') || item.roles.includes(role));
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Scale IT OS</div>
        <div className="sidebar-user">
          <div className="user-name">{session.firstName} {session.lastName}</div>
          <div className="user-role">{session.role}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {getMenuItems().map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            style={{ paddingLeft: item.label.startsWith('  ') ? '2rem' : '1rem' }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </aside>
  );
}
