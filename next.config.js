const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  crossOrigin: 'anonymous',
  output: 'standalone',
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Only run on the client side
    if (!isServer) {
      // Optimize chunk loading
      config.output.chunkLoadingGlobal = 'webpackChunkLoad';
      
      // Disable chunking in production
      if (!dev) {
        // Set optimization to minimize file chunks
        config.optimization = {
          ...config.optimization,
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
              // Bundle all CSS together
              styles: {
                name: 'styles',
                test: /\.css$/,
                chunks: 'all',
                enforce: true,
              },
              // Bundle all JavaScript together
              commons: {
                name: 'commons',
                chunks: 'all',
                minChunks: 2,
                priority: 10,
              },
            },
          },
        };
      }
      
      // Em produção, use o MiniCssExtractPlugin
      if (!dev) {
        // Add the plugin to the webpack configuration
        config.plugins.push(
          new MiniCssExtractPlugin({
            filename: 'static/css/[name].css',
            chunkFilename: 'static/css/[name].css',
          })
        );
      }

      // Update the CSS rule to use the appropriate loader
      const cssRule = config.module.rules.find(
        (rule) => rule.test && rule.test.toString().includes('.css')
      );
      
      if (cssRule) {
        // Em desenvolvimento, use style-loader
        if (dev) {
          cssRule.use = [
            'style-loader',
            'css-loader',
            'postcss-loader',
          ];
        } else {
          // Em produção, use MiniCssExtractPlugin.loader
          cssRule.use = [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
          ];
        }
      } else {
        // If no CSS rule found, add a new one
        config.module.rules.push({
          test: /\.css$/,
          use: [
            dev ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
          ],
        });
      }
    }
    
    return config;
  },
};

// Try to import user config if it exists
let userConfig = {};
try {
  userConfig = require('./v0-user-next.config');
} catch (e) {
  // ignore error
}

// Merge the configs
function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return nextConfig;
  }

  const result = { ...nextConfig };

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      result[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      result[key] = userConfig[key];
    }
  }

  return result;
}

module.exports = mergeConfig(nextConfig, userConfig); 