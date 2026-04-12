import ffmpeg from 'fluent-ffmpeg';

/**
 * Verifies that ffmpeg is available on the system.
 * Returns true if ffmpeg is installed and accessible, false otherwise.
 */
export function verifyFfmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
