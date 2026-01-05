import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { projects } from "@/data/projects";

const ACCENT_COLOR = "#ff4499";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-100">
        <Navbar showHomeLink useAbsolutePaths />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-black">Project not found</h1>
            <p className="mb-6 text-gray-600">
              The project you&apos;re looking for doesn&apos;t exist or the link
              is incorrect.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-mono text-sm font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans selection:text-white">
      <Navbar showHomeLink useAbsolutePaths />

      <style>{`
        ::selection {
          background-color: ${ACCENT_COLOR};
          color: white;
        }
      `}</style>

      <main className="container mx-auto px-6 pt-32 pb-16">
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 border-2 border-black bg-card px-4 py-2 font-mono text-xs font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:text-white">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: ACCENT_COLOR }}
              />
              FEATURED_PROJECT
            </div>

            <h1 className="mb-4 text-4xl md:text-6xl font-black uppercase tracking-tighter text-black dark:text-white">
              {project.title}
            </h1>

            <p className="mb-6 inline-flex items-center gap-2 border-2 border-black bg-black px-3 py-1 font-mono text-xs font-bold uppercase text-white dark:border-white dark:bg-white dark:text-black">
              STATUS: {project.status}
            </p>

            <p className="mb-8 max-w-2xl font-mono text-sm text-gray-700 dark:text-gray-300">
              {project.longDescription ?? project.shortDescription}
            </p>

            <div className="mb-10 flex flex-wrap gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all dark:bg-zinc-900 dark:text-white dark:border-white"
                >
                  Live site
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-black bg-card px-4 py-2 font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all dark:bg-zinc-900 dark:text-white dark:border-white"
                >
                  View code
                </a>
              )}

              <Link
                to="/#projects"
                className="inline-flex items-center gap-2 border-2 border-black bg-transparent px-4 py-2 font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:bg-black hover:text-white transition-all dark:border-white dark:text-white"
              >
                ← Back to projects
              </Link>
            </div>

            <section className="space-y-6 border-t-4 border-black pt-6 dark:border-white">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                Tech stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 border border-black bg-gray-100 text-[11px] font-mono font-bold uppercase tracking-wide dark:border-white dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {project.image && (
              <div className="overflow-hidden border-4 border-black bg-gray-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-zinc-800 dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
