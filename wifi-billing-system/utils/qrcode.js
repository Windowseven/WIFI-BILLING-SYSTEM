const QRCode = require('qrcode');

/**
 * generateQRCodeDataURL
 * @param {string} text - text to encode
 * @returns {Promise<string>} - data URL (png)
 */
async function generateQRCodeDataURL(text) {
  // Use default error correction; limit size by shortening text if needed
  try {
    const dataUrl = await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', margin: 2 });
    return dataUrl; // "data:image/png;base64,...."
  } catch (err) {
    throw new Error('QR generation failed');
  }
}

module.exports = { generateQRCodeDataURL };
