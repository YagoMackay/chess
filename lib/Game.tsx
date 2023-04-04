import { User } from '@firebase/auth-types';
import { Chess, Color } from 'chess.js';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { fromDocRef } from 'rxfire/firestore';
import { BehaviorSubject, map } from 'rxjs';

interface Member {
  uid: string;
  name: string;
  piece: string;
  creator: boolean;
}

interface InitialGameDetail {
  member: Member[];
  status: string;
}

type ResetFunction = () => void;

interface PendingPromotionProps {
  from: string;
  to: string;
  color: Color;
  tempMove?: string;
}

const chess = new Chess();

export let gameSubject = new BehaviorSubject<any>(null);

let member: Member;
let gameRef: firebase.firestore.DocumentReference | null = null;

/**
 * Initializes the game, loading game data from Firestore if a game reference is provided.
 * If not, the game will be initialized with a new chess board and the game state will be updated.
 * @param gameRefFb Optional reference to the game in Firestore
 * @returns Returns a string indicating the current state of the game initialization process
 */

export async function initGame(
  gameRefFb: firebase.firestore.DocumentReference | null | undefined = null,
  currentUser?: User
) {
  // Get the currently signed-in user from Firebase authentication

  // If a game reference is provided, use it to load the game data from Firestore
  if (gameRefFb) {
    // Store the game reference for later use
    gameRef = gameRefFb;

    // Load the game data from Firestore
    const initialGame: InitialGameDetail | undefined = await gameRefFb
      .get()
      .then((doc: firebase.firestore.DocumentSnapshot) => {
        const data = doc.data();

        return data ? (data as InitialGameDetail) : undefined;
      });

    // If the game data does not exist, return 'notfound'
    if (!initialGame) {
      return 'notfound';
    }

    // Find the creator of the game
    const creator = initialGame.member.find((m: Member) => m.creator === true);

    // If the game status is 'waiting' and the current user is not the creator, add the current user to the game
    if (initialGame.status === 'waiting' && creator?.uid !== currentUser!.uid) {
      // Create a new member object for the current user
      const currUser = {
        uid: currentUser!.uid,
        name: localStorage.getItem('userName'),
        piece: creator?.piece === 'w' ? 'b' : 'w',
      };

      // Add the current user to the game members and update the game status to 'ready'
      const updatedMembers = [...initialGame.member, currUser];

      // Validate the values being passed to update()
      if (updatedMembers.some((m) => !m?.uid || !m?.name || !m?.piece)) {
        console.error('Invalid member data:', updatedMembers);
        return;
      }

      await gameRefFb.update({ member: updatedMembers, status: 'ready' });
    }
    // If the current user is not a member of the game, return 'intruder'
    else if (
      !initialGame.member.map((m: Member) => m.uid).includes(currentUser!.uid)
    ) {
      return 'intruder';
    }
    chess.reset();

    // Create a new gameSubject and use the game reference to listen for changes in the game data
    // This allows the game state to be automatically updated when changes occur in Firestore
    //@ts-ignore
    gameSubject = fromDocRef(gameRefFb).pipe(
      // Map the game data to the game state object used by the application
      map((gameDoc) => {
        const game = gameDoc.data();

        // Find the member object for the current user
        member = game?.member.find((m: Member) => m.uid === currentUser?.uid);

        // Extract the gameData and pendingPromotion properties from the game object
        const { pendingPromotion, gameData, ...restOfGame }: any = game;

        // Find the opponent's member object
        const opponent = game?.member.find(
          (m: Member) => m.uid !== currentUser?.uid
        );

        const player = game?.member.find(
          (m: Member) => m.uid === currentUser?.uid
        );

        // Load the game data into the chess engine if it exists
        if (gameData) {
          chess.load(gameData);
        }

        // Determine if the game is over
        const isGameOver = chess.isGameOver();

        // Return the game state object
        return {
          board: chess.board(),
          pendingPromotion,
          isGameOver,
          position: member.piece,
          member,
          opponent,
          player,
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
export const move = (
  from: string,
  to: string,
  promotion?: PendingPromotionProps
) => {
  try {
    let tempMove = { from, to, promotion: promotion || undefined };
    if (promotion) {
      tempMove.promotion = promotion;
    }
    if (gameRef) {
      if (member.piece === chess.turn()) {
        const legalMove = chess.move(tempMove as unknown as string);
        if (legalMove) {
          updateGame();
        }
      }
    } else {
      const legalMove = chess.move(tempMove as unknown as string);
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

async function updateGame(
  pendingPromotion?: PendingPromotionProps | null,
  reset?: ResetFunction | boolean
) {
  const isGameOver = chess.isGameOver();

  // If a game reference exists, update the game data in Firestore
  if (gameRef) {
    console.log("AGAIN, SHOULDN'T BE HERE");
    // Prepare the updated data to be stored in Firestore
    const updatedData = {
      gameData: chess.fen(),
      pendingPromotion: pendingPromotion || null,
      status: '',
    };

    // If the reset flag is true, update the game status to 'over'
    if (reset) {
      updatedData.status = 'over';
    }

    // Update the game data in Firestore
    await gameRef.update(updatedData);
  }
  // If no game reference exists, save the game data locally and update the game subject
  else {
    // Prepare the game data to be saved locally and sent to the game subject
    const newGame = {
      board: chess.board(),
      pendingPromotion,
      isGameOver,
      position: chess.turn(),
      result: isGameOver ? getGameResult() : null,
    };

    // Save the game data locally
    localStorage.setItem('savedGame', chess.fen());

    // Update the game subject with the new game data
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
