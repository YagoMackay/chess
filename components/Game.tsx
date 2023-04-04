import Board from '@/components/Board';
import { auth, db } from '@/lib/firebase';
import { gameSubject, initGame, resetGame } from '@/lib/Game';
import { Box, Center, Container, Heading, Text } from '@chakra-ui/layout';
import { Button, ButtonGroup, Input, Skeleton } from '@chakra-ui/react';
import { User } from '@firebase/auth-types';
import { DocumentReference } from '@firebase/firestore-types';
import 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

interface Game {
  opponent: {
    name: string;
  };
  member: {
    name: string;
  };
  board: string[][];
  isGameOver: boolean;
  result: string;
  turn: string;
  position: string;
  status: string;
  player: {
    name: string;
  };
}

export default function Game() {
  const [board, setBoard] = useState([]);
  const [isGameOver, setIsGameOver] = useState();
  const [result, setResult] = useState();
  const [position, setPosition] = useState();
  const [turn, setTurn] = useState();
  const [user, setUser] = useState<User | null | undefined>();
  const router = useRouter();
  const [initResult, setInitResult] = useState<
    'notfound' | 'intruder' | undefined
  >(undefined);

  auth.onAuthStateChanged((currentUser) => {
    setUser(currentUser);
  });

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [game, setGame] = useState<Game>({
    opponent: { name: '' },
    member: { name: '' },
    player: { name: '' },
    board: [],
    isGameOver: false,
    result: '',
    turn: '',
    position: '',
    status: '',
  });
  const { id: gameId } = router.query;
  const shareableLink = window.location.href;

  let gameRef: DocumentReference | null = null;
  if (gameId !== 'local') {
    gameRef = db.doc(`game/${gameId}`);
  }
  let subscribe: Subscription;

  async function init() {
    if (!user) {
      console.log('NO USER FOUND');
      return undefined;
    }
    const res = await initGame(gameRef, user);

    setInitResult(res);
    setLoading(false);
    if (!res) {
      subscribe = gameSubject.subscribe((game) => {
        setBoard(game.board);
        setIsGameOver(game.isGameOver);
        setResult(game.result);
        setPosition(game.position);
        setStatus(game.status);
        setGame(game);
      });
    }
  }

  useEffect(() => {
    if (user) {
      init();
    }

    return () => subscribe && subscribe.unsubscribe();
  }, [gameId, user]);

  if (loading) {
    //@ts-ignore
    return <Skeleton>loading</Skeleton>;
  }

  if (initResult === 'notfound') {
    return <Box>Game not found</Box>;
  }

  if (initResult === 'intruder') {
    return <Box>The game is full</Box>;
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareableLink);
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container padding={0} margin={0}>
        <Box
          width="100vw"
          height="100vh"
          display={'flex'}
          background={'rgb(34, 34, 34)'}
          alignItems={'center'}
          justifyContent={'center'}
          position="relative"
        >
          {isGameOver && (
            <Text
              style={{
                textOrientation: 'upright',
                writingMode: 'vertical-lr',
                fontFamily: 'sans-serif',
              }}
              p={'10px'}
              color="white"
            >
              GAME OVER
              <ButtonGroup>
                <Button
                  p="10px"
                  color="white"
                  mt="20px"
                  cursor={'pointer'}
                  background="rgb(63,63,63)"
                  border={'2px solid white'}
                  borderRadius="10px"
                  onClick={async () => {
                    await resetGame;
                    router.push('/dashboard');
                  }}
                  style={{
                    textOrientation: 'upright',
                    writingMode: 'vertical-lr',
                    fontFamily: 'sans-serif',
                  }}
                >
                  {' '}
                  New Game
                  {/* <Text
                    style={{
                      textOrientation: 'upright',
                      writingMode: 'vertical-lr',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    New Game
                  </Text> */}
                </Button>
              </ButtonGroup>
            </Text>
          )}
          <Box display={'flex'} flexDir="column">
            {game.opponent && game.opponent.name && (
              <Box
                backgroundColor="cornflowerblue"
                padding={'10px'}
                borderRadius="10px"
                width={'20%'}
                marginLeft={'auto'}
              >
                <Heading size="md" color="white" textAlign={'center'}>
                  {game.opponent.name}
                </Heading>
              </Box>
            )}

            <Center width={'600px'} height={'600px'}>
              <Board board={board} position={position}></Board>
            </Center>
            {game.player && game.player.name && (
              <Box
                backgroundColor="teal"
                padding={'10px'}
                borderRadius="10px"
                width="20%"
              >
                <Heading size="md" color="white" textAlign={'center'}>
                  {game.player.name}
                </Heading>
              </Box>
            )}
          </Box>

          {result && (
            <>
              <Text
                style={{
                  textOrientation: 'upright',
                  writingMode: 'vertical-lr',
                  fontFamily: 'sans-serif',
                }}
                p={'10px'}
                color="white"
              >
                {result}
              </Text>
            </>
          )}
          {status === 'waiting' && (
            <Container
              position={'absolute'}
              width={'500px'}
              bottom={'0'}
              backgroundColor={'cornflowerblue'}
              borderRadius={'10px'}
            >
              <Heading
                color="white"
                size="md"
                paddingTop={5}
                textAlign="center"
              >
                Share this link with your opponent
              </Heading>
              <Box display={'flex'} padding={5}>
                <Input
                  type="text"
                  readOnly
                  value={shareableLink}
                  placeholder="Filled"
                  size="md"
                  bg="white"
                  color="black"
                ></Input>
                <Button colorScheme={'teal'} onClick={copyToClipboard}>
                  Copy
                </Button>
              </Box>
            </Container>
          )}
        </Box>
      </Container>
    </>
  );
}
