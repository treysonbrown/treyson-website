import { NeobrutalistSection } from "@/components/NeobrutalistSection";
import { SkillCard } from "@/components/SkillCard";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Linkedin, Mail, Code, Zap, Globe } from "lucide-react";
import ecommerceProject from "@/assets/ecommerce-project.jpg";
import taskManagementProject from "@/assets/task-management-project.jpg";
import dashboardProject from "@/assets/dashboard-project.jpg";

const Index = () => {
  const skills = [
    { skill: "React", level: "Expert", color: "electric-blue" as const },
    { skill: "TypeScript", level: "Advanced", color: "hot-pink" as const },
    { skill: "Node.js", level: "Advanced", color: "lime-green" as const },
    { skill: "Python", level: "Intermediate", color: "bright-yellow" as const },
    { skill: "PostgreSQL", level: "Advanced", color: "neon-orange" as const },
    { skill: "AWS", level: "Intermediate", color: "purple-punch" as const },
  ];

  const projects = [
    {
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce solution with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, and admin dashboard.",
      tech: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      image: ecommerceProject,
    },
    {
      title: "Task Management App",
      description: "Collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
      tech: ["React", "TypeScript", "Socket.io", "MongoDB"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      image: taskManagementProject,
    },
    {
      title: "Data Visualization Dashboard",
      description: "Interactive dashboard for visualizing complex datasets with charts, graphs, and real-time data updates from multiple APIs.",
      tech: ["React", "D3.js", "Python", "FastAPI"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example",
      image: dashboardProject,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background border-b-3 border-black z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold uppercase tracking-wide">
            <span className="text-electric-blue">DEV</span>
            <span className="text-hot-pink">FOLIO</span>
          </div>
          
          <div className="hidden md:flex gap-6">
            <a href="#about" className="font-bold uppercase tracking-wide hover:text-electric-blue transition-colors">About</a>
            <a href="#skills" className="font-bold uppercase tracking-wide hover:text-hot-pink transition-colors">Skills</a>
            <a href="#projects" className="font-bold uppercase tracking-wide hover:text-lime-green transition-colors">Projects</a>
            <a href="#contact" className="font-bold uppercase tracking-wide hover:text-bright-yellow transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <NeobrutalistSection className="pt-32 pb-16 bg-background">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-wide">
              <span className="block text-electric-blue">JOHN</span>
              <span className="block text-hot-pink">DEVELOPER</span>
            </h1>
            <p className="text-xl md:text-2xl font-mono max-w-2xl mx-auto">
              Crafting digital experiences with <span className="text-lime-green font-bold">bold code</span> and <span className="text-bright-yellow font-bold">brutal design</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="brutal" size="lg" asChild>
              <a href="#projects" className="flex items-center gap-2">
                <Code size={20} />
                View Work
              </a>
            </Button>
            <Button variant="brutal-secondary" size="lg" asChild>
              <a href="#contact" className="flex items-center gap-2">
                <Zap size={20} />
                Get In Touch
              </a>
            </Button>
          </div>
        </div>
      </NeobrutalistSection>

      {/* About Section */}
      <NeobrutalistSection id="about" className="bg-bright-yellow">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-wide text-foreground">
              About Me
            </h2>
            <div className="space-y-4 font-mono text-lg">
              <p>
                I'm a passionate full-stack developer who believes in creating digital experiences that are both functional and visually striking.
              </p>
              <p>
                With 5+ years of experience in modern web technologies, I specialize in React, TypeScript, and Node.js. I love bringing ideas to life with clean code and bold design.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new technologies, contributing to open source projects, or designing brutalist UI components.
              </p>
            </div>
          </div>
          
          <Card className="bg-foreground text-background border-brutal neobrutalist-shadow">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Globe size={48} className="mx-auto text-lime-green" />
                <h3 className="text-2xl font-bold uppercase">Based In</h3>
                <p className="font-mono">San Francisco, CA</p>
                <div className="pt-4 space-y-2">
                  <p className="font-bold">Available for:</p>
                  <div className="space-y-1 text-sm font-mono">
                    <p>• Full-time opportunities</p>
                    <p>• Freelance projects</p>
                    <p>• Consulting work</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </NeobrutalistSection>

      {/* Skills Section */}
      <NeobrutalistSection id="skills" className="bg-background">
        <div className="text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-wide">
            <span className="text-electric-blue">My</span> <span className="text-hot-pink">Skills</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <SkillCard 
                key={index}
                skill={skill.skill}
                level={skill.level}
                color={skill.color}
              />
            ))}
          </div>
        </div>
      </NeobrutalistSection>

      {/* Projects Section */}
      <NeobrutalistSection id="projects" className="bg-lime-green">
        <div className="space-y-12">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-wide text-center text-foreground">
            Featured Projects
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard 
                key={index}
                title={project.title}
                description={project.description}
                tech={project.tech}
                liveUrl={project.liveUrl}
                githubUrl={project.githubUrl}
                image={project.image}
              />
            ))}
          </div>
        </div>
      </NeobrutalistSection>

      {/* Contact Section */}
      <NeobrutalistSection id="contact" className="bg-background">
        <div className="text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-wide">
            <span className="text-hot-pink">Let's</span> <span className="text-electric-blue">Connect</span>
          </h2>
          
          <Card className="max-w-2xl mx-auto bg-foreground text-background border-brutal neobrutalist-shadow">
            <CardContent className="p-8 space-y-8">
              <p className="text-xl font-mono">
                Ready to build something amazing together? Let's talk!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="brutal-accent" size="lg" asChild>
                  <a href="mailto:john@example.com" className="flex items-center gap-2">
                    <Mail size={20} />
                    Email Me
                  </a>
                </Button>
                
                <Button variant="brutal-yellow" size="lg" asChild>
                  <a href="https://linkedin.com/in/johndeveloper" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Linkedin size={20} />
                    LinkedIn
                  </a>
                </Button>
                
                <Button variant="brutal-outline" size="lg" asChild>
                  <a href="https://github.com/johndeveloper" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Github size={20} />
                    GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </NeobrutalistSection>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8 border-t-3 border-black">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-mono text-sm">
            © 2024 John Developer. Built with React & Neobrutalism ⚡
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
