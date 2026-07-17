import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import EmployeeManager from '../../components/EmployeeManager';

export default function EmployeeManage() {
  const { currentClient, currentEmployee } = useAuth();
  const { addEmployee, updateEmployee, removeEmployee, resetEmployeePassword } = useData();
  const employees = currentClient.org?.employees || [];

  if (currentEmployee.permissions?.['employee-management'] !== 'edit') {
    return <Navigate to="/employee/home" replace />;
  }

  return (
    <EmployeeManager
      client={currentClient}
      employees={employees}
      onAdd={(payload) => addEmployee(currentClient.id, payload)}
      onUpdate={(id, payload) => updateEmployee(currentClient.id, id, payload)}
      onRemove={(id) => removeEmployee(currentClient.id, id)}
      onResetPassword={(id, pw) => resetEmployeePassword(currentClient.id, id, pw)}
    />
  );
}
