import { useEffect, useRef, useCallback, useState } from "react";
import { seedText } from "@/lib/lifeFont";

const CELL_SIZE = 20; // 20px cells = 4 cells per 40px grid square
const MAJOR_GRID_SIZE = 40; // Original grid line spacing

interface HeroLifeGridProps {
  isRunning: boolean;
  mode: "draw" | "erase";
  resetTrigger: number; // Increment to trigger reset
  clearTrigger: number; // Increment to trigger clear
}

// Conway's Game of Life step function with bounded edges
function stepLife(
  grid: Uint8Array,
  cols: number,
  rows: number
): Uint8Array {
  const next = new Uint8Array(grid.length);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      let neighbors = 0;

      // Check all 8 neighbors, skipping out-of-bounds
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            neighbors += grid[nr * cols + nc];
          }
        }
      }

      const alive = grid[idx];
      // Conway's rules:
      // - Live cell with 2-3 neighbors survives
      // - Dead cell with exactly 3 neighbors becomes alive
      if (alive) {
        next[idx] = neighbors === 2 || neighbors === 3 ? 1 : 0;
      } else {
        next[idx] = neighbors === 3 ? 1 : 0;
      }
    }
  }

  return next;
}

export default function HeroLifeGrid({
  isRunning,
  mode,
  resetTrigger,
  clearTrigger,
}: HeroLifeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<Uint8Array | null>(null);
  const dimsRef = useRef<{ cols: number; rows: number }>({ cols: 0, rows: 0 });
  const isDrawingRef = useRef(false);
  const lastCellRef = useRef<{ row: number; col: number } | null>(null);
  const [, forceRender] = useState(0);

  // Initialize or resize grid
  const initGrid = useCallback((seedName: boolean = true) => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    canvas.width = width;
    canvas.height = height;

    const cols = Math.floor(width / CELL_SIZE);
    const rows = Math.floor(height / CELL_SIZE);

    dimsRef.current = { cols, rows };
    gridRef.current = new Uint8Array(cols * rows);

    if (seedName) {
      // Seed "TREYSON BROWN" in block letters
      const cells = seedText("TREYSON BROWN", cols, rows);
      for (const [row, col] of cells) {
        gridRef.current[row * cols + col] = 1;
      }
    }

    forceRender((n) => n + 1);
  }, []);

  // Draw the grid
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const grid = gridRef.current;
    if (!canvas || !ctx || !grid) return;

    const { cols, rows } = dimsRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get computed styles for theming
    const isDark = document.documentElement.classList.contains("dark");
    const cellColor = isDark ? "#ff4499" : "#ff4499";
    const majorGridColor = isDark ? "#3f3f46" : "#e5e5e5";
    const minorGridColor = isDark ? "#27272a" : "#f0f0f0";

    // Draw minor grid lines (20px)
    ctx.strokeStyle = minorGridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += CELL_SIZE) {
      if (x % MAJOR_GRID_SIZE !== 0) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }
    }
    for (let y = 0; y <= height; y += CELL_SIZE) {
      if (y % MAJOR_GRID_SIZE !== 0) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
    }
    ctx.stroke();

    // Draw major grid lines (40px) - slightly stronger
    ctx.strokeStyle = majorGridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += MAJOR_GRID_SIZE) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }
    for (let y = 0; y <= height; y += MAJOR_GRID_SIZE) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();

    // Draw alive cells
    ctx.fillStyle = cellColor;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (grid[row * cols + col]) {
          ctx.fillRect(
            col * CELL_SIZE + 1,
            row * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
          );
        }
      }
    }
  }, []);

  // Handle pointer events for drawing/erasing
  const getCellFromEvent = useCallback(
    (e: React.PointerEvent | PointerEvent): { row: number; col: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);

      const { cols, rows } = dimsRef.current;
      if (col < 0 || col >= cols || row < 0 || row >= rows) return null;

      return { row, col };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isRunning) return;

      isDrawingRef.current = true;
      const cell = getCellFromEvent(e);
      if (!cell || !gridRef.current) return;

      const { row, col } = cell;
      const { cols } = dimsRef.current;
      const idx = row * cols + col;

      gridRef.current[idx] = mode === "draw" ? 1 : 0;
      lastCellRef.current = cell;
      draw();

      // Capture pointer for smooth dragging
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isRunning, mode, getCellFromEvent, draw]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current || isRunning || !gridRef.current) return;

      const cell = getCellFromEvent(e);
      if (!cell) return;

      // Skip if same cell as last
      if (
        lastCellRef.current &&
        lastCellRef.current.row === cell.row &&
        lastCellRef.current.col === cell.col
      ) {
        return;
      }

      const { row, col } = cell;
      const { cols } = dimsRef.current;
      const idx = row * cols + col;

      gridRef.current[idx] = mode === "draw" ? 1 : 0;
      lastCellRef.current = cell;
      draw();
    },
    [isRunning, mode, getCellFromEvent, draw]
  );

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastCellRef.current = null;
  }, []);

  // Initialize on mount
  useEffect(() => {
    initGrid(true);

    const handleResize = () => {
      // Preserve grid state on resize if possible
      initGrid(false);
      draw();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initGrid, draw]);

  // Draw when grid changes
  useEffect(() => {
    draw();
  }, [draw]);

  // Game loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const grid = gridRef.current;
      if (!grid) return;

      const { cols, rows } = dimsRef.current;
      gridRef.current = stepLife(grid, cols, rows);
      draw();
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, draw]);

  // Handle reset trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      initGrid(true);
      draw();
    }
  }, [resetTrigger, initGrid, draw]);

  // Handle clear trigger
  useEffect(() => {
    if (clearTrigger > 0 && gridRef.current) {
      gridRef.current.fill(0);
      draw();
    }
  }, [clearTrigger, draw]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10"
      style={{ cursor: isRunning ? "default" : mode === "draw" ? "crosshair" : "pointer" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}

