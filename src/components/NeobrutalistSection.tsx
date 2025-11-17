import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NeobrutalistSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export const NeobrutalistSection = ({ children, className, id }: NeobrutalistSectionProps) => {
  return (
    <section id={id} className={cn("py-16 px-4 scroll-mt-28 md:scroll-mt-40", className)}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
};
