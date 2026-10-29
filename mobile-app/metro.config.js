const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Fix Windows drive letter duplicate resolution issue in Metro (e.g. C:\c:\Users\... or /c:/Users/...)
if (process.platform === "win32") {
  const originalResolveRequest = config.resolver?.resolveRequest;
  config.resolver = {
    ...config.resolver,
    resolveRequest: (context, moduleName, platform) => {
      let cleanModuleName = moduleName;
      if (/^[a-zA-Z]:[\\/][a-zA-Z]:[\\/]/i.test(cleanModuleName)) {
        cleanModuleName = cleanModuleName.slice(3);
      } else if (/^[\\/][a-zA-Z]:[\\/]/i.test(cleanModuleName)) {
        cleanModuleName = cleanModuleName.slice(1);
      }
      if (originalResolveRequest) {
        return originalResolveRequest(context, cleanModuleName, platform);
      }
      return context.resolveRequest(context, cleanModuleName, platform);
    },
  };
}

module.exports = withNativeWind(config, { input: "./global.css" });
