import { NeobrutalistSection } from "@/components/NeobrutalistSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { blogPosts } from "@/data/blogPosts";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || "1");
  const post = blogPosts.find((p) => p.id === postId);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Blog post not found</h1>
          <Button variant="brutal" asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showHomeLink={true} useAbsolutePaths={true} />

      {/* Blog Post Content */}
      <NeobrutalistSection className="pt-32 pb-16 bg-background">
        <div className="max-w-4xl mx-auto space-y-8">
          <Button variant="brutal-outline" asChild>
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft size={20} />
              Back to Blog
            </Link>
          </Button>

          <Card className="bg-background border-brutal neobrutalist-shadow">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{post.publishDate}</span>
                </div>
                {post.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{post.readTime}</span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">{post.title}</h1>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-lime-green text-black px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 border-black"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-brutal neobrutalist-shadow">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                {post.content.split("\n").map((paragraph, index) => {
                  if (paragraph.startsWith("#")) {
                    const level = paragraph.match(/^#+/)?.[0].length || 1;
                    const text = paragraph.replace(/^#+\s*/, "");
                    const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
                    return (
                      <Tag key={index} className="font-bold uppercase tracking-wide mt-6 mb-4">
                        {text}
                      </Tag>
                    );
                  } else if (paragraph.startsWith("```")) {
                    return (
                      <pre key={index} className="bg-black text-white p-4 overflow-x-auto border-2 border-black">
                        <code>{paragraph.replace("```", "")}</code>
                      </pre>
                    );
                  } else if (paragraph.trim() === "") {
                    return <br key={index} />;
                  } else {
                    return (
                      <p key={index} className="font-mono leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    );
                  }
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </NeobrutalistSection>
    </div>
  );
};

export default BlogPost;
