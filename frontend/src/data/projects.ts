import thesisImage from "@/assets/Thesis.png";
import pharmaEduImage from "@/assets/pharma-edu.png";
import statsImage from "@/assets/stats.png";

export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  tech: string[];
  liveUrl?: string;
  githubUrl?: string;
  status: string;
  image?: string;
}

export const projects: Project[] = [
  {
    slug: "thesis-erp",
    title: "Thesis ERP",
    shortDescription:
      "Grant financial management for PIs. Replacing complex spreadsheets with intuitive software to track burn rates and compliance.",
    longDescription:
      "Thesis ERP is a focused tool for Principal Investigators to track post-award grant finances without wrestling spreadsheets. It brings together burn rate tracking, upcoming deadlines, and compliance tasks into a single, opinionated workflow that fits how researchers actually work.",
    tech: ["React", "FastAPI", "PostgreSQL", "SQLModel"],
    liveUrl: "https://thesiserp.com",
    status: "PRODUCTION",
    image: thesisImage,
  },
  {
    slug: "stats",
    title: "Stats",
    shortDescription:
      "A stat tracker with heatmaps.",
    tech: ["React", "FastAPI", "PostgreSQL", "SQLModel"],
    liveUrl: "https://stats.treyson.org/treyson",
    status: "PRODUCTION",
    image: statsImage,
  },
  {
    slug: "pharma-edu",
    title: "Pharma EDU",
    shortDescription:
      "Educational platform for pharmacy students. Features interactive quizzes, progress tracking, and material distribution.",
    longDescription:
      "Pharma EDU is a learning platform for pharmacy students, built to help instructors deliver material, track student progress, and run interactive assessments. It focuses on clarity and reliability rather than flashy UI, making it easy to deploy in academic settings.",
    tech: ["React", "FastAPI", "PostgreSQL", "Alembic"],
    liveUrl: "https://pharmacy.projectgnome.org/login",
    status: "LIVE",
    image: pharmaEduImage,
  },
];

