const FACES = ["R", "L", "U", "D", "F", "B"] as const;
const MODIFIERS = ["", "'", "2"] as const;

const AXIS_BY_FACE: Record<(typeof FACES)[number], "RL" | "UD" | "FB"> = {
  R: "RL",
  L: "RL",
  U: "UD",
  D: "UD",
  F: "FB",
  B: "FB",
};

const randomItem = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

export const generate333Scramble = (length = 20): string => {
  const moves: string[] = [];
  let previousFace: (typeof FACES)[number] | null = null;
  let previousAxis: "RL" | "UD" | "FB" | null = null;

  while (moves.length < length) {
    const face = randomItem(FACES);
    const axis = AXIS_BY_FACE[face];

    if (face === previousFace) continue;
    if (axis === previousAxis) continue;

    const modifier = randomItem(MODIFIERS);
    moves.push(`${face}${modifier}`);
    previousFace = face;
    previousAxis = axis;
  }

  return moves.join(" ");
};

