/**
 * This script is used to remove the pnpm-lock.yaml file from the dist folder after the build process.
 *
 * It is a temporary approach to avoid the following error, while @google-cloud/functions-framework has
 * no support for authentication events.
 *
 * @see https://github.com/firebase/firebase-tools/issues/5911
 *
 * Error: Error while updating cloudfunction configuration: Error waiting for Updating CloudFunctions Function: Error code 3, message: Build failed: This project is using pnpm but you have not included the Functions Framework in your dependencies. Please add it by running: 'pnpm add @google-cloud/functions-framework'.; Error ID: 5b6dc8b5. (+1)
 */

const fs = require('fs');
const path = 'dist/apps/people/organizations-management/functions/pnpm-lock.yaml';

// Check if the file exists and delete it if it does
fs.unlink(path, (err) => {
  console.log('Removing pnpm-lock.yaml from build output...');
  if (err && err.code !== 'ENOENT') {
    // ENOENT is the error code when the file does not exist. Ignore it.
    console.error(`Error removing file: ${err.message}`);
  } else {
    console.log('File removed successfully or does not exist.');
  }
});
