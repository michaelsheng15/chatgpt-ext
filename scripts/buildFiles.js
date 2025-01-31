const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');
const srcFiles = ['content.js', 'api.js']; // Files to copy
const srcDir = path.resolve(__dirname, '../src');

// Ensure the destination directory (root of the build) exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy each specified file from src to build
srcFiles.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(buildDir, file);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`${file} has been copied to the build directory.`);
  } else {
    console.warn(`Warning: ${file} not found in src directory.`);
  }
});
