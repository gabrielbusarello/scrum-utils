import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, Auth, User } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDOsUUP8ScYDUBdFjS0N6dLB3S9IWpaIck",
  authDomain: "scrum-dezan.firebaseapp.com",
  projectId: "scrum-dezan",
  storageBucket: "scrum-dezan.appspot.com",
  messagingSenderId: "215628725235",
  appId: "1:215628725235:web:4b5b973933a3cc83dc3086",
  measurementId: "G-2SXYJXDJTZ"
};

interface IFirebaseContext {
    app: FirebaseApp;
    auth: Auth;
    database: Firestore;
    analytics: Analytics;
    user?: User | null;
    started: boolean;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export const FirebaseContext = createContext<IFirebaseContext>({ app, auth, database, analytics, started: false });

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props: any) => {
    const [ user, setUser ] = useState<User | null>(null);
    const [ started, setStarted ] = useState<boolean>(false);

    useEffect(() => {
        onAuthStateChanged(auth, (authUser) => {
            setStarted(true);
            if (authUser) {
                setUser(authUser);
            } else {
                setUser(null);
            }
        });
    }, []);

    return (
        <FirebaseContext.Provider value={{ app, auth, database, analytics, user, started }}>
            { props.children }
        </FirebaseContext.Provider>
    )
}
