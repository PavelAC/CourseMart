// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDm9taDbAJ1VtbV31hgSX7OzdN_2rC6zLo",
  authDomain: "coursemart-227a0.firebaseapp.com",
  projectId: "coursemart-227a0",
  storageBucket: "coursemart-227a0.appspot.com",
  messagingSenderId: "299005735117",
  appId: "1:299005735117:web:a0266ec99d2f1e506bf984",
  measurementId: "G-WRJHC6LKQ4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
