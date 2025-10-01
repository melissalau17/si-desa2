
/**
 * Normalize photo URL to be publicly accessible.
 * @param {string} photoUrl - The stored file path, e.g., "uploads/filename.jpg"
 * @returns {string|null} Fully qualified public URL or null if no photo
 */
function normalizePhotoUrl(photoUrl) {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("http")) return photoUrl;

  return `${process.env.R2_PUBLIC_URL}/${photoUrl}`;
}

module.exports = normalizePhotoUrl;
