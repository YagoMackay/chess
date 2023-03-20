import Game from '@/components/Game';
import { useRouter } from 'next/router';

export default function GamePage() {
  const router = useRouter();
  const { id: gameId } = router.query;

  if (!gameId) {
    return <div>Loading...</div>;
  }

  return <Game />;
}
