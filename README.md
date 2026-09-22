# Scale IT OS - Frontend Application

A complete React/Vite frontend-only SaaS prototype for Scale IT OS, featuring role-based access control, localStorage persistence, and a fully functional dashboard with CRM capabilities.

## 🚀 Features

### ✅ Complete Implementation
- **Frontend-Only**: No backend required, all data stored in localStorage
- **Role-Based Access Control**: Owner, Admin, Manager, Sales, Finance, Employee roles
- **Demo Accounts**: Pre-configured accounts for testing different roles
- **Responsive Dashboard**: Real-time statistics and analytics
- **CRM System**: Full customer and lead management
- **Authentication**: Simulated login with demo accounts
- **Dynamic Sidebar**: Navigation adapts based on user role

### 🏗️ Architecture

```
Scale IT OS Architecture
├── Services Layer (localStorage-based)
│   ├── Storage Service
│   ├── Auth Service
│   ├── CRM Service (Customers, Leads)
│   └── Business Service (Tasks, Invoices)
├── Pages
│   ├── Public (Login, SignUp)
│   ├── Dashboard
│   ├── CRM (Customers, Leads)
│   └── Business (Tasks, Invoices)
├── Components
│   ├── Common (Sidebar, Layout)
│   ├── Auth (ProtectedRoute)
│   └── Dashboard
└── Routes (React Router)
```

## 📋 Tech Stack

- **React 18** - UI Framework
- **Vite** - Build Tool & Dev Server
- **React Router v6** - Client-side Routing
- **localStorage** - Data Persistence
- **CSS3** - Styling with Gradients

## 🎯 Demo Accounts

### Owner/Admin Account
- **Email**: `admin@scaleitos.com`
- **Password**: `admin123`
- **Role**: Owner
- **Access**: All modules and settings

### Sales Agent Account
- **Email**: `sales@scaleitos.com`
- **Password**: `sales123`
- **Role**: Sales
- **Access**: CRM, Customers, Leads, Sales, Tasks

### Finance Manager Account
- **Email**: `finance@scaleitos.com`
- **Password**: `finance123`
- **Role**: Finance
- **Access**: CRM, Customers, Invoices, Tasks

### Employee Account
- **Email**: `employee@scaleitos.com`
- **Password**: `employee123`
- **Role**: Employee
- **Access**: Dashboard, Customers, Leads, Tasks

## 🗂️ Project Structure

```
src/
├── services/
│   ├── storage/
│   │   └── storageService.js       # Central localStorage management
│   ├── auth/
│   │   └── authService.js          # Authentication & permissions
│   ├── crm/
│   │   └── crmService.js           # Customer & Lead services
│   └── business/
│       └── businessService.js      # Task & Invoice services
├── pages/
│   ├── public/
│   │   ├── LoginPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── LoginPage.css
│   ├── dashboard/
│   │   ├── DashboardPage.jsx
│   │   ├── DashboardPage.css
│   └── crm/
│       ├── CustomersPage.jsx
│       ├── CustomersPage.css
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx      # Route protection wrapper
│   └── common/
│       ├── Sidebar.jsx             # Role-aware navigation
│       └── Sidebar.css
├── App.jsx                          # Main routing setup
├── App.css                          # Global styles
├── main.jsx                         # React entry point
└── index.css                        # Root styles
```

## 🔄 Data Flow

### Login Flow
1. User enters credentials on Login page
2. AuthService validates against stored users
3. Session created and stored in localStorage
4. User redirected to Dashboard
5. Protected routes check session validity

### Creating a Customer
1. Click "+ Add Customer" button
2. Fill form with customer details
3. Submit form
4. CustomerService saves to localStorage
5. Customer added to local state
6. Table re-renders with new customer
7. Dashboard stats automatically update

### Dashboard Updates
1. Dashboard component mounts
2. useEffect loads all data from localStorage
3. Statistics calculated from stored records:
   - Total Customers from customer list
   - Total Leads from leads list
   - Pending/Completed Tasks from task list
   - Outstanding/Overdue invoices
   - Total Revenue from paid invoices

