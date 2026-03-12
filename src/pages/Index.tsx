import { MouseEvent, useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Github, Linkedin, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import LifeControlBar from "@/components/LifeControlBar";
import HeroLifeGrid from "@/components/HeroLifeGrid";
import { extractSectionId, scrollToSection } from "@/utils/scrollToSection";

// --- CONFIGURATION ---
const ACCENT_COLOR = "#ff4499";
const CELL_SIZE = 40; // Must match HeroLifeGrid cell size
const homeNavItems = [
  { label: "Directory", to: "/directory" },
  { label: "Contact", to: "#contact" },
];

const Index = () => {
  const isAdmin = false;
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Accessibility: respect reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Conway's Game of Life state
  const [isLifeMode, setIsLifeMode] = useState(false);
  const [isLifeRunning, setIsLifeRunning] = useState(false);
  const [lifeMode, setLifeMode] = useState<"draw" | "erase">("draw");
  const [clearTrigger, setClearTrigger] = useState(0);
  const [initialCell, setInitialCell] = useState<{ row: number; col: number } | null>(null);

  const handleExitLifeMode = useCallback(() => {
    setIsLifeMode(false);
    setIsLifeRunning(false);
    setInitialCell(null);
  }, []);

  const handleToggleRunning = useCallback(() => {
    setIsLifeRunning((prev) => !prev);
  }, []);

  const handleClear = useCallback(() => {
    setClearTrigger((n) => n + 1);
  }, []);

  // Handle click on hero background to enter Life mode
  const handleHeroPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Already in Life mode - let HeroLifeGrid handle it
      if (isLifeMode) return;

      // Check if the click is on an interactive element (button, link, etc.)
      const target = e.target as HTMLElement;
      const isInteractive = target.closest("a, button, [role='button'], input, textarea, select");
      if (isInteractive) return;

      // Get click position relative to hero section
      const hero = heroRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);

      // Enter Life mode and set the initial cell
      setInitialCell({ row, col });
      setIsLifeMode(true);
      setIsLifeRunning(false);
      setLifeMode("draw");
    },
    [isLifeMode]
  );

  useEffect(() => {
    if (!location.hash) return;
    scrollToSection(extractSectionId(location.hash));
  }, [location.hash]);

  useEffect(() => {
    const state = location.state as { scrollToSection?: string } | null;
    const targetSection = state?.scrollToSection;

    if (!targetSection) return;

    scrollToSection(targetSection);
    navigate(".", { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    const sectionIds = ["contact"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const topSection = visible[0].target as HTMLElement;
          setActiveSection(topSection.id);
        }
      },
      {
        threshold: 0.4,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleSectionLinkClick = (event: MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (location.hash === hash) {
      event.preventDefault();
      scrollToSection(extractSectionId(hash));
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans selection:text-white">
      {/* Top bar crossfade between Navbar and LifeControlBar */}
      <AnimatePresence initial={false}>
        {isLifeMode ? (
          <motion.div
            key="life-topbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeInOut" }}
          >
            <LifeControlBar
              isRunning={isLifeRunning}
              mode={lifeMode}
              onToggleRunning={handleToggleRunning}
              onSetMode={setLifeMode}
              onClear={handleClear}
              onExit={handleExitLifeMode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="site-navbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeInOut" }}
          >
            <Navbar activeSection={activeSection} navItems={homeNavItems} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Style Injection for Text Selection & Hover States */}
      <style>{`
        ::selection {
          background-color: ${ACCENT_COLOR};
          color: white;
        }
        .hover-accent-shadow:hover {
          box-shadow: 8px 8px 0px 0px ${ACCENT_COLOR};
          border-color: ${ACCENT_COLOR};
        }
        .dark .hover-accent-shadow:hover {
          box-shadow: 8px 8px 0px 0px ${ACCENT_COLOR};
          border-color: ${ACCENT_COLOR};
        }
        .hover-accent-text:hover {
          color: ${ACCENT_COLOR};
        }
      `}</style>

      {/* --- HERO SECTION --- */}
      <section
        ref={heroRef}
        onPointerDown={handleHeroPointerDown}
        className="relative min-h-[90vh] flex flex-col justify-start md:justify-center items-center px-6 pt-32 pb-16 border-b-4 border-black dark:border-white bg-background dark:bg-zinc-950 transition-colors"
        style={{ cursor: isLifeMode ? undefined : "crosshair" }}
      >
        {/* Engineering Grid Background - Inverted for Dark Mode (fades out in Life mode) */}
        <AnimatePresence>
          {!isLifeMode && (
            <motion.div
              key="hero-grid-bg"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="absolute inset-0 bg-[linear-gradient(#f0f0f0_1px,transparent_1px),linear-gradient(90deg,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(#27272a_1px,transparent_1px),linear-gradient(90deg,#27272a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"
            />
          )}
        </AnimatePresence>

        {/* Game of Life Grid Overlay */}
        <AnimatePresence>
          {isLifeMode && (
            <motion.div
              key="life-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="absolute inset-0"
            >
              <HeroLifeGrid
                isRunning={isLifeRunning}
                mode={lifeMode}
                clearTrigger={clearTrigger}
                initialCell={initialCell}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* H1 pinned as an overlay so it never shifts; pointer-events disabled in Life mode */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center px-6 ${isLifeMode ? "pointer-events-none" : ""}`}>
          <div className="max-w-4xl w-full text-center">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-6 text-center dark:text-white">
              <span className="block sm:inline">Treyson</span>
              <span className="block sm:inline sm:ml-3">
                Brown
                <span style={{ color: ACCENT_COLOR }}>.</span>
              </span>
            </h1>

            {/* Subtext and buttons - always mounted, fade out visually in Life mode */}
            <motion.div
              initial={false}
              animate={{
                opacity: isLifeMode ? 0 : 1,
                scale: prefersReducedMotion ? 1 : isLifeMode ? 0.98 : 1,
                filter: prefersReducedMotion ? "blur(0px)" : isLifeMode ? "blur(4px)" : "blur(0px)",
              }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
              style={{ pointerEvents: isLifeMode ? "none" : "auto" }}
              aria-hidden={isLifeMode}
            >
              {/* Status badge */}
              <div className="flex justify-center mb-8">
                <span className="flex items-center gap-2 py-2 px-4 border-2 border-black dark:border-white font-mono text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-card dark:bg-zinc-900 dark:text-white">
                  <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: ACCENT_COLOR }}></span>
                  STATUS: BUILDING
                </span>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl md:text-2xl font-mono text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              >
                I'm Treyson. I am interested in AI, math, literature, and most recently hardware.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
              >
                <Link
                  to={{ pathname: "/", hash: "#contact" }}
                  onClick={(event) => handleSectionLinkClick(event, "#contact")}
                  className="hover-accent-shadow group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-black dark:text-white transition-all duration-200 bg-card dark:bg-zinc-900 border-2 border-black dark:border-white font-mono hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  Contact Me
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 bg-background dark:bg-zinc-950 relative scroll-mt-28 md:scroll-mt-36">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-8 dark:text-white">Want to connect?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="https://linkedin.com/in/treyson-brown"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#0077b5] text-white font-bold text-lg border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
            >
              <Linkedin size={24} />
              LinkedIn
            </a>
            <a
              href="https://github.com/treysonbrown"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#333] text-white font-bold text-lg border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
            >
              <Github size={24} />
              GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-black dark:bg-zinc-950 text-white text-center font-mono text-sm border-t-4 border-black dark:border-white">
        <p>
          &copy; {new Date().getFullYear()} Treyson Brown. {" "}
          {isAdmin ? null : (
            <>
              <a
                href="https://github.com/treysonbrown/treyson-website"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-zinc-300"
              >
                View my source code
              </a>
              .
            </>
          )}
        </p>
      </footer>
    </div>
  );
};

export default Index;
