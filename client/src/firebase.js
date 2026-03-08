// firebase.js — Firebase app init + Firestore export
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyBubHaH3CYOhhz8chIk_pq1yZ4NFxYde2I",
  authDomain:        "interviewprepanalytics.firebaseapp.com",
  projectId:         "interviewprepanalytics",
  storageBucket:     "interviewprepanalytics.firebasestorage.app",
  messagingSenderId: "378286051545",
  appId:             "1:378286051545:web:f2b0d3e10eaca54b77aec8",
  measurementId:     "G-J976CPB3JV",
};

const app       = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

export { app, analytics };