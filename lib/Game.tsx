import { Chess } from 'chess.js';
import { BehaviorSubject } from 'rxjs';

const chess = new Chess();

export const gameSubject = new BehaviorSubject({ board: chess.board() });

export const move = (from: string, to: string, promotion?: any) => {
  try {
    let tempMove = { from, to, promotion };
    if (promotion) {
      tempMove.promotion = promotion;
    }
    const legalMove = chess.move(tempMove);
    if (legalMove) {
      updateGame();
    }
  } catch (error) {
    console.error(`Invalid move: ${JSON.stringify({ from, to })}`);
  }
};

export const handleMove = (from: any, to: any) => {
  const promotions = chess.moves({ verbose: true }).filter((m) => m.promotion);

  if (promotions.some((p) => `${p.from}:${p.to}` === `${from}:${to}`)) {
    const pendingPromotion = { from, to, color: promotions[0].color };
    updateGame(pendingPromotion);
  }
  //@ts-ignore
  const { pendingPromotion } = gameSubject.getValue();

  if (!pendingPromotion) {
    move(from, to);
  }
};

export const initGame = () => {
  updateGame();
};

export const resetGame = () => {
  chess.reset();
  updateGame();
};

export const updateGame = (pendingPromotion?: any) => {
  const isGameOver = chess.isGameOver();
  const newGame = {
    board: chess.board(),
    pendingPromotion,
    isGameOver,
    turn: chess.turn(),
    result: isGameOver ? getGameResult() : null,
  };
  gameSubject.next(newGame);
};

export const getGameResult = () => {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'BLACK' : 'WHITE';
    return `CHECKMATE - WINNER ${winner}`;
  } else if (chess.isDraw()) {
    let reason = '50 - MOVES - RULE';
    if (chess.isStalemate()) {
      reason = 'STALEMATE';
    } else if (chess.isThreefoldRepetition()) {
      reason = 'REPETITION';
    } else if (chess.isInsufficientMaterial()) {
      reason = 'INSUFFICIENT MATERIAL';
    }
    return `DRAW - ${reason}`;
  } else {
    return 'UNKNWON REASON';
  }
};
