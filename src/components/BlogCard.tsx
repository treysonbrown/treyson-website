import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogCardProps {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  tags: string[];
}

export const BlogCard = ({
  title,
  excerpt,
  content,
  author,
  publishDate,
  readTime,
  tags,
  id,
}: BlogCardProps & { id: number }) => {
  return (
    <Link to={`/blog/${id}`} className="block h-full">
      <Card className="bg-background border-brutal neobrutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all h-full flex flex-col cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{publishDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{readTime}</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold uppercase tracking-wide">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <p className="font-mono text-sm leading-relaxed">{excerpt}</p>

          <div className="flex flex-wrap gap-2 mt-auto">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-lime-green text-black px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 border-black"
              >
                {tag}
              </span>
            ))}
          </div>

          <Button variant="brutal" size="sm" className="w-full mt-4">
            Read More
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};
