import { getPosition, isBlack } from '@/functions/boardFunctions';
import { Grid, GridItem } from '@chakra-ui/react';
import { Color, PieceSymbol, Square } from 'chess.js';
import { useEffect, useState } from 'react';
import BoardSquare from './BoardSquare';

//type for an object?
type BoardProps = {
  board: { square: Square; type: PieceSymbol; color: Color }[];
  position: Color;
};

type PieceProps = {
  square: string;
  type: string;
  color: string;
};

const Board = ({ board, position: position }: BoardProps) => {
  const [currentBoard, setCurrentBoard] = useState<
    { square: Square; type: PieceSymbol; color: Color }[]
  >([]);

  // !! Why do I need all these types for flat method?
  useEffect(() => {
    setCurrentBoard(position === 'w' ? board.flat() : board.flat().reverse());
  }, [board, position]);

  return (
    <Grid width={'100%'} height={'100%'} templateColumns="repeat(8, 1fr)">
      {currentBoard.map((piece: PieceProps, i: number) => (
        <GridItem key={i} height={'75px'} width={'75px'}>
          <BoardSquare
            piece={piece}
            black={isBlack({ i, turn: position })}
            position={getPosition({ i, turn: position })}
          />
        </GridItem>
      ))}
    </Grid>
  );
};

export default Board;
