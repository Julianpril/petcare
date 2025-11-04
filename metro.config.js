// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ignore Python virtual environments and ML/backend folders
config.resolver.blockList = [
  // Python virtual environments
  /\.venv\/.*/,
  /venv\/.*/,
  /pawmi-ml\/.*/,
  /pawmi-backend\/.*/,
  // Python cache
  /__pycache__\/.*/,
  /\.pyc$/,
  /\.pyo$/,
  /\.pyd$/,
];

// Watch only the app directories
config.watchFolders = [__dirname];

module.exports = config;
