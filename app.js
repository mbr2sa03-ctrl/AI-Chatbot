// Firebase Web SDK setup
// Replace the firebaseConfig values with your Firebase web app configuration.
// For production, keep Gemini/Google OAuth secrets in Cloud Functions, never here.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-functions.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const provider = new GoogleAuthProvider();

const $ = id => document.getElementById(id);
const messages = $("messages"), question = $("question"), loading = $("loading");

function addMessage(role, text) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble); messages.appendChild(row);
  $("welcome").classList.add("hidden");
  messages.scrollTop = messages.scrollHeight;
}

async function send() {
  const q = question.value.trim();
  if (!q || loading.dataset.busy === "1") return;
  if (!auth.currentUser) {
    addMessage("assistant", "Please sign in with Google before asking questions.");
    return;
  }
  addMessage("user", q); question.value = ""; loading.dataset.busy = "1"; loading.classList.remove("hidden");
  try {
    const chat = httpsCallable(functions, "chat");
    const result = await chat({question: q, fileSearchStoreNames: []});
    addMessage("assistant", result.data?.answer || "No answer was returned.");
  } catch (err) {
    console.error(err);
    addMessage("assistant", "Sorry, I could not complete that request. Please check your Firebase/Cloud Functions configuration.");
  } finally {
    loading.dataset.busy = "0"; loading.classList.add("hidden");
  }
}

$("chatForm").addEventListener("submit", e => { e.preventDefault(); send(); });
question.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }});
document.querySelectorAll(".suggestions button").forEach(b => b.onclick = () => { question.value = b.textContent; question.focus(); });
$("newChat").onclick = () => { messages.innerHTML = ""; $("welcome").classList.remove("hidden"); };
$("signIn").onclick = async () => { try { await signInWithPopup(auth, provider); } catch(e) { console.error(e); } };
$("signOut").onclick = () => signOut(auth);

document.querySelectorAll(".nav-item").forEach(btn => btn.onclick = () => {
  document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active")); btn.classList.add("active");
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  const view = btn.dataset.view;
  $(`${view}View`).classList.remove("hidden");
  $("pageTitle").textContent = view === "chat" ? "Ask My Documents" : view === "drive" ? "Google Drive" : "Knowledge Base";
});

onAuthStateChanged(auth, user => {
  $("authStatus").textContent = user ? `Signed in as ${user.email || "Google user"}` : "Not signed in";
  $("signIn").classList.toggle("hidden", !!user);
  $("signOut").classList.toggle("hidden", !user);
  $("userBadge").classList.toggle("hidden", !user);
  $("userBadge").textContent = user ? (user.displayName || user.email || "Signed in") : "";
});
