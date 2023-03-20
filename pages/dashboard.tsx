import { Box, Center, Flex } from '@chakra-ui/layout';
import { useRouter } from 'next/router';

import { auth, db } from '@/lib/firebase';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { doc, setDoc } from 'firebase/firestore';

export default function Dashboard() {
  const currentUser = auth.currentUser;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const startOnlineGame = async (
    startingPiece: 'white' | 'black' | 'random'
  ) => {
    const member = {
      uid: currentUser?.uid,
      piece:
        startingPiece === 'random'
          ? ['b', 'w'][Math.round(Math.random())]
          : startingPiece,
      name: localStorage.getItem('userName'),
      creator: true,
    };
    const game = {
      status: 'waiting',
      member: [member],
      gameId: `${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
    };

    await setDoc(doc(db, 'game', game.gameId), game);
    router.push(`/game/${game.gameId}`);
  };
  const newGameOptions = [
    {
      label: 'Black',
      value: 'b',
    },
    {
      label: 'White',
      value: 'w',
    },
    {
      label: 'Random',
      value: 'r',
    },
  ];
  return (
    <Box>
      <Flex width="100vw" height="100vh">
        <Center backgroundColor={'teal'} width="100%">
          <Button colorScheme="blue" onClick={onOpen}>
            Play Locally
          </Button>
        </Center>

        <Center backgroundColor={'blue'} width="100%">
          <Button colorScheme={'teal'} onClick={onOpen}>
            Play Online
          </Button>
        </Center>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={'center'}>
            Select which piece to start with
          </ModalHeader>
          <ModalCloseButton onClick={onClose} />
          <ModalBody display={'flex'} justifyContent="space-between">
            {newGameOptions.map(({ label, value }) => (
              <Box key={value} display="flex">
                <Button
                  colorScheme={'gray'}
                  onClick={() => startOnlineGame(value)}
                >
                  {label}
                </Button>
              </Box>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
