import { Center } from '@chakra-ui/react';
import Image from 'next/image';

export interface PieceProps {
  square?: string;
  pieceType?: string;
  color?: string;
}
const Piece = ({ pieceType, square, color }: PieceProps) => {
  console.log('piece', pieceType, color);
  const pieceImg = require(`../public/images/assets/${pieceType}_${color}.png`);

  return (
    <Center cursor={'grab'} width={'100%'} height="100%" display={'flex'}>
      <Image src={pieceImg} alt="chess-piece" width={50} height={50}></Image>
    </Center>
  );
};
export default Piece;
