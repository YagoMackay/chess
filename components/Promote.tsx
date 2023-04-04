import { move } from '@/lib/Game';
import { Box, Grid } from '@chakra-ui/react';
import Image from 'next/image';
import Square from './Square';

type PromotionProps = {
  promotion: {
    from: string;
    to: string;
    color: string;
  };
};

const promotionPieces = ['r', 'n', 'b', 'q'];
const Promote = ({ promotion: { from, to, color } }: PromotionProps) => {
  return (
    //@ts-ignore
    <Grid
      w={'100%'}
      h={'100%'}
      templateRows="repeat(2, 1fr)"
      templateColumns={'repeat(2, 1fr)'}
    >
      {promotionPieces.map((p: any, i) => (
        <Box key={i}>
          <Square black={i % 3 === 0}>
            <Box width="50%" height="50%" onClick={() => move(from, to, p)}>
              {' '}
              <Image
                src={require(`../public/images/assets/${p}_${color}.png`)}
                alt="chess-piece"
                height={30}
                width={30}
                style={{ cursor: 'pointer' }}
              ></Image>
            </Box>
          </Square>
        </Box>
      ))}
    </Grid>
  );
};
export default Promote;
