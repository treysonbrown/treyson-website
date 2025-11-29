import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
}

export const ProjectCard = ({ title, description, tech, liveUrl, githubUrl, image }: ProjectCardProps) => {
  return (
    <Card className="bg-background border-brutal neobrutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
      {image && (
        <div className="border-b-3 border-black">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-bold uppercase tracking-wide">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-mono text-sm leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-2">
          {tech.map((item, index) => (
            <span
              key={index}
              className="bg-blue text-black px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 border-black"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          {liveUrl && (
            <Button
              variant="brutal"
              size="sm"
              asChild
            >
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink size={16} />
                Live Demo
              </a>
            </Button>
          )}

          {githubUrl && (
            <Button
              variant="brutal-outline"
              size="sm"
              asChild
            >
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Github size={16} />
                Code
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
