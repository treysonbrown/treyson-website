import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, Terminal } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SignIn, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const ACCENT_COLOR = "#ff4499";
const clerkAppearance = {
  elements: {
    rootBox: "w-full flex justify-center",
    card: "rounded-none border-2 border-black dark:border-white bg-card dark:bg-zinc-900 shadow-none",
    headerTitle:
      "font-black uppercase tracking-tighter text-2xl text-black dark:text-white",
    headerSubtitle: "font-mono text-sm text-gray-600 dark:text-gray-300",
    socialButtonsBlockButton:
      "rounded-none border-2 border-black dark:border-white bg-background dark:bg-zinc-950 text-black dark:text-white hover:bg-[#ff5cab]/10",
    socialButtonsBlockButtonText: "font-mono font-bold uppercase tracking-wider",
    dividerLine: "bg-black/20 dark:bg-white/20",
    dividerText: "font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400",
    formFieldLabel: "font-mono text-xs uppercase tracking-widest text-black dark:text-white",
    formFieldInput:
      "rounded-none border-2 border-black dark:border-white bg-background dark:bg-zinc-950 font-mono text-black dark:text-white shadow-none",
    formButtonPrimary:
      "rounded-none border-2 border-black dark:border-white bg-[#ff5cab] text-black hover:bg-[#ff78ba] font-mono font-bold uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(255,92,171,0.35)]",
    footer: "bg-transparent",
    footerAction: "hidden",
    footerActionText: "font-mono text-gray-600 dark:text-gray-300",
    footerActionLink:
      "font-mono font-bold uppercase tracking-wider text-black dark:text-white hover:text-[#ff5cab]",
    identityPreviewText: "font-mono text-gray-600 dark:text-gray-300",
    formResendCodeLink:
      "font-mono font-bold uppercase tracking-wider text-black dark:text-white hover:text-[#ff5cab]",
  },
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = useMemo(() => {
    const value = searchParams.get("redirect");
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
      return "/plan";
    }
    return value;
  }, [searchParams]);

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

      <main className="relative z-10 min-h-screen flex items-start justify-center px-6 pt-28 pb-10 md:pt-32">
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
                Sign In
              </h1>
            </div>

            <div className="space-y-6">
              <SignedIn>
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-zinc-800 border-2 border-black dark:border-white p-4 font-mono text-sm dark:text-gray-300">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Current Session</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <div className="shrink-0">
                        <UserButton />
                      </div>
                      <span className="font-bold truncate">AUTHENTICATED</span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Button
                      type="button"
                      onClick={() => navigate(redirectTo)}
                      className="h-14 w-full bg-black dark:bg-white text-white dark:text-black hover:bg-[color:var(--accent)] dark:hover:bg-[color:var(--accent)] hover:text-white dark:hover:text-white rounded-none border-2 border-black dark:border-white font-bold uppercase tracking-widest text-lg shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] active:translate-y-1 active:shadow-none transition-all"
                      style={{ '--accent': ACCENT_COLOR } as React.CSSProperties}
                    >
                      <Terminal className="mr-2 h-5 w-5" />
                      Continue
                    </Button>

                    <div className="h-12 w-full bg-card dark:bg-zinc-900 text-black dark:text-white rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Use the profile menu to sign out
                    </div>
                  </div>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <SignIn
                      appearance={clerkAppearance}
                      afterSignInUrl={redirectTo}
                      afterSignUpUrl={redirectTo}
                    />
                  </div>
                </div>
              </SignedOut>
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
