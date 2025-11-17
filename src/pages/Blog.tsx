import { NeobrutalistSection } from "@/components/NeobrutalistSection";
import { BlogCard } from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PenTool } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar showHomeLink={true} useAbsolutePaths={true} />

      {/* Blog Header */}
      <NeobrutalistSection className="pt-32 pb-16 bg-background">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-wide">
              <span className="bg-gradient-to-r from-[#614385] to-[#516395] bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-xl md:text-2xl font-mono max-w-2xl mx-auto">
              Thoughts on coding, design, and technology
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="brutal-outline" size="lg" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft size={20} />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </NeobrutalistSection>

      {/* Blog Posts Grid */}
      <NeobrutalistSection className="bg-white">
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.id}
                id={post.id}
                title={post.title}
                excerpt={post.excerpt}
                content={post.content}
                author={post.author}
                publishDate={post.publishDate}
                readTime={post.readTime}
                tags={post.tags}
              />
            ))}
          </div>
        </div>
      </NeobrutalistSection>
    </div>
  );
};

export default Blog;
