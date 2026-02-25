const LISTING_IMAGE_MAX_SIZE = 800
const JPEG_QUALITY = 0.85

/**
 * Resize an image file to fit within LISTING_IMAGE_MAX_SIZE and return as JPEG data URL.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function resizeListingImage(file) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > height && width > LISTING_IMAGE_MAX_SIZE) {
        height = (height * LISTING_IMAGE_MAX_SIZE) / width
        width = LISTING_IMAGE_MAX_SIZE
      } else if (height > LISTING_IMAGE_MAX_SIZE) {
        width = (width * LISTING_IMAGE_MAX_SIZE) / height
        height = LISTING_IMAGE_MAX_SIZE
      } else {
        width = Math.min(width, LISTING_IMAGE_MAX_SIZE)
        height = Math.min(height, LISTING_IMAGE_MAX_SIZE)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image'))
    }
    img.src = url
  })
}

export const MAX_LISTING_IMAGES = 10
