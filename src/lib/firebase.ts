import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAMu5TCDyF7wrSWTaYgUHq7fXj3Zs4zdw4",
  authDomain: "automateddatacleaningpipeline.firebaseapp.com",
  projectId: "automateddatacleaningpipeline",
  storageBucket: "automateddatacleaningpipeline.firebasestorage.app",
  messagingSenderId: "715731074474",
  appId: "1:715731074474:web:8bb8f33829c211c4697fd3",
  measurementId: "G-YT4MDPWTL8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
