import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
// @ts-ignore - JPG import
import celestialPedalstoolImage from "@/assets/celestial_pedalstool.JPG";

const ACCENT_COLOR = "#ff4499";

type BoulderProblem = {
  name: string;
  grade: string;
  link?: string;
  timestamp?: string; // Format: "MM:SS" or "HH:MM:SS"
  notes?: string;
  image?: string;
};

const boulderProblems: BoulderProblem[] = [
  {
    name: "Celestial Pedalstool",
    grade: "V5",
    link: "",
    image: celestialPedalstoolImage,
  },
  {
    name: "Acute Obtuse",
    grade: "V9?",
    link: "https://vimeo.com/284455121",
    notes: "hold broke I think",
  },
  {
    name: "Conspiracy Theories",
    grade: "V9/10",
    link: "https://www.youtube.com/watch?v=Ecgr0n_RD6o",
    timestamp: "1:57",
  },
  {
    name: "Premium Lager",
    grade: "V10",
    link: "https://www.youtube.com/watch?v=Ecgr0n_RD6o",
    timestamp: "3:10",
  },
  {
    name: "Razor Reef",
    grade: "V8",
    link: "https://www.youtube.com/watch?v=GzlJVDwlxoI",
    timestamp: "12:26",
  },
	{
		name: "Kolob Darkness - Last one in the video",
		grade: "V?",
    link: "https://vimeo.com/248540276",
	},
  {
    name: "Life Coach",
    grade: "V?",
    link: "",
    notes: "V4 is my guess",
  },
];

// Helper function to add timestamp to video URLs
const addTimestampToUrl = (url: string, timestamp?: string): string => {
  if (!timestamp || !url) return url;

  // Parse timestamp (MM:SS or HH:MM:SS)
  const parts = timestamp.split(":").map(Number);
  let totalSeconds = 0;
  if (parts.length === 2) {
    totalSeconds = parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  // YouTube URLs
  if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${totalSeconds}s`;
  }

  // Vimeo URLs
  if (url.includes("vimeo.com")) {
    return `${url}#t=${totalSeconds}s`;
  }

  return url;
};

const Boulders = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans selection:bg-black selection:text-white transition-colors">
      <Navbar showHomeLink={true} useAbsolutePaths={true} />

      {/* Header Section */}
      <section className="pt-32 pb-16 border-b-4 border-black dark:border-white bg-background dark:bg-zinc-950 pattern-grid-lg relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span
                style={{ backgroundColor: ACCENT_COLOR }}
                className="px-3 py-1 border-2 border-black dark:border-white font-mono font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                /BOULDERS
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black dark:text-white mb-4">
              Boulders
            </h1>

            <p className="text-xl font-mono text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A collection of boulder problems I want to try. Ordered so that the higher up they are the more I want to try them.
            </p>
          </div>
        </div>

        {/* Background texture helper */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </section>

      {/* Content Section */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-zinc-950">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {boulderProblems.map((problem, index) => (
              <div
                key={index}
                className="bg-card dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-200 p-6"
              >
                <div className="flex flex-col gap-4">
                  {problem.image && (
                    <div className="w-full overflow-hidden border-2 border-black dark:border-white">
                      <img
                        src={problem.image}
                        alt={problem.name}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-black uppercase dark:text-white">
                          {problem.name}
                        </h3>
                        <span
                          className="px-3 py-1 border-2 border-black dark:border-white font-mono font-bold text-sm dark:text-white"
                          style={{ backgroundColor: ACCENT_COLOR, color: "white" }}
                        >
                          {problem.grade}
                        </span>
                      </div>
                      {problem.notes && (
                        <p className="font-mono text-sm text-gray-600 dark:text-gray-400 italic">
                          {problem.notes}
                        </p>
                      )}
                    </div>
                    {problem.link && (
                      <a
                        href={addTimestampToUrl(problem.link, problem.timestamp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-mono font-bold uppercase text-sm border-2 border-black dark:border-white hover:bg-[color:var(--accent)] dark:hover:bg-[color:var(--accent)] hover:text-white dark:hover:text-white transition-all"
                        style={{ "--accent": ACCENT_COLOR } as React.CSSProperties}
                      >
                        Watch
                        {problem.timestamp && (
                          <span className="text-xs opacity-75">({problem.timestamp})</span>
                        )}
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Boulders;

