/**
 * Firebase Admin SDK — Singleton initialization
 * 
 * Uses the FIREBASE_SERVICE_ACCOUNT environment variable (stringified JSON)
 * to initialize the Admin SDK. Handles cold-start reuse in serverless environments.
 */
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let _db: Firestore | null = null

/**
 * Returns a Firestore instance, initializing the Firebase Admin app if needed.
 */
export function getDb(): Firestore {
  if (_db) return _db

  const apps = getApps()

  if (apps.length > 0) {
    _db = getFirestore(apps[0])
    return _db
  }

  // Read service account from runtime config
  const config = useRuntimeConfig()
  const serviceAccountJson = config.firebaseServiceAccount

  if (!serviceAccountJson) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set. ' +
      'Please set it with your Firebase service account JSON.'
    )
  }

  let serviceAccount: any
  try {
    serviceAccount = JSON.parse(serviceAccountJson)
  } catch {
    throw new Error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT. ' +
      'Make sure it is valid JSON.'
    )
  }

  const app: App = initializeApp({
    credential: cert(serviceAccount),
  })

  _db = getFirestore(app)
  return _db
}
