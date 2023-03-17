import { Center } from '@chakra-ui/react';
import Image from 'next/image';
import { DragPreviewImage, useDrag } from 'react-dnd';

export interface PieceProps {
  piece: {
    type: string;
    color?: string;
  };
  square?: string;

  position: string;
}

interface PieceDragObject {
  id: string;
  type: string;
}
const Piece = ({
  piece: { type, color },
  square,

  position,
}: PieceProps) => {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    item: { id: `${position}_${type}_${color}` },
    type: 'piece',
    collect: (monitor) => {
      return { isDragging: !!monitor.isDragging() };
    },
  });
  const pieceImg = require(`../public/images/assets/${type}_${color}.png`);

  return (
    <>
      <DragPreviewImage connect={dragPreview} src={pieceImg} />
      <Center
        cursor={'grab'}
        width={'100%'}
        height="100%"
        display={'flex'}
        ref={drag}
        alignItems={'center'}
        justifyContent={'center'}
        style={{ opacity: isDragging ? 0 : 1 }}
      >
        <Image src={pieceImg} alt="chess-piece" width={45} height={45}></Image>
      </Center>
    </>
  );
};
export default Piece;
