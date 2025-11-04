import { NeobrutalistSection } from "@/components/NeobrutalistSection";
import { BlogCard } from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, PenTool } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Blog = () => {
  // TypeScript objects for blog posts
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with React and TypeScript",
      excerpt:
        "Learn how to set up a new React project with TypeScript and best practices for type safety in your components.",
      content: "Full blog content would go here...",
      author: "Treyson Brown",
      publishDate: "Nov 1, 2024",
      readTime: "5 min read",
      tags: ["React", "TypeScript", "Frontend"],
    },
    {
      id: 2,
      title: "Building Neobrutalist UI Designs",
      excerpt:
        "Explore the principles of neobrutalism and how to implement this bold design style in your web applications.",
      content: "Full blog content would go here...",
      author: "Treyson Brown",
      publishDate: "Oct 28, 2024",
      readTime: "7 min read",
      tags: ["Design", "CSS", "UI/UX"],
    },
    {
      id: 3,
      title: "My Journey into Open Source",
      excerpt:
        "Sharing my experiences contributing to open source projects and how it has helped me grow as a developer.",
      content: "Full blog content would go here...",
      author: "Treyson Brown",
      publishDate: "Oct 15, 2024",
      readTime: "10 min read",
      tags: ["Open Source", "Community", "Growth"],
    },
    {
      id: 4,
      title: "Vim Tips for Productivity",
      excerpt: "Essential Vim commands and configurations that have significantly improved my development workflow.",
      content: "Full blog content would go here...",
      author: "Treyson Brown",
      publishDate: "Oct 5, 2024",
      readTime: "8 min read",
      tags: ["Vim", "Productivity", "Tools"],
    },
    {
      id: 5,
      title: "Arch Linux Setup Guide",
      excerpt:
        "A comprehensive guide to setting up Arch Linux for development with all the essential tools and configurations.",
      content: "Full blog content would go here...",
      author: "Treyson Brown",
      publishDate: "Sep 20, 2024",
      readTime: "12 min read",
      tags: ["Linux", "Arch", "Setup"],
    },
    {
      id: 6,
      title: "Building CLI Tools with Node.js",
      excerpt: "Learn how to create powerful command-line tools using Node.js and publish them to npm.",
      content: "Full blog content would go here...",
      author: "Treyson Brown",
      publishDate: "Sep 10, 2024",
      readTime: "9 min read",
      tags: ["Node.js", "CLI", "Tools"],
    },
  ];

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
