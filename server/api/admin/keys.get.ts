/**
 * GET /api/admin/keys
 * 
 * Fetches all keys from Firestore, ordered by creation date (newest first).
 * Dynamically computes whether keys have expired.
 */
export default defineEventHandler(async (event) => {
  const db = getDb()
  const keysCollection = db.collection('keys')
  const snapshot = await keysCollection.orderBy('createdAt', 'desc').get()

  const now = new Date()

  const keys = snapshot.docs.map((doc) => {
    const data = doc.data()

    // Compute effective status (check if expired)
    let effectiveStatus = data.status
    if (
      data.status === 'active' &&
      data.expiresAt &&
      data.expiresAt.toDate() < now
    ) {
      effectiveStatus = 'expired'
    }
    if (
      data.status === 'used' &&
      data.expiresAt &&
      data.expiresAt.toDate() < now
    ) {
      effectiveStatus = 'expired'
    }

    return {
      id: doc.id,
      key: data.key,
      status: effectiveStatus,
      hwid: data.hwid || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      expiresAt: data.expiresAt?.toDate?.()?.toISOString() || null,
      usedAt: data.usedAt?.toDate?.()?.toISOString() || null,
      note: data.note || '',
      expirationType: data.expirationType || 'permanent',
    }
  })

  return {
    success: true,
    keys,
    total: keys.length,
  }
})