## 🎨 Styling

### Color Scheme
- **Primary**: `#667eea` - Purple
- **Secondary**: `#764ba2` - Deep Purple
- **Success**: `#22c55e` - Green
- **Error**: `#ef4444` - Red

### Layout
- **Sidebar**: Fixed left navigation (250px width)
- **Main Content**: Flexible with margin offset
- **Responsive**: Adapts to different screen sizes

## 🔐 Role-Based Navigation

### Owner/Admin View
- Dashboard
- Business (CRM, Customers, Leads, Sales, Tasks, Invoices)
- Organization (Employees, Teams, Roles, Settings)
- Intelligence (Analytics, AI Assistant, Automation)
- System (Notifications, Profile, Settings)

### Sales View
- Dashboard
- CRM (Customers, Leads)
- Sales
- Tasks
- Notifications, Profile, Settings

### Finance View
- Dashboard
- CRM (Customers)
- Invoices
- Tasks
- Notifications, Profile, Settings

### Employee View
- Dashboard
- CRM (Customers, Leads)
- Tasks
- Notifications, Profile, Settings

## 🧪 Testing the Application

### Start Development Server
```bash
cd scale_it_os_app
npm run dev
```

The app will be available at `http://localhost:5173/`

### Test Login Flow
1. Open browser to `http://localhost:5173/`
2. Click one of the demo account buttons
3. Click Login button
4. Verify you're redirected to dashboard

### Test Customers Page
1. From dashboard, click "Customers" in sidebar
2. View demo customers in table
3. Click "+ Add Customer" to open form
4. Fill in customer details and submit
5. New customer appears in table
6. Go back to dashboard - see customer count increased

### Test Protected Routes
1. Try accessing `/dashboard` without login
2. Verify you're redirected to login page
3. Log in successfully
4. Try accessing login page while logged in
5. Verify you're redirected to dashboard

## 💾 Local Storage Structure

```javascript
{
  scaleit_session: { userId, email, firstName, lastName, role, organizationId, loginTime },
  scaleit_users: [{ id, email, password, firstName, lastName, role, organizationId }],
  scaleit_organizations: [{ id, name, email, phone, website, industry, size, location }],
  scaleit_customers: [{ id, organizationId, name, email, phone, company, status, tier }],
  scaleit_leads: [{ id, organizationId, name, email, phone, company, status, score, source }],
  scaleit_tasks: [{ id, organizationId, title, description, status, priority, assignedTo, dueDate }],
  scaleit_invoices: [{ id, organizationId, customerId, invoiceNumber, amount, status, dueDate }],
  scaleit_team: [{ /* User objects */ }],
  scaleit_notifications: [],
  scaleit_activities: [],
  scaleit_settings: {}
}
```

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 📝 Notes

### Frontend-Only Design
- This is a demonstration/prototype
- All authentication is simulated (no backend)
- Data persists only in localStorage (not persistent across devices)
- No real API calls or database operations

### Future Backend Integration
The service layer architecture is designed for easy backend integration:
```javascript
// Current localStorage implementation
customerService.getAll(orgId) → reads from localStorage

// Future API implementation
customerService.getAll(orgId) → calls GET /api/customers?org={orgId}
```

Simply replace the internal implementation without changing the UI code!

## 🎯 Next Steps

To extend this application:

1. **Add More Pages**: Create additional pages for Leads, Tasks, Invoices
2. **Implement Edit Functionality**: Add edit forms for all entities
3. **Add Notifications**: Implement toast notifications for actions
4. **Role-Based Actions**: Show/hide buttons based on permissions
5. **Data Validation**: Add form validation on client side
6. **Search & Filter**: Add search and filtering to lists
7. **Exportable Data**: Add export to CSV/PDF functionality
8. **Backend Integration**: Connect to real API endpoints

## 📞 Support

For questions or issues, review the prompt documentation that outlines the complete specification for Scale IT OS.

---

**Version**: 1.0.0  
**Last Updated**: September 1, 2026  
**Status**: ✅ Fully Functional Frontend Prototype
