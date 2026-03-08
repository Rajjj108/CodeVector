import { useLocation } from "react-router-dom";
import AppBackground from "./AppBackground";
import { StreakProvider } from "./layout/StreakContext";

/* Pages that should NOT show any shared nav chrome */
const NO_NAV_PATHS = ["/", "/signup"];

const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isEditorPage = pathname.startsWith("/editor");

  // Editor gets no nav chrome at all; Login/Signup also bare
  // All other pages (Dashboard, DsaTracker) embed PageHeader themselves
  void NO_NAV_PATHS; // kept for reference
  void isEditorPage;

  return (
    <StreakProvider>
      <div style={{ position: "relative", minHeight: "100vh" }}>
        {/* Fixed animated background — always present */}
        <AppBackground />

        {/* Page content — each page owns its own PageHeader */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </div>
    </StreakProvider>
  );
};

export default AppLayout;
