import { auth } from '@/lib/firebase';
import { Skeleton } from '@chakra-ui/react';
import { Inter } from 'next/font/google';
import { useAuthState } from 'react-firebase-hooks/auth';
import Dashboard from './dashboard';

import UserForm from './userForm';
const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  if (loading) {
    return <Skeleton />;
  }
  if (error) {
    return 'There was an error';
  }
  if (!user) {
    return <UserForm />;
  }

  return <Dashboard />;
}
