import { MouseEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Terminal } from "lucide-react";

// --- CONFIGURATION ---
const ACCENT_COLOR = "#ff4499";

interface NavbarProps {
  showHomeLink?: boolean;
  useAbsolutePaths?: boolean;
}

interface NavItem {
  label: string;
  to: string;
}

const Navbar = ({ showHomeLink = false, useAbsolutePaths = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    showHomeLink ? { label: "Home", to: "/" } : null,
    { label: "About", to: useAbsolutePaths ? "/#about" : "#about" },
    { label: "Projects", to: useAbsolutePaths ? "/#projects" : "#projects" },
    { label: "Contact", to: useAbsolutePaths ? "/#contact" : "#contact" },
    { label: "Blog", to: "/blog" },
  ].filter((item): item is NavItem => Boolean(item));

  // Handle scroll effect for border opacity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
    const hashIndex = target.indexOf("#");
    if (hashIndex === -1) return;
    const hash = target.slice(hashIndex);
    if (location.pathname === "/" && location.hash === hash) {
      event.preventDefault();
      scrollToSection(hash.replace("#", ""));
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${isScrolled ? "py-4 border-b-4 border-black" : "py-6 border-b-4 border-transparent"
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter hover:scale-105 transition-transform"
            onClick={() => window.scrollTo(0, 0)}
          >
            <span>TREYSON BROWN</span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={(event) => handleNavClick(event, item.to)}
                className="relative font-mono font-bold text-sm group"
              >
                {/* The text */}
                <span className="relative z-10">{item.label}</span>

                {/* Hover highlight effect */}
                <span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-black transition-all duration-300 group-hover:h-full group-hover:opacity-20 -z-0"
                  style={{ backgroundColor: ACCENT_COLOR }}
                />

                {/* Bottom border on hover */}
                <span
                  className="absolute bottom-0 left-0 w-0 h-1 bg-black transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: ACCENT_COLOR }}
                />
              </Link>
            ))}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={toggleMenu}
      >
        <div
          className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white border-l-4 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="p-6 border-b-4 border-black flex justify-between items-center bg-gray-50">
            <span className="font-mono font-bold text-gray-500">NAVIGATION</span>
            <button
              onClick={toggleMenu}
              className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black"
            >
              <X size={24} />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {navItems.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={(event) => {
                  handleNavClick(event, item.to);
                  setIsMenuOpen(false);
                }}
                className="block"
              >
                <div
                  className="w-full p-4 border-4 border-black bg-white font-black text-xl uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-black hover:text-white group"
                >
                  <span className="text-[#ff4499] mr-2 group-hover:text-white transition-colors">0{index + 1}.</span>
                  {item.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t-4 border-black bg-black text-white">
            <p className="font-mono text-xs text-center">
              SYSTEM STATUS: <span className="text-[#ff4499]">ONLINE</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
