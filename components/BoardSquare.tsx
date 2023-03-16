import { Box } from '@chakra-ui/layout';
import Piece from './Piece';
import Square from './Square';

export type PieceProps = {
  piece?: {
    type?: string;
    square?: string;
    color?: string;
  };

  black?: boolean;
};
const BoardSquare = ({ piece, black }: PieceProps) => {
  console.log('piece', piece);
  return (
    <Box width={'100%'} height={'100%'}>
      <Square black={black}>
        {piece && <Piece pieceType={piece.type} color={piece.color}></Piece>}
      </Square>
    </Box>
  );
};
export default BoardSquare;
