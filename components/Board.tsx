import { getPosition, isBlack } from '@/functions/boardFunctions';
import { Grid, GridItem } from '@chakra-ui/react';
import { Color, PieceSymbol, Square } from 'chess.js';
import { useEffect, useState } from 'react';
import BoardSquare from './BoardSquare';

//type for an object?
type BoardProps = {
  board: { square: Square; type: PieceSymbol; color: Color };
  turn: Color;
};

const Board = ({ board, turn }: BoardProps) => {
  const [currentBoard, setCurrentBoard] = useState([]);

  useEffect(() => {
    //@ts-ignore
    setCurrentBoard(turn === 'w' ? board.flat() : board.flat().reverse());
  }, [board, turn]);

  return (
    <Grid width={'100%'} height={'100%'} templateColumns="repeat(8, 1fr)">
      {currentBoard.map((piece: any, i: any) => (
        <GridItem key={i} height={'75px'} width={'75px'}>
          <BoardSquare
            piece={piece}
            black={isBlack({ i, turn })}
            position={getPosition({ i, turn })}
          />
        </GridItem>
      ))}
    </Grid>
  );
};

export default Board;
