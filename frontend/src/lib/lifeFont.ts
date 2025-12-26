// Simple 5x7 bitmap font for Conway's Game of Life seeding
// Each character is represented as an array of 7 rows, each row is a 5-bit number
// where 1 = alive cell, 0 = dead cell (read left to right as bits)

const FONT_WIDTH = 5;
const FONT_HEIGHT = 7;
const CHAR_SPACING = 1;
const WORD_SPACING = 3;

// 5x7 bitmap font - each number represents a row (5 bits, MSB = leftmost pixel)
const FONT: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01110, 0b10001, 0b10000, 0b01110, 0b00001, 0b10001, 0b01110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  " ": [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
  ".": [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100],
};

/**
 * Calculate the pixel width of a string
 */
export function getTextWidth(text: string): number {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    if (char === " ") {
      width += WORD_SPACING;
    } else if (FONT[char]) {
      width += FONT_WIDTH;
      if (i < text.length - 1 && text[i + 1] !== " ") {
        width += CHAR_SPACING;
      }
    }
  }
  return width;
}

/**
 * Generate cell coordinates for text to be seeded into the Life grid
 * @param text The text to render
 * @param cols Total columns in the grid
 * @param rows Total rows in the grid
 * @returns Array of [row, col] coordinates that should be alive
 */
export function seedText(
  text: string,
  cols: number,
  rows: number
): [number, number][] {
  const cells: [number, number][] = [];
  const textWidth = getTextWidth(text);

  // Center horizontally
  let startX = Math.floor((cols - textWidth) / 2);
  // Position in upper third of grid
  const startY = Math.floor(rows / 3) - Math.floor(FONT_HEIGHT / 2);

  if (startX < 0) startX = 1;

  let cursorX = startX;

  for (const rawChar of text) {
    const char = rawChar.toUpperCase();

    if (char === " ") {
      cursorX += WORD_SPACING;
      continue;
    }

    const bitmap = FONT[char];
    if (!bitmap) continue;

    for (let row = 0; row < FONT_HEIGHT; row++) {
      const rowBits = bitmap[row];
      for (let col = 0; col < FONT_WIDTH; col++) {
        // Check if this bit is set (MSB = leftmost)
        const isAlive = (rowBits >> (FONT_WIDTH - 1 - col)) & 1;
        if (isAlive) {
          const gridRow = startY + row;
          const gridCol = cursorX + col;
          // Only add if within bounds
          if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
            cells.push([gridRow, gridCol]);
          }
        }
      }
    }

    cursorX += FONT_WIDTH + CHAR_SPACING;
  }

  return cells;
}

export { FONT_WIDTH, FONT_HEIGHT };

