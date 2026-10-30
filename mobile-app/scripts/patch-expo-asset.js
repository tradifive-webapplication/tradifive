const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'expo-asset', 'build', 'ExpoAsset.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes("requireNativeModule('ExpoAsset')") || content.includes('requireNativeModule("ExpoAsset")')) {
    content = content.replace(
      /import\s*\{\s*requireNativeModule\s*\}\s*from\s*['"]expo-modules-core['"];?\s*(?:const|let|var)\s+AssetModule\s*=\s*requireNativeModule\(['"]ExpoAsset['"]\);?/,
      `import { requireOptionalNativeModule } from 'expo-modules-core';
let AssetModule = null;
try {
  AssetModule = requireOptionalNativeModule('ExpoAsset');
} catch (e) {
  AssetModule = null;
}`
    );
    // Also protect downloadAsync
    if (!content.includes('if (AssetModule && AssetModule.downloadAsync)')) {
      content = content.replace(
        /return AssetModule\.downloadAsync\(url,\s*md5Hash,\s*type\);/,
        `if (AssetModule && AssetModule.downloadAsync) {
        return AssetModule.downloadAsync(url, md5Hash, type);
    }
    return { localUri: url };`
      );
    }
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched ExpoAsset.js for graceful native module fallback.');
  } else {
    console.log('ExpoAsset.js already patched or safe.');
  }
} else {
  console.log('ExpoAsset.js not found, skipping patch.');
}
