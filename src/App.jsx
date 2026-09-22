import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/public/LoginPage';
import { NotFoundPage } from './pages/public/NotFoundPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CustomersPage } from './pages/crm/CustomersPage';
import { LeadsPage } from './pages/crm/LeadsPage';
import { TasksPage } from './pages/business/TasksPage';
import { InvoicesPage } from './pages/business/InvoicesPage';
import { SalesPage, AnalyticsPage, AIPage, AutomationPage, NotificationsPage, ProfilePage, SettingsPage } from './pages/system/PlaceholderPage';
import { OrganizationPage, EmployeesPage, TeamsPage, RolesPage } from './pages/organization/OrganizationPages';
import { Sidebar } from './components/common/Sidebar';
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <DashboardPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* CRM Routes */}
        <Route
          path="/crm/customers"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <CustomersPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/leads"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <LeadsPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Business Routes */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <TasksPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <InvoicesPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Sales & Analytics */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <SalesPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <AnalyticsPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* AI & Automation */}
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <AIPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/automation"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <AutomationPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Organization Routes */}
        <Route
          path="/organization"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <OrganizationPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/employees"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <EmployeesPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/teams"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <TeamsPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/roles"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <RolesPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* System Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <NotificationsPage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <ProfilePage />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div className="app-layout">
                <Sidebar />
                <SettingsPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Catch all - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
