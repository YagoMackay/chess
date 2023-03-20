import { gameSubject, handleMove } from '@/lib/Game';
import { Box } from '@chakra-ui/layout';
import { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import Piece from './Piece';
import Promote from './Promote';
import Square from './Square';

export type PieceProps = {
  piece?: {
    type: string;
    square?: string;
    color?: string;
  };
  position: string;
  black?: boolean;
};
const BoardSquare = ({ piece, black, position }: PieceProps) => {
  const [promotion, setPromotion] = useState(null);
  const [, drop] = useDrop({
    accept: 'piece',
    drop: (item: any) => {
      const [fromPosition] = item.id.split('_');

      handleMove(fromPosition, position);
    },
  });
  useEffect(() => {
    const subscribe = gameSubject.subscribe(({ pendingPromotion }: any) =>
      pendingPromotion && pendingPromotion.to === position
        ? setPromotion(pendingPromotion)
        : setPromotion(null)
    );
    return () => subscribe.unsubscribe();
  }, [position]);

  return (
    <Box width={'100%'} height={'100%'} ref={drop}>
      <Square black={black}>
        {promotion ? (
          <Promote promotion={promotion} />
        ) : piece ? (
          <Piece piece={piece} position={position}></Piece>
        ) : null}
      </Square>
    </Box>
  );
};
export default BoardSquare;
