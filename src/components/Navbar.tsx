interface NavbarProps {
  showHomeLink?: boolean;
  useAbsolutePaths?: boolean;
}

const Navbar = ({ showHomeLink = false, useAbsolutePaths = false }: NavbarProps) => {
  return (
    <nav className="fixed top-0 w-full bg-background border-b-3 border-black z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold uppercase tracking-wide">
          <span className="bg-gradient-to-r from-[#614385] to-[#516395] bg-clip-text text-transparent">
            Treyson Brown
          </span>
        </div>

        <div className="hidden md:flex gap-6">
          {showHomeLink && (
            <a href="/" className="font-bold uppercase tracking-wide hover:text-electric-blue transition-colors">
              Home
            </a>
          )}
          <a
            href={useAbsolutePaths ? "/#about" : "#about"}
            className="font-bold uppercase tracking-wide hover:text-electric-blue transition-colors"
          >
            About
          </a>
          <a
            href={useAbsolutePaths ? "/#projects" : "#projects"}
            className="font-bold uppercase tracking-wide hover:text-electric-blue transition-colors"
          >
            Projects
          </a>
          <a
            href={useAbsolutePaths ? "/#contact" : "#contact"}
            className="font-bold uppercase tracking-wide hover:text-electric-blue transition-colors"
          >
            Contact
          </a>
          <a href="/blog" className="font-bold uppercase tracking-wide hover:text-electric-blue transition-colors">
            Blog
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
