import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import EmployeeManager from '../../components/EmployeeManager';

export default function ClientOrganisation() {
  const { currentClient } = useAuth();
  const { addEmployee, updateEmployee, removeEmployee, resetEmployeePassword } = useData();
  const employees = currentClient.org?.employees || [];

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
