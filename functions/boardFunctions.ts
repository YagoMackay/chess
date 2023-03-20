import { Color } from 'chess.js';

export interface GetPieceDetailProps {
  i: number;
  turn: Color;
}

export interface XYPosition {
  x: number;
  y: number;
}

export const getXYPosition = ({ i, turn }: GetPieceDetailProps): XYPosition => {
  const x = turn === 'w' ? i % 8 : Math.abs((i % 8) - 7);
  const y = turn === 'w' ? Math.abs(Math.floor(i / 8) - 7) : Math.floor(i / 8);
  return { x, y };
};

export const isBlack = ({ i, turn }: GetPieceDetailProps): boolean => {
  const { x, y } = getXYPosition({ i, turn });

  return (x + y) % 2 === 1;
};

export const getPosition = ({ i, turn }: GetPieceDetailProps): string => {
  const { x, y } = getXYPosition({ i, turn });
  const letter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][x];
  return `${letter}${y + 1}`;
};
