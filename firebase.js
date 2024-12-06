import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD84FaL74s6b0sZkXIeM_rwGPUv6apFjZw",
    authDomain: "workhourlogger-7432b.firebaseapp.com",
    projectId: "workhourlogger-7432b",
    storageBucket: "workhourlogger-7432b.firebasestorage.app",
    messagingSenderId: "331924166077",
    appId: "1:331924166077:web:15f21df481d57443fc2ed4",
    measurementId: "G-LGXXT2V76E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

// Google Sign-In
export async function googleSignIn() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Google Sign-In error:", error.message);
        throw error;
    }
}

// Email/Password Sign-Up
export async function signUp(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

// Email/Password Sign-In
export async function signIn(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

// Sign Out
export async function userSignOut() {
    await signOut(auth);
}

// Save Work Hours to Firestore
export async function saveWorkHours(date, hours) {
    if (!auth.currentUser) throw new Error("User not authenticated!");
    const userId = auth.currentUser.uid;
    const docRef = doc(db, `workLogs/${userId}_${date}`);
    await setDoc(docRef, { date, hours, userId });
}

// Get Work Hours from Firestore
export async function getWorkHours() {
    if (!auth.currentUser) throw new Error("User not authenticated!");
    const userId = auth.currentUser.uid;
    const workLogsRef = collection(db, "workLogs");
    const q = query(workLogsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data());
}

// Get Biweekly Work Hours
export async function getBiweeklyWorkHours() {
    if (!auth.currentUser) throw new Error("User not authenticated!");
    const userId = auth.currentUser.uid;
    const now = new Date();
    const dayOfMonth = now.getDate();
    const biweeklyStartDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth - (dayOfMonth % 14));
    const startTimestamp = Timestamp.fromDate(biweeklyStartDate);

    const workLogsRef = collection(db, "workLogs");
    const q = query(workLogsRef, where("userId", "==", userId), where("date", ">=", startTimestamp));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data());
}
