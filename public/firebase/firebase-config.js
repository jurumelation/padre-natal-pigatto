// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAovVxCbxJHHpDz1vdKZewdbwClKuQNQy0",
  authDomain: "padre-natal-pigatto.firebaseapp.com",
  projectId: "padre-natal-pigatto",
  storageBucket: "padre-natal-pigatto.firebasestorage.app",
  messagingSenderId: "209413702443",
  appId: "1:209413702443:web:4d4189730cfd6344733b6e",
  measurementId: "G-B6F9JH42HE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);