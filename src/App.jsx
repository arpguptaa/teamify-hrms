import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { RequireMaster, RequireClient, RequireEmployee } from './components/ProtectedRoute';

import Login from './pages/Login';
import PublicSignup from './pages/PublicSignup';

import MasterLayout from './pages/master/MasterLayout';
import Dashboard from './pages/master/Dashboard';
import SetupClient from './pages/master/SetupClient';
import ClientDatabase from './pages/master/ClientDatabase';
import PlanManagement from './pages/master/PlanManagement';
import SupportTickets from './pages/master/SupportTickets';
import MyAccount from './pages/master/MyAccount';

import ClientLayout from './pages/client/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ModulePlaceholder from './pages/client/ModulePlaceholder';
import ClientOrganisation from './pages/client/ClientOrganisation';
import ClientMyAccount from './pages/client/ClientMyAccount';
import ClientHelpdesk from './pages/client/ClientHelpdesk';

import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeHome from './pages/employee/EmployeeHome';
import EmployeeTeam from './pages/employee/EmployeeTeam';
import EmployeeManage from './pages/employee/EmployeeManage';
import EmployeeAccount from './pages/employee/EmployeeAccount';

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<PublicSignup />} />

              <Route path="/master" element={<RequireMaster><MasterLayout /></RequireMaster>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="setup-client" element={<SetupClient />} />
                <Route path="clients" element={<ClientDatabase />} />
                <Route path="plans" element={<PlanManagement />} />
                <Route path="support" element={<SupportTickets />} />
                <Route path="account" element={<MyAccount />} />
              </Route>

              <Route path="/client" element={<RequireClient><ClientLayout /></RequireClient>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="organisation" element={<ClientOrganisation />} />
                <Route path="account" element={<ClientMyAccount />} />
                <Route path="module/helpdesk" element={<ClientHelpdesk />} />
                <Route path="module/:moduleId" element={<ModulePlaceholder />} />
              </Route>

              <Route path="/employee" element={<RequireEmployee><EmployeeLayout /></RequireEmployee>}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<EmployeeHome />} />
                <Route path="team" element={<EmployeeTeam />} />
                <Route path="manage" element={<EmployeeManage />} />
                <Route path="account" element={<EmployeeAccount />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
