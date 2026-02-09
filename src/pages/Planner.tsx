import { Component, ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import PlannerApp from "@/features/planner/PlannerApp";

const ACCENT_COLOR = "#ff4499";

class PlannerErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { hasError: true, errorMessage: message };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="border-2 border-black dark:border-white bg-card dark:bg-zinc-900 p-6 font-mono text-sm dark:text-gray-300">
        <p className="font-bold uppercase mb-2 text-black dark:text-white">Planner unavailable</p>
        <p className="mb-2">A backend auth/query error occurred while loading this page.</p>
        <p className="text-xs opacity-80 break-words">{this.state.errorMessage}</p>
      </div>
    );
  }
}

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
    return <Navigate to="/auth?redirect=%2Fplan" replace />;
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
            <PlannerErrorBoundary>
              <PlannerApp />
            </PlannerErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Planner;
