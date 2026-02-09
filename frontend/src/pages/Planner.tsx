import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft, Lock } from "lucide-react";
import { SignIn, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import PlannerApp from "@/features/planner/PlannerApp";

const ACCENT_COLOR = "#ff4499";

const Planner = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans selection:text-white transition-colors">
      <Navbar showHomeLink useAbsolutePaths />

      <style>{`
        ::selection { background-color: ${ACCENT_COLOR}; color: white; }
        .hover-accent-shadow:hover { box-shadow: 4px 4px 0px 0px ${ACCENT_COLOR}; border-color: ${ACCENT_COLOR}; }
      `}</style>

      <div className="fixed inset-0 z-0 bg-[linear-gradient(#f0f0f0_1px,transparent_1px),linear-gradient(90deg,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(#27272a_1px,transparent_1px),linear-gradient(90deg,#27272a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="relative z-10 min-h-screen px-6 pt-24 pb-12">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <div className="bg-card dark:bg-zinc-900 border-2 border-black dark:border-white p-15 group-hover:-translate-x-1 transition-transform">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back
          </button>

          <div className="bg-card dark:bg-zinc-900 border-4 border-black dark:border-white p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-black dark:bg-white" />

            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 border-2 border-black dark:border-white bg-background dark:bg-zinc-950 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] dark:text-white">
                <CalendarDays className="h-4 w-4" style={{ color: ACCENT_COLOR }} />
                Planner
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter dark:text-white">
                Plan the <br /> Week
              </h1>
              <p className="font-mono text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                Sign in to access the private planner.
              </p>
            </div>

            <SignedIn>
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-zinc-800 border-2 border-black dark:border-white p-4 font-mono text-sm dark:text-gray-300">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Session</p>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ACCENT_COLOR }} />
                    <div className="shrink-0">
                      <UserButton />
                    </div>
                    <span className="font-bold truncate">AUTHENTICATED</span>
                  </div>
                </div>

                <PlannerApp />
              </div>
            </SignedIn>

            <SignedOut>
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 font-mono text-sm dark:text-yellow-100 flex items-start gap-3">
                  <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    <strong>PRIVATE:</strong> Planner access requires signing in.
                  </p>
                </div>

                <div className="border-2 border-black dark:border-white bg-card dark:bg-zinc-900 p-4">
                  <SignIn afterSignInUrl="/planner" afterSignUpUrl="/planner" />
                </div>

                <Button
                  type="button"
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="h-12 w-full bg-card dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider"
                >
                  Use Auth Page
                </Button>
              </div>
            </SignedOut>
          </div>

          <div className="text-center">
            <p className="font-mono text-xs text-gray-400">PLANNER_ROUTE_ONLINE</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Planner;
