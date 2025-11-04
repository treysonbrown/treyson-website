import { NeobrutalistSection } from "@/components/NeobrutalistSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";

// Blog post data (in a real app, this would come from a database or CMS)
const blogPosts = [
  {
    id: 1,
    title: "Getting Started with React and TypeScript",
    excerpt:
      "Learn how to set up a new React project with TypeScript and best practices for type safety in your components.",
    content: `# Getting Started with React and TypeScript

React and TypeScript make a powerful combination for building type-safe web applications. In this post, we'll explore how to set up a new React project with TypeScript and follow best practices for type safety.

## Setting Up Your Project

The easiest way to get started is by using Create React App with the TypeScript template:

\`\`\`bash
npx create-react-app my-app --template typescript
\`\`\`

This will give you a fully configured React project with TypeScript support out of the box.

## Basic TypeScript Concepts for React

### Typing Props

When creating components, it's important to type your props:

\`\`\`typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={\`btn btn-\${variant}\`}>
      {label}
    </button>
  );
};
\`\`\`

### Typing State

When using useState, TypeScript can infer the type, but you can also be explicit:

\`\`\`typescript
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
\`\`\`

## Best Practices

1. Always type your props and state
2. Use interfaces for object shapes
3. Leverage TypeScript's inference when possible
4. Avoid using \`any\` type
5. Use generic types for reusable components

## Conclusion

TypeScript adds a layer of safety to your React applications that helps catch errors during development rather than in production. Start with basic typing and gradually adopt more advanced patterns as you become more comfortable with the language.`,
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
    content: `# Building Neobrutalist UI Designs

Neobrutalism is a design trend that embraces bold, high-contrast visuals with sharp edges and exaggerated shadows. It's a rebellion against the minimalist designs that have dominated the web for years.

## What is Neobrutalism?

Neobrutalism is characterized by:
- Thick, black borders (usually 3-4px)
- Hard shadows (often black)
- Bold, high-contrast colors
- Sharp corners (no border radius)
- Exaggerated hover effects

## Implementing Neobrutalism in CSS

Here's how you can create a neobrutalist button:

\`\`\`css
.neobrutalist-button {
  background: #FFD700; /* Bright yellow */
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;
  padding: 12px 24px;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.1s ease;
}

.neobrutalist-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000;
}
\`\`\`

## Color Palette

Neobrutalist designs often use:
- Electric blue (#0077FF)
- Hot pink (#FF1493)
- Lime green (#32FF32)
- Bright yellow (#FFD700)
- Neon orange (#FF6600)
- Purple punch (#9D4EDD)

## Typography

Bold, sans-serif fonts work best. Use uppercase text for emphasis and maintain high contrast between text and background.

## Conclusion

Neobrutalism is about making a statement. Don't be afraid to be bold and push the boundaries of traditional web design.`,
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
    content: `# My Journey into Open Source

Open source has been one of the most rewarding aspects of my development career. In this post, I'll share my journey and how you can get started.

## Why Contribute to Open Source?

1. **Learn from experienced developers** - Reading code from experts is invaluable
2. **Build your portfolio** - Show potential employers your skills
3. **Network with the community** - Connect with developers worldwide
4. **Give back** - Help projects that you use and love

## Getting Started

### 1. Find Projects That Interest You

Look for projects you already use or that solve problems you care about. GitHub's explore page is a great place to start.

### 2. Start Small

Don't try to fix a huge bug on day one. Start with:
- Fixing typos in documentation
- Adding tests
- Improving error messages
- Updating dependencies

### 3. Read the Contributing Guidelines

Every project has its own rules. Make sure you understand:
- How to set up the development environment
- Code style requirements
- Testing procedures
- Pull request process

## My First Contribution

My first contribution was fixing a typo in the README of a library I was using. It was small, but it gave me the confidence to tackle bigger issues.

## Tips for Success

1. **Be patient** - Maintainers are often volunteers
2. **Communicate clearly** - Explain your changes and why they're needed
3. **Follow the process** - Respect the project's contribution guidelines
4. **Learn from feedback** - Code reviews are learning opportunities

## Conclusion

Open source is more than just code - it's about community and collaboration. Start small, be consistent, and you'll grow both as a developer and as a community member.`,
    author: "Treyson Brown",
    publishDate: "Oct 15, 2024",
    readTime: "10 min read",
    tags: ["Open Source", "Community", "Growth"],
  },
  {
    id: 4,
    title: "Vim Tips for Productivity",
    excerpt: "Essential Vim commands and configurations that have significantly improved my development workflow.",
    content: `# Vim Tips for Productivity

Vim has transformed my development workflow. Here are the tips and configurations that have made the biggest impact on my productivity.

## Essential Commands

### Navigation
- \`h,j,k,l\` - Basic movement (left, down, up, right)
- \`w\` - Move to next word
- \`b\` - Move to previous word
- \`gg\` - Go to beginning of file
- \`G\` - Go to end of file
- \`Ctrl + f\` - Page down
- \`Ctrl + b\` - Page up

### Editing
- \`i\` - Insert mode before cursor
- \`a\` - Insert mode after cursor
- \`o\` - New line below, enter insert mode
- \`dd\` - Delete current line
- \`yy\` - Copy current line
- \`p\` - Paste after cursor
- \`u\` - Undo
- \`Ctrl + r\` - Redo

## My .vimrc Configuration

\`\`\`vim
" Basic settings
set number              " Show line numbers
set relativenumber      " Show relative line numbers
set tabstop=2           " Number of spaces tabs count for
set shiftwidth=2        " Number of spaces to use in autoindent
set expandtab           " Use spaces instead of tabs
set smartindent         " Smart autoindenting
set wrap                " Wrap lines
set showcmd             " Show incomplete cmds down the bottom
set scrolloff=10        " Minimum lines to keep above/below cursor

" Search settings
set incsearch           " Find as you type
set hlsearch            " Highlight search terms

" Visual settings
syntax on               " Syntax highlighting
set background=dark     " Dark background
colorscheme gruvbox     " Color scheme
\`\`\`

## Essential Plugins

1. **vim-plug** - Plugin manager
2. **NERDTree** - File explorer
3. **CtrlP** - Fuzzy file finder
4. **vim-airline** - Enhanced status bar
5. **vim-gitgutter** - Git changes in gutter

## Learning Resources

1. \`vimtutor\` - Built-in tutorial
2. Vim Adventures - Game-based learning
3. Practical Vim (book) by Drew Neil

## Conclusion

Vim has a steep learning curve, but the investment pays off in productivity. Start with the basics and gradually add more complex commands to your workflow.`,
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
    content: `# Arch Linux Setup Guide

Arch Linux offers a minimalist and flexible base that you can customize to your needs. Here's my setup for a development environment.

## Installation

Follow the official Arch Linux installation guide. Key steps:
1. Partition your disk
2. Install base system
3. Configure network
4. Install bootloader

## Post-Installation Setup

### Update System
\`\`\`bash
sudo pacman -Syu
\`\`\`

### Install Essential Packages
\`\`\`bash
sudo pacman -S git vim neovim code firefox alacritty
\`\`\`

### Enable Multilib Repository
Edit \`/etc/pacman.conf\` and uncomment:
\`\`\`
[multilib]
Include = /etc/pacman.d/mirrorlist
\`\`\`

## Development Environment

### Install Development Tools
\`\`\`bash
# Languages
sudo pacman -S nodejs npm python python-pip go rust

# Databases
sudo pacman -S postgresql redis

# Docker
sudo pacman -S docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
\`\`\`

### Configure Shell
\`\`\`bash
# Install Zsh and Oh My Zsh
sudo pacman -S zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
\`\`\`

## Desktop Environment

### Install GNOME
\`\`\`bash
sudo pacman -S gnome gnome-extra
sudo systemctl enable gdm
sudo systemctl start gdm
\`\`\`

### Configure Display Manager
\`\`\`bash
# Enable GDM
sudo systemctl enable gdm
\`\`\`

## Useful AUR Packages

Install yay for AUR packages:
\`\`\`bash
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
\`\`\`

## Performance Optimizations

1. Enable parallel downloads in pacman.conf
2. Use SSD optimization
3. Configure swappiness
4. Enable early KMS start

## Conclusion

Arch Linux gives you complete control over your system. While it requires more setup initially, the result is a tailored environment that works exactly how you want it to.`,
    author: "Treyson Brown",
    publishDate: "Sep 20, 2024",
    readTime: "12 min read",
    tags: ["Linux", "Arch", "Setup"],
  },
  {
    id: 6,
    title: "Building CLI Tools with Node.js",
    excerpt: "Learn how to create powerful command-line tools using Node.js and publish them to npm.",
    content: `# Building CLI Tools with Node.js

Command-line tools are essential for developer productivity. Node.js makes it easy to create and distribute CLI tools.

## Setting Up Your Project

### Initialize Your Project
\`\`\`bash
mkdir my-cli-tool
cd my-cli-tool
npm init -y
\`\`\`

### Add Bin Entry Point
In package.json:
\`\`\`json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "bin": {
    "mycli": "./bin/cli.js"
  }
}
\`\`\`

## Creating the CLI

### Shebang and Permissions
Create \`bin/cli.js\`:
\`\`\`javascript
#!/usr/bin/env node

console.log('Hello from my CLI tool!');
\`\`\`

Make it executable:
\`\`\`bash
chmod +x bin/cli.js
\`\`\`

## Parsing Command Line Arguments

### Using Commander.js
\`\`\`bash
npm install commander
\`\`\`

\`\`\`javascript
#!/usr/bin/env node
const { Command } = require('commander');

const program = new Command();

program
  .name('mycli')
  .description('CLI tool for doing awesome things')
  .version('1.0.0');

program
  .option('-d, --debug', 'output extra debugging')
  .option('-c, --config <path>', 'config file path');

program.parse();
\`\`\`

## Adding Colors and Formatting

### Using Chalk
\`\`\`bash
npm install chalk
\`\`\`

\`\`\`javascript
const chalk = require('chalk');

console.log(chalk.blue('Hello') + ' ' + chalk.red('World!'));
console.log(chalk.green.bold('Success!'));
\`\`\`

## User Input and Prompts

### Using Inquirer.js
\`\`\`bash
npm install inquirer
\`\`\`

\`\`\`javascript
const inquirer = require('inquirer');

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure?',
    },
  ])
  .then((answers) => {
    console.log(JSON.stringify(answers, null, 2));
  });
\`\`\`

## Publishing to npm

1. Login to npm:
\`\`\`bash
npm login
\`\`\`

2. Publish:
\`\`\`bash
npm publish
\`\`\`

## Best Practices

1. Handle errors gracefully
2. Provide helpful help text
3. Support common CLI patterns
4. Test your CLI thoroughly
5. Use semantic versioning

## Conclusion

Building CLI tools with Node.js is straightforward and rewarding. Start simple and gradually add features as needed.`,
    author: "Treyson Brown",
    publishDate: "Sep 10, 2024",
    readTime: "9 min read",
    tags: ["Node.js", "CLI", "Tools"],
  },
];

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
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{post.readTime}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">{post.title}</h1>

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
