import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { LogIn, LogOut, ArrowLeft, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ACCENT_COLOR = "#ff4499";

const Auth = () => {
  const { signInWithGoogle, signOut, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && window.location.hash) {
      window.location.hash = "";
    }
  }, [isLoading, user]);

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans selection:text-white transition-colors">
      <Navbar showHomeLink useAbsolutePaths />

      {/* Style Injection */}
      <style>{`
        ::selection { background-color: ${ACCENT_COLOR}; color: white; }
        .hover-accent-shadow:hover { box-shadow: 4px 4px 0px 0px ${ACCENT_COLOR}; border-color: ${ACCENT_COLOR}; }
      `}</style>

      {/* Engineering Grid Background - Inverted */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(#f0f0f0_1px,transparent_1px),linear-gradient(90deg,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(#27272a_1px,transparent_1px),linear-gradient(90deg,#27272a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-lg space-y-6">
          {/* Back Button */}
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

          {/* Main Auth Container */}
          <div className="bg-card dark:bg-zinc-900 border-4 border-black dark:border-white p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden">

            {/* Decorative colored bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-black dark:bg-white" />

            <div className="mb-8 space-y-2">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter dark:text-white">
                Identify <br /> Yourself
              </h1>
              <p className="font-mono text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                Public visitors can view all stats without signing in. Login is restricted to the site owner for data entry.
              </p>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <div className="h-12 w-full bg-gray-100 dark:bg-zinc-800 animate-pulse border-2 border-gray-200 dark:border-zinc-700" />
              ) : user ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-zinc-800 border-2 border-black dark:border-white p-4 font-mono text-sm dark:text-gray-300">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Current Session</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-bold truncate">{user.email ?? user.id}</span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Button
                      type="button"
                      onClick={() => navigate("/stats")}
                      className="h-14 w-full bg-black dark:bg-white text-white dark:text-black hover:bg-[color:var(--accent)] dark:hover:bg-[color:var(--accent)] hover:text-white dark:hover:text-white rounded-none border-2 border-black dark:border-white font-bold uppercase tracking-widest text-lg shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] active:translate-y-1 active:shadow-none transition-all"
                      style={{ '--accent': ACCENT_COLOR } as React.CSSProperties}
                    >
                      <Terminal className="mr-2 h-5 w-5" />
                      Access Dashboard
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => signOut().catch(console.error)}
                      className="h-12 w-full bg-card dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Terminate Session
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 font-mono text-sm dark:text-yellow-100">
                    <p>
                      <strong>NOTE:</strong> If you are not Treyson, signing in will not grant you write permissions.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => signInWithGoogle().catch(console.error)}
                    disabled={isLoading}
                    className="h-14 w-full bg-card dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none border-2 border-black dark:border-white font-bold uppercase tracking-widest text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign in with Google
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="font-mono text-xs text-gray-400">SECURE_CONNECTION_ESTABLISHED</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
