import { useEffect, useState } from "react";

interface NavbarProps {
  showHomeLink?: boolean;
  useAbsolutePaths?: boolean;
}

interface NavItem {
  label: string;
  href: string;
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
      : "flex flex-col gap-4 pt-8 text-center text-lg";
  const linkAccent = orientation === "horizontal" ? "" : "py-2 rounded-md bg-white/5 hover:bg-white/10";
  return (
    <div className={wrapperClasses}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`font-bold uppercase tracking-wide transition-colors hover:text-electric-blue ${linkAccent}`}
          onClick={onLinkClick}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
};

const Navbar = ({ showHomeLink = false, useAbsolutePaths = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems: NavItem[] = [
    showHomeLink ? { label: "Home", href: "/" } : null,
    { label: "About", href: useAbsolutePaths ? "/#about" : "#about" },
    { label: "Projects", href: useAbsolutePaths ? "/#projects" : "#projects" },
    { label: "Contact", href: useAbsolutePaths ? "/#contact" : "#contact" },
    { label: "Blog", href: "/blog" },
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
          className="ml-auto md:hidden flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/70 text-black shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={toggleMenu}
        >
          <span className="block h-0.5 w-6 rounded-full bg-current" />
          <span className="block h-0.5 w-6 rounded-full bg-current" />
          <span className="block h-0.5 w-6 rounded-full bg-current" />
        </button>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
        onClick={closeMenu}
      >
        <div
          id="mobile-menu"
          role="dialog"
          aria-label="Mobile navigation"
          className={`absolute top-0 right-0 flex h-full w-72 max-w-[80%] flex-col bg-background px-6 pb-10 pt-16 shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="text-xl font-bold uppercase tracking-wide text-left">
            <span className="bg-gradient-to-r from-[#614385] to-[#516395] bg-clip-text text-transparent">
              Treyson Brown
            </span>
          </div>
          <NavLinks orientation="vertical" items={navItems} onLinkClick={closeMenu} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
