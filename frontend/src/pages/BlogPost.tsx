import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-6">
        <h1 className="text-6xl font-black">404</h1>
        <p className="font-mono text-xl">Object not found in database.</p>
        <Link to="/blog">
          <Button className="border-2 border-black bg-white text-black hover:bg-black hover:text-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            RETURN TO BLOGS
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      <Navbar showHomeLink={true} useAbsolutePaths={true} />

      <main className="pt-32 pb-24">
        {/* Progress bar / Header Decoration */}
        <div className="fixed top-0 left-0 h-2 w-full z-50 bg-gray-200">
          <div className="h-full w-1/3" style={accentStyle}></div>
        </div>

        <article className="container max-w-4xl mx-auto px-6">
          {/* Navigation & Meta */}
          <div className="mb-12 space-y-8">
            <Link to="/blog" className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase hover:underline">
              <ArrowLeft size={16} />
              Back to Blogs
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {post.tags?.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-black text-white text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(255,68,153,1)]">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[1.1] border-l-8 border-black pl-6 py-2">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm font-mono text-gray-500 border-t border-b border-gray-200 py-4 mt-8">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-black" />
                  <span className="font-bold text-black">{post.author}</span>
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
          <div className="prose prose-lg max-w-none font-mono text-gray-800">
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
                if (level === 1) return <h2 key={index} className="text-3xl font-black uppercase mt-12 mb-6 border-b-4 border-black pb-2">{text}</h2>;
                if (level === 2) return <h3 key={index} className="text-2xl font-bold uppercase mt-10 mb-4 flex items-center gap-2"><span style={{ color: ACCENT_COLOR }}>#</span> {text}</h3>;
                return <h4 key={index} className="text-xl font-bold mt-8 mb-4">{text}</h4>;
              }

              // 2. CODE BLOCKS (Simple detection)
              else if (paragraph.startsWith("```")) {
                const code = paragraph.replace(/```\w*/, "").replace(/```/, "");
                return (
                  <div key={index} className="my-8 relative group">
                    <div className="absolute top-0 right-0 bg-gray-700 text-white text-xs px-2 py-1 font-mono rounded-bl">BASH</div>
                    <pre className="bg-[#1a1a1a] text-green-400 p-6 overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(200,200,200,1)] text-sm leading-relaxed">
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
                  <p key={index} className="mb-6 leading-relaxed text-base md:text-lg text-gray-700">
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
