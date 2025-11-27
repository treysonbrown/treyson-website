import { MouseEvent, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ExternalLink, Terminal, ArrowRight, Code2, Cpu } from "lucide-react";
import Navbar from "@/components/Navbar";

// Assuming you have these images.
import thesisImage from "@/assets/Thesis.png";
import pharmaEduImage from "@/assets/pharma-edu.png";
import codeForgeImage from "@/assets/CodeForge.png";

// --- CONFIGURATION ---
const ACCENT_COLOR = "#ff4499";

const Index = () => {
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (!location.hash) return;
    const sectionId = location.hash.replace("#", "");
    scrollToSection(sectionId);
  }, [location.hash]);

  const handleContactClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (location.hash === "#contact") {
      event.preventDefault();
      scrollToSection("contact");
    }
  };

  const projects = [
    {
      title: "Thesis ERP",
      description: "Grant financial management for PIs. Replacing complex spreadsheets with intuitive software to track burn rates and compliance.",
      tech: ["React", "FastAPI", "PostgreSQL", "SQLModel"],
      liveUrl: "https://thesiserp.com",
      status: "PRODUCTION",
      image: thesisImage,
    },
    {
      title: "Pharma EDU",
      description: "Educational platform for pharmacy students. Features interactive quizzes, progress tracking, and material distribution.",
      tech: ["React", "FastAPI", "PostgreSQL", "Alembic"],
      liveUrl: "https://pharmacy.projectgnome.org/login",
      status: "LIVE",
      image: pharmaEduImage,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:text-white">
      <Navbar />

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
        .hover-accent-text:hover {
          color: ${ACCENT_COLOR};
        }
      `}</style>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 border-b-4 border-black bg-white">
        {/* Engineering Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(#f0f0f0_1px,transparent_1px),linear-gradient(90deg,#f0f0f0_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

        <div className="max-w-4xl w-full space-y-8 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-8">
              <span
                className="flex items-center gap-2 py-2 px-4 border-2 border-black font-mono text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
              >
                <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: ACCENT_COLOR }}></span>
                STATUS: BUILDING
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-6 text-center">
              Treyson&nbsp;&nbsp;Brown
              <span style={{ color: ACCENT_COLOR }}>.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl font-mono text-gray-600 max-w-2xl mx-auto"
          >
            I'm Treyson. I build software for Principal Investigators to track
            deadlines and burn rates. Founder at{" "}
            <a
              href="https://thesiserp.com"
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <span
                className="font-bold border-b-4"
                style={{ borderColor: ACCENT_COLOR }}
              >
                Thesis
              </span>
            </a>
            .
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <a
              href="#projects"
              className="hover-accent-shadow group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-black border-2 border-black font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
            >
              View My Work
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              to={{ pathname: "/", hash: "#contact" }}
              onClick={handleContactClick}
              className="hover-accent-shadow group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-black transition-all duration-200 bg-white border-2 border-black font-mono hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Contact Me
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-24 bg-black text-white border-b-4 border-black relative overflow-hidden">
        {/* Subtle grid in background of black section */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
                The <span style={{ color: ACCENT_COLOR }}>Stack</span> & <br /> The <span style={{ color: ACCENT_COLOR }}>Story</span>
              </h2>
              <div className="p-6 border-2 border-white/20 bg-zinc-900 font-mono text-sm md:text-base space-y-4 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                <div className="flex gap-2 items-center border-b border-gray-700 pb-2" style={{ color: ACCENT_COLOR }}>
                  <Terminal size={18} />
                  <span className="font-bold">treyson@arch:~</span>
                </div>
                <div className="space-y-4 text-gray-300">
                  <p>
                    <span className="text-green-400">➜</span> <span className="text-blue-400">~</span> <span className="text-yellow-400">cat</span> about_me.md
                  </p>
                  <p>
                    I am a software engineer obsessed with efficiency and AI. I daily drive Nvim, Arch Linux, and Codex.
                  </p>
                  <p>
                    Currently pivoting from student to founder. Building in the <a href="https://sandbox.ing" className="underline hover:text-white transition-colors" style={{ color: ACCENT_COLOR }}>Sandbox</a> incubator.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-bold font-mono mb-6 flex items-center gap-2">
                  <Code2 style={{ color: ACCENT_COLOR }} />
                    // CORE_TECHNOLOGIES
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "React + TypeScript",
                    "FastAPI (Python)",
                    "PostgreSQL",
                    "SQLModel + Pydantic",
                    "Tailwind CSS",
                    "Linux / Bash"
                  ].map((item) => (
                    <li key={item} className="flex items-center justify-between p-3 border border-gray-800 bg-zinc-900 hover:border-white transition-colors group">
                      <span className="font-mono text-sm font-bold">{item}</span>
                      <div className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-white transition-colors" />
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold font-mono mb-6 flex items-center gap-2">
                  <Cpu style={{ color: ACCENT_COLOR }} />
                    // TIMELINE
                </h3>
                <div className="border-l-2 border-gray-800 pl-8 space-y-10 font-mono">
                  <div className="relative">
                    <div className="absolute -left-[37px] top-1 w-4 h-4 border-2 border-black" style={{ backgroundColor: ACCENT_COLOR }} />
                    <p className="text-xs font-bold tracking-widest text-gray-500 mb-1">CURRENT</p>
                    <p className="text-xl font-bold text-white">Founder @ Thesis ERP</p>
                    <p className="text-gray-400 text-sm mt-1">Post-award financial management for grants.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[37px] top-1 w-4 h-4 bg-gray-800 border-2 border-black" />
                    <p className="text-xs font-bold tracking-widest text-gray-500 mb-1">DEC 2025</p>
                    <p className="text-xl font-bold text-gray-300">Dixie Tech Graduate</p>
                    <p className="text-gray-500 text-sm mt-1">Software Engineering Program</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section
        id="projects"
        className="py-24 px-6 border-b-4 border-black bg-gray-50"
      >
        <div className="container mx-auto">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-sm text-gray-500 mb-2">
                <span className="w-2 h-2 bg-black"></span>
                PROJECTS_DIRECTORY
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none">
                Featured <br /> <span className="bg-black text-white px-2">Work</span>
              </h2>
            </div>
            <div className="flex items-center gap-4 border-b-4 border-black pb-2">
              <p className="font-mono text-xl font-bold text-black">
                // SHIPPED_CODE
              </p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col h-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover-accent-shadow transition-all duration-200 hover:-translate-y-1"
              >
                {/* Image Window */}
                <div className="border-b-4 border-black aspect-video overflow-hidden bg-gray-100 relative group-hover:brightness-110 transition-all">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="font-mono text-gray-500">No Image</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-0 left-0 bg-black text-white px-3 py-1 font-mono text-xs font-bold border-r-4 border-b-4 border-white">
                    {project.status || "DEV"}
                  </div>

                  {/* Links (Only appear on hover or absolute top right) */}
                  <div className="absolute bottom-0 right-0 flex">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="bg-white border-t-4 border-l-4 border-black p-3 hover:bg-black hover:text-white transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="bg-white border-t-4 border-l-4 border-black p-3 hover:bg-black hover:text-white transition-colors">
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black uppercase mb-3 flex items-center gap-2">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 font-mono text-sm leading-relaxed mb-6 flex-grow">
                    {project.description}
                  </p>

                  <div className="space-y-4 mt-auto">
                    <div className="w-full h-1 bg-gray-100" />
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t: string) => (
                        <span key={t} className="px-2 py-1 bg-gray-100 border border-black text-[10px] md:text-xs font-mono font-bold uppercase hover:bg-black hover:text-white transition-colors cursor-default">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-8">Ready to talk?</h2>
          <p className="text-xl md:text-2xl font-mono text-gray-600 mb-12">
            I'm currently focused on {
              <a
                href="https://thesiserp.com"
                target="_blank"
                rel="noreferrer"
                className="px-1 border-b-4 border-black font-bold"
                style={{ borderColor: ACCENT_COLOR }}
              >
                Thesis
              </a>
            }, but I'm always open to discussing grant management tech.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="https://linkedin.com/in/treyson-brown"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#0077b5] text-white font-bold text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
            >
              <Linkedin size={24} />
              LinkedIn
            </a>
            <a
              href="https://github.com/treysonbrown"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#333] text-white font-bold text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
            >
              <Github size={24} />
              GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-black text-white text-center font-mono text-sm border-t-4 border-black">
        <p>&copy; {new Date().getFullYear()} Treyson Brown. Built with Nvim and Gemini 3 Pro.</p>
      </footer>
    </div>
  );
};

export default Index;
