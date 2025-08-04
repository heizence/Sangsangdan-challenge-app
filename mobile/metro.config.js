// mobile/metro.config.js

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Expo 49+ / tRPC v10+ 호환성을 위한 설정
// .mjs 와 .cjs 확장자를 Metro가 인식할 수 있도록 추가합니다.
config.resolver.sourceExts.push("mjs", "cjs");

module.exports = config;
