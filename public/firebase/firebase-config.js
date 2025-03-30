// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2p2Fxr8uA-y7hq2R3GfKxrlLP3pOQrEA",
  authDomain: "escola-padre-natal-pigatto.firebaseapp.com",
  projectId: "escola-padre-natal-pigatto",
  storageBucket: "escola-padre-natal-pigatto.firebasestorage.app",
  messagingSenderId: "276205393116",
  appId: "1:276205393116:web:2d5903bca8971673ea5019",
  measurementId: "G-01EDSH56ZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);