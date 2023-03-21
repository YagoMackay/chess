import { Chess } from 'chess.js';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { fromDocRef } from 'rxfire/firestore';
import { BehaviorSubject, map } from 'rxjs';
import { auth } from './firebase';

interface Member {
  uid: string;
  name: string;
  piece: string;
  creator: boolean;
}

const chess = new Chess();

export let gameSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

let member: any;
let gameRef: any;

export async function initGame(gameRefFb?: any) {
  const { currentUser } = auth;

  if (gameRefFb) {
    gameRef = gameRefFb;

    const initialGame: { member: Member[]; status: string } | undefined =
      await gameRefFb
        .get()
        .then((doc: firebase.firestore.QueryDocumentSnapshot) => doc.data());
    if (!initialGame) {
      return 'notfound';
    }

    const creator = initialGame.member.find((m: Member) => m.creator === true);

    if (initialGame.status === 'waiting' && creator.uid !== currentUser?.uid) {
      const currUser = {
        uid: currentUser?.uid,
        name: localStorage.getItem('userName'),
        piece: creator.piece === 'w' ? 'b' : 'w',
      };

      const updatedMembers = [...initialGame.member, currUser];

      await gameRefFb.update({ member: updatedMembers, status: 'ready' });
    } else if (
      !initialGame.member.map((m: Member) => m.uid).includes(currentUser?.uid)
    ) {
      return 'intruder';
    }
    chess.reset();

    //not sure how to fix this
    //@ts-ignore
    gameSubject = fromDocRef(gameRefFb).pipe(
      map((gameDoc) => {
        const game = gameDoc.data();
        member = game?.member.find((m: Member) => m.uid === currentUser?.uid);

        const { pendingPromotion, gameData, ...restOfGame }: any = game;

        const oponent = game?.member.find(
          (m: Member) => m.uid !== currentUser?.uid
        );
        if (gameData) {
          chess.load(gameData);
        }
        const isGameOver = chess.isGameOver();
        return {
          board: chess.board(),
          pendingPromotion,
          isGameOver,
          position: member.piece,
          member,
          oponent,
          result: isGameOver ? getGameResult() : null,
          ...restOfGame,
        };
      })
    );
  } else {
    gameRef = null;

    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
      chess.load(savedGame);
    }
    updateGame();
  }
}
export const move = (from: string, to: string, promotion?: any) => {
  try {
    let tempMove = { from, to, promotion };
    if (promotion) {
      tempMove.promotion = promotion;
    }
    if (gameRef) {
      if (member.piece === chess.turn()) {
        const legalMove = chess.move(tempMove);
        if (legalMove) {
          updateGame();
        }
      }
    } else {
      const legalMove = chess.move(tempMove);
      if (legalMove) {
        updateGame();
      }
    }
  } catch (error) {
    console.error(`Invalid move: ${JSON.stringify({ from, to })}`);
  }
};

export function handleMove(from: string, to: string) {
  const promotions = chess.moves({ verbose: true }).filter((m) => m.promotion);
  console.table(promotions);
  let pendingPromotion;
  if (promotions.some((p) => `${p.from}:${p.to}` === `${from}:${to}`)) {
    pendingPromotion = { from, to, color: promotions[0].color };
    updateGame(pendingPromotion);
  }

  if (!pendingPromotion) {
    move(from, to);
  }
}

export const resetGame = async () => {
  if (gameRef) {
    await updateGame(null, true);
    chess.reset();
  } else {
    chess.reset();
    updateGame();
  }
};

async function updateGame(pendingPromotion?: any, reset?: any) {
  const isGameOver = chess.isGameOver();
  if (gameRef) {
    const updatedData = {
      gameData: chess.fen(),
      pendingPromotion: pendingPromotion || null,
    };

    if (reset) {
      updatedData.status = 'over';
    }
    await gameRef.update(updatedData);
  } else {
    const newGame = {
      board: chess.board(),
      pendingPromotion,
      isGameOver,
      position: chess.turn(),
      result: isGameOver ? getGameResult() : null,
    };
    localStorage.setItem('savedGame', chess.fen());
    gameSubject.next(newGame);
  }
}

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
