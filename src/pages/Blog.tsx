import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, Hash } from "lucide-react";
import Navbar from "@/components/Navbar";
import { blogPosts } from "@/data/blogPosts";

// --- CONFIGURATION ---
// Change this hex code to test different colors!
const ACCENT_COLOR = "#ff4499";
// Helper for tailwind dynamic classes (since we can't interpolate partial class names easily)
const ACCENT_BG = "bg-[#ff4499]";
const ACCENT_HOVER = "hover:bg-[#ff4499]";

const Blog = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-black selection:text-white">
      <Navbar showHomeLink={true} useAbsolutePaths={true} />

      {/* Header Section */}
      <section className="pt-32 pb-16 border-b-4 border-black bg-white pattern-grid-lg relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-block">
              <span style={{ backgroundColor: ACCENT_COLOR }} className="px-3 py-1 border-2 border-black font-mono font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                /VAR/LOG/THOUGHTS
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black mb-4">
              Engineering <br /> & Strategy
            </h1>

            <p className="text-xl font-mono text-gray-600 max-w-2xl mx-auto">
              Documenting the process of building Thesis ERP, learning Rust, and configuring Vim.
            </p>

            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-bold hover:underline decoration-4 underline-offset-4"
                style={{ textDecorationColor: ACCENT_COLOR }}
              >
                <ArrowLeft size={20} />
                Return to Base
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Background texture helper */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </section>

      {/* Blog Grid */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/blog/${post.id}`} className="group block h-full">
                  <article className="h-full flex flex-col bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">

                    {/* Card Header */}
                    <div className="p-6 border-b-4 border-black bg-gray-50 group-hover:bg-white transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1">
                          ID: {String(post.id).padStart(3, '0')}
                        </span>
                        <ArrowRight className={`w-6 h-6 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300`} style={{ color: ACCENT_COLOR }} />
                      </div>
                      <h2 className="text-2xl font-black uppercase leading-tight group-hover:underline decoration-4 underline-offset-4 decoration-black">
                        {post.title}
                      </h2>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <p className="font-mono text-sm text-gray-600 mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {post.tags?.map((tag) => (
                            <span key={tag} className="flex items-center text-xs font-bold border border-black px-2 py-1 bg-gray-100">
                              <Hash size={10} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs font-mono text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {post.publishDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
