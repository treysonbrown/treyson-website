import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Plus, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import ProjectBoard from "./ProjectBoard";

const getErrorMessage = (err: unknown) => {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "Something went wrong";
};

type ProjectDoc = {
  _id: string;
  name: string;
  role?: "owner" | "member";
};

const ACCENT_PRIMARY_BUTTON_CLASS =
  "bg-[#ff5cab] text-black hover:bg-[#ff78ba] dark:bg-[#ff5cab] dark:text-black dark:hover:bg-[#ff78ba] shadow-[3px_3px_0px_0px_rgba(255,92,171,0.35)]";
const ACCENT_UTILITY_BUTTON_CLASS =
  "bg-background dark:bg-zinc-950 text-black dark:text-white hover:border-[#ff5cab] hover:text-[#ff9fd0] hover:bg-[#ff5cab]/10";

export default function PlannerApp() {
  const { isLoaded, isSignedIn } = useAuth();
  const me = useQuery("users:me" as never) as
    | null
    | undefined
    | { _id: string; username: string; name?: string; imageUrl?: string };
  const upsertMe = useMutation("users:upsertMe" as never) as unknown as () => Promise<string>;
  const setUsername = useMutation("users:setUsername" as never) as unknown as (args: {
    username: string;
  }) => Promise<string>;

  const projects = useQuery("planner:listProjects" as never) as ProjectDoc[] | undefined;
  const createProject = useMutation("planner:createProject" as never) as unknown as (args: {
    name: string;
  }) => Promise<string>;

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectId = searchParams.get("project") ?? "";

  const [newProjectName, setNewProjectName] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const hasRunUpsert = useRef(false);
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (hasRunUpsert.current) return;
    if (me !== null) return;
    hasRunUpsert.current = true;
    upsertMe().catch((err: unknown) => {
      hasRunUpsert.current = false;
      toast.error(getErrorMessage(err));
    });
  }, [isLoaded, isSignedIn, me, upsertMe]);

  const sortedProjects = useMemo(() => {
    if (!projects) return undefined;
    return [...projects].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  useEffect(() => {
    if (!sortedProjects || sortedProjects.length === 0) return;
    if (selectedProjectId) return;
    setSearchParams({ project: sortedProjects[0]._id }, { replace: true });
  }, [sortedProjects, selectedProjectId, setSearchParams]);

  useEffect(() => {
    if (!me) return;
    setNewUsername(me.username);
  }, [me]);

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) {
      toast.error("Project name is required");
      return;
    }
    try {
      const projectId = await createProject({ name });
      setNewProjectName("");
      setSearchParams({ project: projectId });
      toast.success("Project created");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSetUsername = async () => {
    try {
      const updated = await setUsername({ username: newUsername });
      toast.success(`Username set to @${updated}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  if (me === undefined || projects === undefined) {
    return (
      <div className="w-full">
        <div className="border-2 border-black dark:border-white bg-card dark:bg-zinc-900 p-6 font-mono text-sm text-gray-600 dark:text-gray-300">
          Loading planner...
        </div>
      </div>
    );
  }

  if (me === null) {
    return (
      <div className="w-full">
        <div className="border-2 border-black dark:border-white bg-card dark:bg-zinc-900 p-6 font-mono text-sm text-gray-600 dark:text-gray-300">
          Initializing your account...
        </div>
      </div>
    );
  }

  if (!sortedProjects || sortedProjects.length === 0) {
    return (
      <div className="w-full max-w-3xl">
        <div className="border-4 border-black dark:border-white bg-card dark:bg-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Getting Started
              </p>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tighter dark:text-white">
                Create a Project
              </h2>
              <p className="mt-3 font-mono text-sm text-gray-600 dark:text-gray-300">
                Projects contain columns and tasks. Invite teammates by username after you create one.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className={`rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_UTILITY_BUTTON_CLASS}`}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Username
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-none border-2 border-black dark:border-white">
                <DialogHeader>
                  <DialogTitle className="font-black uppercase tracking-tight">Set username</DialogTitle>
                  <DialogDescription className="font-mono">
                    Others can invite you to projects using this.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. treyson"
                    className="rounded-none border-2 border-black dark:border-white font-mono"
                  />
                  <Button
                    type="button"
                    onClick={handleSetUsername}
                    className={`w-full rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
                  >
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder='e.g. "Website Launch"'
              className="rounded-none border-2 border-black dark:border-white font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateProject();
              }}
            />
            <Button
              type="button"
              onClick={handleCreateProject}
              className={`rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </div>

          <div className="mt-6 border-2 border-black dark:border-white bg-background dark:bg-zinc-950 p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Your handle
            </p>
            <p className="mt-1 font-black text-lg dark:text-white">@{me?.username ?? "..."}</p>
          </div>
        </div>
      </div>
    );
  }

  const selected = sortedProjects.find((p) => p._id === selectedProjectId) ?? sortedProjects[0];

  return (
    <div className="w-full grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="border-4 border-black dark:border-white bg-card dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
        <div className="border-b-4 border-black dark:border-white p-5 bg-background dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Signed in as
              </p>
              <p className="font-black text-lg dark:text-white">@{me?.username}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className={`rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_UTILITY_BUTTON_CLASS}`}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-none border-2 border-black dark:border-white">
                <DialogHeader>
                  <DialogTitle className="font-black uppercase tracking-tight">Set username</DialogTitle>
                  <DialogDescription className="font-mono">
                    Used for project invites.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. treyson"
                    className="rounded-none border-2 border-black dark:border-white font-mono"
                  />
                  <Button
                    type="button"
                    onClick={handleSetUsername}
                    className={`w-full rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
                  >
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Projects
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    className={`h-9 rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_UTILITY_BUTTON_CLASS}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-none border-2 border-black dark:border-white">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tight">Create project</DialogTitle>
                    <DialogDescription className="font-mono">
                      Boards live inside projects.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Project name"
                      className="rounded-none border-2 border-black dark:border-white font-mono"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateProject();
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleCreateProject}
                      className={`w-full rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
                    >
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-2">
              {sortedProjects.map((p) => {
                const isActive = p._id === selected._id;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setSearchParams({ project: p._id })}
                    className={`text-left w-full border-2 rounded-none px-3 py-2 transition-colors ${isActive
                      ? "border-[#ff5cab] bg-[#ff5cab]/15 text-black dark:text-white"
                      : "border-black/60 dark:border-white/60 bg-background dark:bg-zinc-950 hover:bg-gray-50 dark:hover:bg-zinc-800 dark:text-white"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black uppercase tracking-tight truncate">{p.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                        {p.role ?? "member"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-2 border-black dark:border-white bg-background dark:bg-zinc-950 p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Tip
            </p>
            <p className="mt-2 font-mono text-sm text-gray-600 dark:text-gray-300">
              Use the project header to invite teammates by username.
            </p>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <ProjectBoard projectId={selected._id} />
      </section>
    </div>
  );
}
