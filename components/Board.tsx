import { Grid, GridItem } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import BoardSquare from './BoardSquare';

//type for an object?
type BoardProps = {
  board?: any;
  turn: any;
};
const Board = ({ board, turn }: BoardProps) => {
  const [currentBoard, setCurrentBoard] = useState([]);

  useEffect(() => {
    setCurrentBoard(turn === 'w' ? board.flat() : board.flat().reverse());
  }, [board, turn]);
  const getXYPosition = (i: number) => {
    const x = turn === 'w' ? i % 8 : Math.abs((i % 8) - 7);
    const y =
      turn === 'w' ? Math.abs(Math.floor(i / 8) - 7) : Math.floor(i / 8);
    return { x, y };
  };
  const isBlack = (i: number) => {
    const { x, y } = getXYPosition(i);
    return (x + y) % 2 === 1;
  };

  const getPosition = (i: number) => {
    const { x, y } = getXYPosition(i);
    const letter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][x];
    return `${letter}${y + 1}`;
  };

  return (
    <Grid width={'100%'} height={'100%'} templateColumns="repeat(8, 1fr)">
      {currentBoard.map((piece: any, i: any) => (
        <GridItem key={i} height={'75px'} width={'75px'}>
          <BoardSquare
            piece={piece}
            black={isBlack(i)}
            position={getPosition(i)}
          />
        </GridItem>
      ))}
    </Grid>
  );
};
export default Board;
