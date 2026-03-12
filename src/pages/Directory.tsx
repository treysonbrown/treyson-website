import { useEffect, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

import Navbar from "@/components/Navbar";

const ACCENT_COLOR = "#ff4499";

type PageGalleryItem = {
  name: string;
  file: string;
  route: string;
  href: string;
  description: string;
  category: "Primary" | "Tool" | "Dynamic" | "System";
  notes?: string;
};

const pageItems: PageGalleryItem[] = [
  {
    name: "Boulders",
    file: "Boulders.tsx",
    route: "/boulders",
    href: "/boulders",
    description: "Ranked boulder problem wishlist with notes and video links.",
    category: "Primary",
  },
  {
    name: "Books",
    file: "Books.tsx",
    route: "/books",
    href: "/books",
    description: "Grouped reading list with tap-to-open summaries and Amazon links.",
    category: "Primary",
  },
  {
    name: "Cubing",
    route: "/cubing",
    href: "/cubing",
    description: "3x3 speedcubing timer with scramble generation, inspection toggle, and session stats.",
    category: "Apps",
  },
  {
    name: "Planner",
    route: "/plan",
    href: "/plan",
    description: "Planning workspace page",
    category: "Apps",
    notes: "Requires auth",
  },
];

const categoryOrder: PageGalleryItem["category"][] = ["Apps", "Primary"];

const Directory = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans selection:bg-black selection:text-white transition-colors">
      <Navbar showHomeLink={true} useAbsolutePaths={true} />

      <section className="pt-32 pb-16 border-b-4 border-black dark:border-white bg-background dark:bg-zinc-950 pattern-grid-lg relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span
                style={{ backgroundColor: ACCENT_COLOR }}
                className="px-3 py-1 border-2 border-black dark:border-white font-mono font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                /DIRECTORY
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black dark:text-white">
              Directory
            </h1>

            <p className="text-xl font-mono text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A quick map of every page component in `src/pages`, with routes, links, and what each page is for.
            </p>
          </div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </section>

      <section className="py-16 px-6 bg-gray-50 dark:bg-zinc-950">
        <div className="container mx-auto max-w-5xl space-y-8">
          {categoryOrder.map((category) => {
            const items = pageItems.filter((item) => item.category === category);
            if (!items.length) return null;

            return (
              <div
                key={category}
                className="bg-card dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-6"
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight dark:text-white">
                    {category}
                  </h2>
                  <span
                    className="px-3 py-1 border-2 border-black dark:border-white font-mono font-bold text-xs text-white"
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    {items.length} PAGES
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.file}
                      className="border-2 border-black dark:border-white bg-white dark:bg-zinc-950 p-4 md:p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                              {item.name}
                            </h3>
                          </div>

                          <p className="font-mono text-sm md:text-base text-gray-700 dark:text-gray-300">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
                              Route
                            </span>
                            <code className="px-2 py-1 border border-black dark:border-white font-mono text-xs dark:text-white bg-gray-50 dark:bg-zinc-900">
                              {item.route}
                            </code>
                          </div>

                          {item.notes && (
                            <p className="font-mono text-xs italic text-gray-600 dark:text-gray-400">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        <Link
                          to={item.href}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-mono font-bold uppercase text-sm border-2 border-black dark:border-white hover:bg-[color:var(--accent)] dark:hover:bg-[color:var(--accent)] hover:text-white dark:hover:text-white transition-all shrink-0"
                          style={{ "--accent": ACCENT_COLOR } as CSSProperties}
                        >
                          Open
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Directory;
