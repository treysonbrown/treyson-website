import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Stats from "./pages/Stats";
import Auth from "./pages/Auth";
import ProjectDetail from "./pages/ProjectDetail";
import Boulders from "./pages/Boulders";
import Books from "./pages/Books";
import Planner from "./pages/Planner";
import Cubing from "./pages/Cubing";
import Directory from "./pages/Directory";
import Japan2026 from "./pages/Japan2026";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/plan" element={<Planner />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/boulders" element={<Boulders />} />
          <Route path="/books" element={<Books />} />
          <Route path="/cubing" element={<Cubing />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/japan2026" element={<Japan2026 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
