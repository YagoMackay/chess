import { Chess } from 'chess.js';
import { fromRef } from 'rxfire/firestore';
import { BehaviorSubject, map } from 'rxjs';
import { auth } from './firebase';

const chess = new Chess();

export let gameSubject;
let member;
let gameRef;

export const initGame = async (gameRefFb?: any) => {
  const currentUser = auth.currentUser;

  if (gameRefFb) {
    console.log('gameRef', gameRefFb);
    const doc = await gameRefFb.get();

    console.log('doc', doc);

    const initialGame = doc.data();

    if (!initialGame) {
      return 'notfound';
    }

    const creator = initialGame.members.find((m) => m.creator === true);
    if (initialGame.status === 'waiting' && creator.uid !== currentUser.uid) {
      const currUser = {
        uid: currentUser.uid,
        name: localStorage.getItem('userName'),
        piece: creator.piece === 'w' ? 'b' : 'w',
      };
      const updatedMembers = [...initialGame.members, currUser];
      await gameRefFb.update({ members: updatedMembers, status: 'ready' });
    } else if (
      !initialGame.members.map((m) => m.uid).includes(currentUser.uid)
    ) {
      return 'intruder';
    }

    chess.reset();

    gameSubject = fromRef(gameRefFb).pipe(
      map((gameDoc) => {
        const game = gameDoc.data();
        const { pendingPromotion, gameData, ...restOfGame } = game;
        member = game.members.find((m) => m.uid === currentUser.uid);
        const oponent = game.members.find((m) => m.uid !== currentUser.uid);

        if (gameData) {
          chess.load(gameData);
        }
        const isGameOver = chess.isGameOver();
        return {
          board: chess.board(),
          pendingPromotion,
          isGameOver,
          turn: member.piece,
          member,
          oponent,
          result: isGameOver ? getGameResult() : null,
          ...restOfGame,
        };
      })
    );
  } else {
    gameRef = null;
    gameSubject = new BehaviorSubject({ board: chess.board() });
    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
      chess.load(savedGame);
    }
    updateGame();
  }
};

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
