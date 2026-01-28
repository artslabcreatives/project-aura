import { useUser } from "@/hooks/use-user";
import AdminView from "./AdminView";
import TeamLeadView from "./TeamLeadView";
import UserView from "./UserView";

import { Loading } from "@/components/Loading";

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
      return <Loading />;
  }
}
