import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, setDoc, onSnapshot, collection, query 
} from 'firebase/firestore'; 
import { auth, db } from './firebaseConfig'; 

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [myTickets, setMyTickets] = useState([]); 
  const [initializing, setInitializing] = useState(true);

  const MASTER_ADMIN_EMAIL = "admin@konyavibe.com";

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        
        // getDoc yerine onSnapshot (Canlı Takip)
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                
                const isMaster = firebaseUser.email === MASTER_ADMIN_EMAIL;
                
                // 🔥 Hem Admin'i hem Personeli anlık tanıyan yapı:
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    ...userData, 
                    isAdmin: isMaster || userData.isAdmin === true,
                    isStaff: userData.role === 'staff' // Personel kontrolü
                });

                // Eğer personel değilse biletlerini de dinle
                if (userData.role !== 'staff') {
                   const ticketsRef = collection(db, 'users', firebaseUser.uid, 'tickets');
                   const q = query(ticketsRef);
                   onSnapshot(q, (tSnap) => {
                       const loadedTickets = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                       setMyTickets(loadedTickets);
                   });
                }
            } else {
                // Veri daha yazılmadıysa (Kayıt anı), Auth bilgisini göster
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    isAdmin: false,
                    isStaff: false
                });
            }
        });

      } else {
        setUser(null);
        setMyTickets([]); 
      }
      setInitializing(false);
    });

    return unsubscribeAuth;
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.code || error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const isMasterAdmin = email === MASTER_ADMIN_EMAIL;

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name,
        email: email,
        role: isMasterAdmin ? 'admin' : 'user', 
        createdAt: new Date(),
        isAdmin: isMasterAdmin
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.code || error.message };
    }
  };

  const logout = async () => {
    try { await signOut(auth); } catch (e) { console.log(e); }
  };

  const addTicket = async (ticket) => {
    if (!user) { setMyTickets(prev => [...prev, ticket]); return; }
    try {
        const ticketRef = doc(db, 'users', user.uid, 'tickets', ticket.id.toString());
        await setDoc(ticketRef, ticket);
    } catch (e) { console.log(e); }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isGuest: !user,
        isAdmin: user?.isAdmin || false,
        isStaff: user?.isStaff || false, 
        myTickets,
        addTicket,
        login,
        register,
        logout,
        initializing,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);