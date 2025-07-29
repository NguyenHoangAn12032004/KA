const { override } = require('customize-cra');

module.exports = override(
  (config) => {
    if (config.plugins) {
      config.plugins.forEach((plugin) => {
        if (plugin.constructor.name === 'ForkTsCheckerWebpackPlugin') {
          plugin.options.memoryLimit = 4096;
        }
      });
    }
    return config;
  }
); 