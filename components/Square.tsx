import { Box } from '@chakra-ui/react';

type SquareProps = {
  black?: boolean;
  children?: any;
};
const Square = ({ children, black }: SquareProps) => {
  const bgClass = black ? '#B59963' : '#F0D9B5';
  return (
    <Box background={bgClass} width={'100%'} height={'100%'}>
      {children}
    </Box>
  );
};
export default Square;
