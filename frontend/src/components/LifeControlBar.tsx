import { Play, Pause, Pencil, Eraser, Trash2, X } from "lucide-react";

const ACCENT_COLOR = "#ff4499";

interface LifeControlBarProps {
  isRunning: boolean;
  mode: "draw" | "erase";
  onToggleRunning: () => void;
  onSetMode: (mode: "draw" | "erase") => void;
  onClear: () => void;
  onExit: () => void;
}

export default function LifeControlBar({
  isRunning,
  mode,
  onToggleRunning,
  onSetMode,
  onClear,
  onExit,
}: LifeControlBarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 border-b-4 border-black dark:border-white bg-background dark:bg-zinc-950 transition-all duration-300">
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-3">
          <span
            className="text-xl font-black uppercase tracking-tighter dark:text-white"
            style={{ color: ACCENT_COLOR }}
          >
            GAME OF LIFE
          </span>
        </div>

        {/* Controls - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Draw/Erase Toggle */}
          <div className="flex border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            <button
              onClick={() => onSetMode("draw")}
              disabled={isRunning}
              className={`flex items-center gap-2 px-3 py-2 font-mono text-sm font-bold transition-colors disabled:opacity-50 ${
                mode === "draw"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-background dark:bg-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
              title="Draw cells"
            >
              <Pencil size={16} />
              Draw
            </button>
            <button
              onClick={() => onSetMode("erase")}
              disabled={isRunning}
              className={`flex items-center gap-2 px-3 py-2 font-mono text-sm font-bold border-l-2 border-black dark:border-white transition-colors disabled:opacity-50 ${
                mode === "erase"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-background dark:bg-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
              title="Erase cells"
            >
              <Eraser size={16} />
              Erase
            </button>
          </div>

          {/* Start/Stop */}
          <button
            onClick={onToggleRunning}
            className="flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: isRunning ? ACCENT_COLOR : "transparent",
              color: isRunning ? "white" : undefined,
            }}
          >
            {isRunning ? (
              <>
                <Pause size={16} />
                Stop
              </>
            ) : (
              <>
                <Play size={16} />
                Start
              </>
            )}
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-2 font-mono text-sm font-bold border-2 border-black dark:border-white bg-background dark:bg-zinc-900 dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5 disabled:opacity-50"
            title="Clear all cells"
          >
            <Trash2 size={16} />
            Clear
          </button>

          {/* Exit */}
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-0.5"
          >
            <X size={16} />
            Exit
          </button>
        </div>

        {/* Controls - Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {/* Start/Stop */}
          <button
            onClick={onToggleRunning}
            className="p-2 border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            style={{
              backgroundColor: isRunning ? ACCENT_COLOR : "transparent",
              color: isRunning ? "white" : undefined,
            }}
            title={isRunning ? "Stop" : "Start"}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Draw/Erase Toggle */}
          <button
            onClick={() => onSetMode(mode === "draw" ? "erase" : "draw")}
            disabled={isRunning}
            className="p-2 border-2 border-black dark:border-white bg-background dark:bg-zinc-900 dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50"
            title={mode === "draw" ? "Switch to Erase" : "Switch to Draw"}
          >
            {mode === "draw" ? <Pencil size={20} /> : <Eraser size={20} />}
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={isRunning}
            className="p-2 border-2 border-black dark:border-white bg-background dark:bg-zinc-900 dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50"
            title="Clear all cells"
          >
            <Trash2 size={20} />
          </button>

          {/* Exit */}
          <button
            onClick={onExit}
            className="p-2 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            title="Exit Game of Life"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
