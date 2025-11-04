import { NeobrutalistSection } from "@/components/NeobrutalistSection";
import { SkillCard } from "@/components/SkillCard";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Linkedin, Mail, Code, Zap, Globe } from "lucide-react";
import ecommerceProject from "@/assets/ecommerce-project.jpg";
import pharmaEduImage from "@/assets/pharma-edu.png";
import codeForgeImage from "@/assets/CodeForge.png"
import dashboardProject from "@/assets/dashboard-project.jpg";
import { Carousel } from "@/components/ui/carousel";

const Index = () => {

  const projects = [
    {
      title: "Pharma EDU",
      description: "Software for pharamcy students to learn.",
      tech: ["React", "Typescript", "FastAPI", "PostgreSQL", "SQLmodel", "Alembic"],
      liveUrl: "https://pharmacy.projectgnome.org/login",
      image: pharmaEduImage,
    },
    {
      title: "Code-Forge",
      description: "Code-Forge lets teachers create classes, add students, and post extra challenges for practice. Built-in leaderboards, resources, and tracking help keep students motivated.",
      tech: ["React", "TypeScript", "Supabase", "Oauth"],
      githubUrl: "https://github.com/treysonbrown/code-forge",
      image: codeForgeImage,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background border-b-3 border-black z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold uppercase tracking-wide">
            <span className="bg-gradient-to-r from-[#614385] to-[#516395] bg-clip-text text-transparent">
              Treyson Brown
            </span>
          </div>

          <div className="hidden md:flex gap-6">
            <a href="#about" className="font-bold uppercase tracking-wide hover:text-electric-blue transition-colors">About</a>
            <a href="#projects" className="font-bold uppercase tracking-wide hover:text-lime-green transition-colors">Projects</a>
            <a href="#contact" className="font-bold uppercase tracking-wide hover:text-bright-yellow transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <NeobrutalistSection className="pt-32 pb-16 bg-background">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <span className="bg-gradient-to-r from-[#614385] to-[#516395] bg-clip-text text-transparent">

            </span>
            <p className="text-xl md:text-2xl font-mono max-w-2xl mx-auto">
              I am a full-stack software engineer
            </p>
            <p className="text-xl md:text-2xl font-mono max-w-2xl mx-auto">
              I am intersted in AI, cli tools, linux, and vim
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild>
              <a href="#projects" className="flex items-center gap-2">
                <Code size={20} />
                View Work
              </a>
            </Button>
            <Button variant="brutal-outline" size="lg" asChild>
              <a href="#contact" className="flex items-center gap-2">
                <Zap size={20} />
                Get In Touch
              </a>
            </Button>
          </div>
        </div>
      </NeobrutalistSection>

      {/* About Section */}
      <NeobrutalistSection id="about" className="bg-black">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-wide text-white">
              About Me
            </h2>
            <div className="space-y-4 font-mono text-lg text-white">
              <p>
                I’m graduating from Dixie Tech in software engineering in December 2025.
              </p>
              <p>
                Start up founder in{" "}
                <a
                  href="https://sandbox.ing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-electric-blue font-semibold hover:underline hover:text-electric-blue/80 transition-colors"
                >
                  Sandbox
                </a>.

                I am building post-award finacial managment tools for grants.
              </p>
              <p>
                I have been interested in computers as long as I can remember. I daily drive vim and Arch Linux and love tinkering.
              </p>
            </div>
          </div>

        </div>
      </NeobrutalistSection>


      <NeobrutalistSection id="projects" className="bg-white">
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
      <NeobrutalistSection id="contact" className="bg-white">
        <div className="text-center space-y-12">

          <Card className="max-w-2xl mx-auto bg-white text-background border-brutal neobrutalist-shadow">
            <CardContent className="p-8 space-y-8">
              <p className="text-xl text-black font-mono">
                Want to connect?
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">

                <Button variant="brutal" size="lg" asChild>
                  <a href="https://linkedin.com/in/treyson-brown" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Linkedin size={20} />
                    LinkedIn
                  </a>
                </Button>

                <Button variant="brutal-outline" size="lg" asChild>
                  <a href="https://github.com/treysonbrown" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Github size={20} />
                    GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </NeobrutalistSection>

    </div>
  );
};

export default Index;
