/**
 * POST /api/client/validate
 * 
 * Validates a key sent from a Roblox executor.
 * Handles HWID binding on first use.
 * 
 * Body: {
 *   key: string,    — The premium key (e.g., "OBSIDIA-A1B2-C3D4-E5F6")
 *   hwid: string    — The executor's hardware identifier
 * }
 * 
 * Response: {
 *   success: boolean,
 *   message: string,
 *   status: string   — 'valid' | 'invalid_key' | 'expired' | 'revoked' | 'hwid_mismatch'
 * }
 */
export default defineEventHandler(async (event) => {
  // Set CORS headers for executor requests
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })

  // Handle preflight
  if (getMethod(event) === 'OPTIONS') {
    return 'OK'
  }

  const body = await readBody(event)
  const { key, hwid } = body || {}

  // Validate input
  if (!key || !hwid) {
    throw createError({
      statusCode: 400,
      message: 'Both "key" and "hwid" are required',
    })
  }

  if (typeof key !== 'string' || typeof hwid !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid parameter types',
    })
  }

  const db = getDb()
  const keysCollection = db.collection('keys')

  // Find the key document
  const snapshot = await keysCollection.where('key', '==', key.trim().toUpperCase()).limit(1).get()

  if (snapshot.empty) {
    return {
      success: false,
      message: 'Invalid key. Please check your key and try again.',
      status: 'invalid_key',
    }
  }

  const doc = snapshot.docs[0]
  const data = doc.data()
  const now = new Date()

  // Check if key is revoked
  if (data.status === 'revoked') {
    return {
      success: false,
      message: 'This key has been revoked.',
      status: 'revoked',
    }
  }

  // Check if key has expired
  if (data.expiresAt && data.expiresAt.toDate() < now) {
    return {
      success: false,
      message: 'This key has expired.',
      status: 'expired',
    }
  }

  // Check HWID binding
  if (data.hwid === null || data.hwid === '') {
    // First use — bind HWID
    await doc.ref.update({
      hwid: hwid.trim(),
      status: 'used',
      usedAt: now,
    })

    return {
      success: true,
      message: 'Key activated and bound to your device.',
      status: 'valid',
    }
  }

  // Already bound — check if same HWID
  if (data.hwid === hwid.trim()) {
    return {
      success: true,
      message: 'Key validated successfully.',
      status: 'valid',
    }
  }

  // Bound to a different HWID
  return {
    success: false,
    message: 'This key is already bound to another device.',
    status: 'hwid_mismatch',
  }
})
