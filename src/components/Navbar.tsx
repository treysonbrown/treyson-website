import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  showHomeLink?: boolean;
  useAbsolutePaths?: boolean;
}

interface NavItem {
  label: string;
  to: string;
}

interface NavLinksProps {
  orientation?: "horizontal" | "vertical";
  items: NavItem[];
  onLinkClick?: () => void;
}

const NavLinks = ({ orientation = "horizontal", items, onLinkClick }: NavLinksProps) => {
  const wrapperClasses =
    orientation === "horizontal"
      ? "flex items-center gap-6"
      : "flex flex-col gap-5 pt-10 text-left text-xl";
  const linkAccent =
    orientation === "horizontal"
      ? ""
      : "py-2 px-3 rounded border-2 border-black/10 bg-white/70 text-black shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(0,0,0,0.4)]";
  return (
    <div className={wrapperClasses}>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`font-bold uppercase tracking-wide transition-colors hover:text-electric-blue ${linkAccent}`}
          onClick={onLinkClick}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

const Navbar = ({ showHomeLink = false, useAbsolutePaths = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems: NavItem[] = [
    showHomeLink ? { label: "Home", to: "/" } : null,
    { label: "About", to: useAbsolutePaths ? "/#about" : "#about" },
    { label: "Projects", to: useAbsolutePaths ? "/#projects" : "#projects" },
    { label: "Contact", to: useAbsolutePaths ? "/#contact" : "#contact" },
    { label: "Blog", to: "/blog" },
  ].filter((item): item is NavItem => Boolean(item));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isMenuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav className="fixed top-0 w-full bg-background border-b-3 border-black z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
        <div className="text-2xl font-bold uppercase tracking-wide">
          <span className="bg-gradient-to-r from-[#614385] to-[#516395] bg-clip-text text-transparent">
            Treyson Brown
          </span>
        </div>

        <div className="ml-auto hidden md:flex">
          <NavLinks items={navItems} />
        </div>

        <button
          type="button"
          className="ml-auto md:hidden group relative flex h-12 w-12 items-center justify-center border-2 border-black bg-white text-black shadow-[4px_4px_0_0_#000] transition-all duration-200 active:translate-x-1 active:translate-y-1 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-pressed={isMenuOpen}
          onClick={toggleMenu}
        >
          <span className="relative flex h-6 w-8 items-center justify-center">
            <span
              className={`absolute h-1 w-full rounded bg-black transition-all duration-300 ease-out ${
                isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-2"
              }`}
            />
            <span
              className={`absolute h-1 w-full rounded bg-black transition-all duration-200 ease-out ${
                isMenuOpen ? "scale-x-0 opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-1 w-full rounded bg-black transition-all duration-300 ease-out ${
                isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-2"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
        onClick={closeMenu}
      >
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={`relative flex h-full w-full max-w-sm flex-col border-l-4 border-black bg-white px-7 pb-10 pt-10 shadow-[12px_0_0_0_#000] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b-2 border-black pb-6">
            <div className="text-xl font-black uppercase tracking-[0.3em]">
              <span className="bg-gradient-to-r from-[#614385] to-[#516395] bg-clip-text text-transparent">
                Treyson Brown
              </span>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center border-2 border-black bg-white text-black shadow-[4px_4px_0_0_#000] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#000] focus:outline-none focus-visible:ring-2 focus-visible:ring-black active:translate-x-1 active:translate-y-1 active:shadow-none"
              onClick={closeMenu}
            >
              <span className="sr-only">Close menu</span>
              <span className="relative block h-5 w-5">
                <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black" />
                <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-black" />
              </span>
            </button>
          </div>
          <div className="mt-8 flex-1 overflow-y-auto">
            <NavLinks orientation="vertical" items={navItems} onLinkClick={closeMenu} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
