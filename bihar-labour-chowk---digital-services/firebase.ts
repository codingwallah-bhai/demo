
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBeqaDJLifgdpBQPRL0OLtkovB-m4OM7kw",
  authDomain: "cricker2.firebaseapp.com",
  databaseURL: "https://cricker2-default-rtdb.firebaseio.com",
  projectId: "cricker2",
  storageBucket: "cricker2.appspot.com",
  messagingSenderId: "757574903179",
  appId: "1:757574903179:web:8cfa2a2e3ac157029f7b8e",
  measurementId: "G-DZNF4BTH35"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
