import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import PlannerApp from "@/features/planner/PlannerApp";

const ACCENT_COLOR = "#ff4499";

const Planner = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans selection:text-white transition-colors">
        <div className="fixed inset-0 z-0 bg-[linear-gradient(#f0f0f0_1px,transparent_1px),linear-gradient(90deg,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(#27272a_1px,transparent_1px),linear-gradient(90deg,#27272a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <main className="relative z-10 min-h-screen px-3 md:px-6 pt-6 pb-6" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth?redirect=%2Fplanner" replace />;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans selection:text-white transition-colors">
      <style>{`
        ::selection { background-color: ${ACCENT_COLOR}; color: white; }
        .hover-accent-shadow:hover { box-shadow: 4px 4px 0px 0px ${ACCENT_COLOR}; border-color: ${ACCENT_COLOR}; }
      `}</style>

      <div className="fixed inset-0 z-0 bg-[linear-gradient(#f0f0f0_1px,transparent_1px),linear-gradient(90deg,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(#27272a_1px,transparent_1px),linear-gradient(90deg,#27272a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="relative z-10 min-h-screen px-3 md:px-6 pt-6 pb-6">
        <div className="w-full max-w-none space-y-4">
          <div className="w-full min-h-[calc(100vh-3rem)]">
            <PlannerApp />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Planner;
