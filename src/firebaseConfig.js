import { initializeApp } from 'firebase/app'; 
// React Native için kalıcı hafıza ayarları
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC3R28EnbPSWAJkZ92-gG0XrriJsYEcWYo",
  authDomain: "konyavibe.firebaseapp.com",
  projectId: "konyavibe",
  storageBucket: "konyavibe.appspot.com",
  messagingSenderId: "954065874712",
  appId: "1:954065874712:web:a1f277e0ae744cf130386d",
};

const app = initializeApp(firebaseConfig);

// Auth'u kalıcı hafıza ile başlatıyoruz (Böylece giriş yapınca atmaz)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);