import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminOverview } from "./components/admin/pages/AdminOverview";
import { AdminCredits } from "./components/admin/pages/AdminCredits";
import { AdminFormation } from "./components/admin/pages/AdminFormation";
import { AdminUIKit } from "./components/admin/pages/AdminUIKit";
import { ClientSavingsEnriched } from "./components/client/pages/ClientSavingsEnriched";
import { ClientSavingsCoach } from "./components/client/pages/ClientSavingsCoach";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminOverview },
      { path: "admin", Component: AdminOverview },
      { path: "admin/credits", Component: AdminCredits },
      { path: "admin/clients", Component: AdminOverview },
      { path: "admin/remboursements", Component: AdminOverview },
      { path: "admin/formation", Component: AdminFormation },
      { path: "admin/paiements", Component: AdminOverview },
      { path: "admin/settings", Component: AdminOverview },
      { path: "admin/audit", Component: AdminOverview },
      { path: "admin/ui-kit", Component: AdminUIKit },
    ],
  },
  {
    path: "/client",
    children: [
      { path: "savings", Component: ClientSavingsEnriched },
      { path: "savings-coach", Component: ClientSavingsCoach },
    ],
  },
]);
