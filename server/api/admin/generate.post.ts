/**
 * POST /api/admin/generate
 * 
 * Generates one or more premium keys and stores them in Firestore.
 * 
 * Body: {
 *   expiration: '24h' | '7d' | '30d' | 'permanent',
 *   count: number (1-50),
 *   note?: string
 * }
 */
import { nanoid } from 'nanoid'

// Generate a key in format: OBSIDIA-XXXX-XXXX-XXXX
function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segment = () => {
    let result = ''
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  return `OBSIDIA-${segment()}-${segment()}-${segment()}`
}

// Calculate expiration date from duration string
function getExpirationDate(expiration: string): Date | null {
  const now = new Date()
  switch (expiration) {
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    case 'permanent':
      return null
    default:
      return null
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { expiration = 'permanent', count = 1, note = '' } = body || {}

  // Validate count
  const keyCount = Math.min(Math.max(parseInt(count) || 1, 1), 50)

  // Validate expiration
  const validExpirations = ['24h', '7d', '30d', 'permanent']
  if (!validExpirations.includes(expiration)) {
    throw createError({
      statusCode: 400,
      message: `Invalid expiration. Must be one of: ${validExpirations.join(', ')}`,
    })
  }

  const db = getDb()
  const keysCollection = db.collection('keys')
  const generatedKeys: string[] = []
  const now = new Date()
  const expiresAt = getExpirationDate(expiration)

  // Generate keys in batch
  const batch = db.batch()

  for (let i = 0; i < keyCount; i++) {
    const key = generateKey()
    const docRef = keysCollection.doc() // Auto-generated ID

    batch.set(docRef, {
      key,
      status: 'active',
      hwid: null,
      createdAt: now,
      expiresAt,
      usedAt: null,
      note: note || '',
      expirationType: expiration,
    })

    generatedKeys.push(key)
  }

  await batch.commit()

  return {
    success: true,
    message: `Generated ${keyCount} key(s)`,
    keys: generatedKeys,
  }
})
