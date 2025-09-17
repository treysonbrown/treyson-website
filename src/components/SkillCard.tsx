import { Card, CardContent } from "@/components/ui/card";

interface SkillCardProps {
  skill: string;
  level: string;
  color: "electric-blue" | "hot-pink" | "lime-green" | "bright-yellow" | "neon-orange" | "purple-punch";
}

export const SkillCard = ({ skill, level, color }: SkillCardProps) => {
  const bgColorClass = `bg-${color}`;
  
  return (
    <Card className={`${bgColorClass} text-white border-brutal neobrutalist-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default`}>
      <CardContent className="p-6 text-center">
        <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">{skill}</h3>
        <p className="text-sm font-mono opacity-90">{level}</p>
      </CardContent>
    </Card>
  );
};