/**
 * POST /api/admin/revoke
 * 
 * Revokes a key by setting its status to 'revoked' and clearing the HWID binding.
 * 
 * Body: { keyId: string }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { keyId } = body || {}

  if (!keyId) {
    throw createError({
      statusCode: 400,
      message: 'keyId is required',
    })
  }

  const db = getDb()
  const docRef = db.collection('keys').doc(keyId)
  const doc = await docRef.get()

  if (!doc.exists) {
    throw createError({
      statusCode: 404,
      message: 'Key not found',
    })
  }

  await docRef.update({
    status: 'revoked',
    hwid: null,
  })

  return {
    success: true,
    message: 'Key revoked successfully',
  }
})
