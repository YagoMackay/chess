import { Grid, GridItem } from '@chakra-ui/react';
import BoardSquare from './BoardSquare';

//type for an object?
type BoardProps = {
  board?: any;
};
const Board = ({ board }: BoardProps) => {
  const getXYPosition = (i: number) => {
    const x = i % 8;
    const y = Math.abs(Math.floor(i / 8) - 7);
    return { x, y };
  };
  const isBlack = (i: number) => {
    const { x, y } = getXYPosition(i);
    return (x + y) % 2 === 1;
  };

  console.log('board', board);
  return (
    <Grid width={'100%'} height={'100%'} templateColumns="repeat(8, 12.5%)">
      {board?.flat().map((piece: any, i: any) => (
        <GridItem key={i} width={'100%'} height={'100%'}>
          <BoardSquare piece={piece} black={isBlack(i)} />
        </GridItem>
      ))}
    </Grid>
  );
};
export default Board;
