import { useUser } from "@/hooks/use-user";
import AdminView from "./AdminView";
import TeamLeadView from "./TeamLeadView";
import UserView from "./UserView";

import { Skeleton } from "@/components/ui/skeleton";

import AccountManagerView from "./AccountManagerView";

export default function UserDashboard() {
  const { currentUser } = useUser();
  const role = currentUser?.role;

  switch (role) {
    case "admin":
      return <AdminView />;
    case "team-lead":
      return <TeamLeadView />;
    case "account-manager":
      return <AccountManagerView />;
    case "user":
      return <UserView />;
    default:
      return (
        <div className="space-y-8 fade-in p-8">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 rounded-xl border bg-card">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      );
  }
}
