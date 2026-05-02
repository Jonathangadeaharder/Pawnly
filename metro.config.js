/**
 * Metro Configuration for Optimization
 *
 * Optimizations:
 * - Tree shaking to remove unused code
 * - Minification for production builds
 * - Source map configuration
 * - Asset optimization
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking and minification
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    // Terser options for better minification
    compress: {
      // Remove console.log in production
      drop_console: process.env.NODE_ENV === 'production',
      // Remove debugger statements
      drop_debugger: true,
      // Remove unused code
      unused: true,
      // Optimize comparisons
      comparisons: true,
      // Inline functions where possible
      inline: 2,
      // Reduce variable names
      reduce_vars: true,
      // Collapse single-use vars
      collapse_vars: true,
      // Evaluate constant expressions
      evaluate: true,
      // Optimize if-return and if-continue
      if_return: true,
      // Join consecutive var statements
      join_vars: true,
      // Optimize loops
      loops: true,
      // Remove unreachable code
      dead_code: true,
    },
    mangle: {
      // Mangle variable names for smaller size
      toplevel: true,
    },
    output: {
      // Beautify output for debugging (disable in production)
      beautify: false,
      // Remove comments
      comments: false,
    },
  },
};

// Configure source maps
config.serializer = {
  ...config.serializer,
  // Generate source maps for production debugging
  createModuleIdFactory: () => {
    const projectRootPath = __dirname;
    return (path) => {
      // Use shorter, more predictable module IDs
      const relativePath = path
        .replace(projectRootPath, '')
        .replace(/\\/g, '/')
        .replace(/^\//, '');
      return relativePath;
    };
  },
};

// Asset optimization
config.resolver = {
  ...config.resolver,
  // Support for WebP images
  assetExts: [
    ...config.resolver.assetExts,
    'webp',
  ],
  // Source extensions
  sourceExts: [
    ...config.resolver.sourceExts,
    'ts',
    'tsx',
  ],
};

// Cache configuration for faster builds
config.cacheStores = [
  {
    // Use filesystem cache
    name: 'filesystem',
    rootPath: require('path').join(__dirname, '.metro-cache'),
  },
];

module.exports = config;
