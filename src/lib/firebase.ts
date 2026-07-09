import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCiy0h3fvp4-LO4fIf_KJX1g0m0Ebq_8P0",
  authDomain: "carecredit-ce24f.firebaseapp.com",
  projectId: "carecredit-ce24f",
  storageBucket: "carecredit-ce24f.firebasestorage.app",
  messagingSenderId: "1098142522153",
  appId: "1:1098142522153:web:6cde275822d3f43ac0f538",
  measurementId: "G-LS80MPR0LS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(errorMessage);
}