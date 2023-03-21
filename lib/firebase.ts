import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCiiUDWwIGNFFLuucR5k0w3lSLjd1zinuE',
  authDomain: 'react-chess-c938b.firebaseapp.com',
  projectId: 'react-chess-c938b',
  storageBucket: 'react-chess-c938b.appspot.com',
  messagingSenderId: '912396489024',
  appId: '1:912396489024:web:7a43b7bbc52e2a8f3e6aa5',
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();
export default firebase;
