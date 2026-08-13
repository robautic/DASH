import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { env } from '../config/env.js'

function initFirebaseAdmin(): App {
  if (getApps().length) return getApps()[0]!
  return initializeApp({
    credential: cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
  })
}

export const firebaseAdminApp = initFirebaseAdmin()
export const db = getFirestore(firebaseAdminApp)
export const adminAuth = getAuth(firebaseAdminApp)
