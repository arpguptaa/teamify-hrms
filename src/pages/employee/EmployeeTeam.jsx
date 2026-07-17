import { useAuth } from '../../context/AuthContext';
import OrgTree from '../../components/OrgTree';

export default function EmployeeTeam() {
  const { currentClient, currentEmployee } = useAuth();
  const employees = currentClient.org?.employees || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">My Team</h1>
        <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">
          Your reporting manager and everyone who reports up through you. You can't see above your manager.
        </p>
      </div>
      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
        <OrgTree employees={employees} scopeEmployeeId={currentEmployee.id} />
      </div>
    </div>
  );
}
