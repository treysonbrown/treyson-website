import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import { blogPosts } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";

// --- CONFIGURATION ---
const ACCENT_COLOR = "#ff4499";
// We use a style object for the accent to apply it dynamically
const accentStyle = { backgroundColor: ACCENT_COLOR };

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || "1");
  const post = blogPosts.find((p) => p.id === postId);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-6 transition-colors text-black dark:text-white">
        <h1 className="text-6xl font-black">404</h1>
        <p className="font-mono text-xl">Object not found in database.</p>
        <Link to="/blog">
          <Button className="border-2 border-black dark:border-white bg-card dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase font-bold tracking-widest transition-all hover:-translate-y-1">
            RETURN TO BLOGS
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors">
      <Navbar showHomeLink={true} useAbsolutePaths={true} />

      {/* Style for dynamic accent elements */}
      <style>{`
        .accent-text { color: ${ACCENT_COLOR}; }
      `}</style>

      <main className="pt-32 pb-24">
        {/* Progress bar / Header Decoration */}
        <div className="fixed top-0 left-0 h-2 w-full z-50 bg-gray-200 dark:bg-zinc-800">
          <div className="h-full w-1/3" style={accentStyle}></div>
        </div>

        <article className="container max-w-4xl mx-auto px-6">
          {/* Navigation & Meta */}
          <div className="mb-12 space-y-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase hover:underline dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Blogs
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {post.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(255,68,153,1)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[1.1] border-l-8 border-black dark:border-white pl-6 py-2 dark:text-white transition-colors">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm font-mono text-gray-500 dark:text-gray-400 border-t border-b border-gray-200 dark:border-zinc-800 py-4 mt-8">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-black dark:text-white" />
                  <span className="font-bold text-black dark:text-white">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{post.publishDate}</span>
                </div>
                {post.readTime && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{post.readTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="prose prose-lg max-w-none font-mono text-gray-800 dark:text-gray-300">
            {/* 
               We are manually parsing for style control. 
               This keeps the brutally simple vibe without a heavy markdown library 
            */}
            {post.content.split("\n").map((paragraph, index) => {
              // 1. HEADERS (lines starting with #)
              if (paragraph.startsWith("#")) {
                const level = paragraph.match(/^#+/)?.[0].length || 1;
                const text = paragraph.replace(/^#+\s*/, "");

                // Styles based on header level
                if (level === 1) return <h2 key={index} className="text-3xl font-black uppercase mt-12 mb-6 border-b-4 border-black dark:border-white pb-2 dark:text-white transition-colors">{text}</h2>;
                if (level === 2) return <h3 key={index} className="text-2xl font-bold uppercase mt-10 mb-4 flex items-center gap-2 dark:text-white"><span style={{ color: ACCENT_COLOR }}>#</span> {text}</h3>;
                return <h4 key={index} className="text-xl font-bold mt-8 mb-4 dark:text-white">{text}</h4>;
              }

              // 2. CODE BLOCKS (Simple detection)
              else if (paragraph.startsWith("```")) {
                const code = paragraph.replace(/```\w*/, "").replace(/```/, "");
                return (
                  <div key={index} className="my-8 relative group">
                    <div className="absolute top-0 right-0 bg-gray-700 dark:bg-zinc-700 text-white text-xs px-2 py-1 font-mono rounded-bl">BASH</div>
                    <pre className="bg-[#1a1a1a] dark:bg-zinc-950 text-green-400 p-6 overflow-x-auto border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(200,200,200,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] text-sm leading-relaxed transition-all">
                      <code>{code || paragraph.replace(/```/g, "")}</code>
                    </pre>
                  </div>
                );
              }

              // 3. EMPTY LINES
              else if (paragraph.trim() === "") {
                return <br key={index} />;
              }

              // 4. STANDARD PARAGRAPHS
              else {
                return (
                  <p key={index} className="mb-6 leading-relaxed text-base md:text-lg text-gray-700 dark:text-gray-300">
                    {paragraph}
                  </p>
                );
              }
            })}
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPost;
