import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyATDioI6teBX7cDAJ9-3EQ4C3sfQ3rD6WI",
  authDomain: "anonymouschat-aa785.firebaseapp.com",
  databaseURL: "https://anonymouschat-aa785-default-rtdb.firebaseio.com", // добавил это
  projectId: "anonymouschat-aa785",
  storageBucket: "anonymouschat-aa785.firebasestorage.app",
  messagingSenderId: "983349296934",
  appId: "1:983349296934:web:2507803fb8665d3e3f8be7"
};


const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);