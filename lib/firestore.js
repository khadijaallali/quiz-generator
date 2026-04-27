import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ----- Quizzes -----

export async function createQuiz(quiz) {
  const quizRef = doc(collection(db, "quizzes"));
  const payload = {
    ...quiz,
    id: quizRef.id,
    createdAt: serverTimestamp(),
  };
  await setDoc(quizRef, payload);
  return quizRef.id;
}

export async function getQuiz(quizId) {
  const snap = await getDoc(doc(db, "quizzes", quizId));
  if (!snap.exists()) return null;
  return normalizeDoc(snap.data());
}

export async function getUserQuizzes(uid, max = null) {
  const base = query(
    collection(db, "quizzes"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const q = max ? query(base, limit(max)) : base;
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeDoc(d.data()));
}

// ----- Scores -----

export async function createScore(score) {
  const payload = {
    ...score,
    completedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "scores"), payload);
  await setDoc(ref, { id: ref.id }, { merge: true });
  return ref.id;
}

export async function getScore(scoreId) {
  const snap = await getDoc(doc(db, "scores", scoreId));
  if (!snap.exists()) return null;
  return normalizeDoc(snap.data());
}

export async function getUserScores(uid) {
  const q = query(
    collection(db, "scores"),
    where("uid", "==", uid),
    orderBy("completedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeDoc(d.data()));
}

export async function getLastUserScore(uid) {
  const q = query(
    collection(db, "scores"),
    where("uid", "==", uid),
    orderBy("completedAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : normalizeDoc(snap.docs[0].data());
}

function normalizeDoc(data) {
  const out = { ...data };
  for (const k of Object.keys(out)) {
    if (out[k] instanceof Timestamp) {
      out[k] = out[k].toDate();
    }
  }
  return out;
}
