// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE,
  authDomain: "blog-4a03c.firebaseapp.com",
  projectId: "blog-4a03c",
  storageBucket: "blog-4a03c.firebasestorage.app",
  messagingSenderId: "819595885607",
  appId: "1:819595885607:web:ceb346c9e38425b460a202",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
