const glob    = require("glob");
const path    = require('path');
const colors  = require('colors');
const fg      = require('fast-glob');
const {handleProcessSuccess, handleMessageSuccess, handleThrowMessageError} = require('../utils/handleMessaging');

async function handleEsBuildFile(file, plugins, config) {
  const esBuild = config?.overrideEsBuild ? config.overrideEsBuild : require('esbuild');
  const fileName = path.basename(file);
  const start    = Date.now();

  esBuild
    .build({
      entryPoints: [file],
      bundle: true,
      outfile: path.join(config.to, fileName),
      sourcemap: true,
      plugins: plugins,
    })

  const stop = Date.now();
  handleMessageSuccess('esBuild', `${fileName} processed`, ((stop - start)/1000));
  // console.log(`${colors.white('[')}${colors.blue('esBuild')}${colors.white(']')} ${colors.cyan(`${fileName} processed`)} ${colors.gray(`${(stop - start)/1000}s`)}`);
}

async function handleRun(config) {

  const defaultPlugins = [];

  const plugins = config?.overridePlugins && config?.plugins
        ? [...config.plugins]
        : config?.plugins
          ? [...defaultPlugins, ...config.plugins]
          : defaultPlugins;

  const entries = fg.sync([config.from], { dot: true });

  const promises = entries.map(file => handleEsBuildFile(file, plugins, config));
  await Promise.all(promises);
  handleProcessSuccess(`esBuild complete`);
}

/**
 * config = {
 *   plugins        : pluginData,
 *   overridePlugins: configOverridePlugins,
 *   root           : process.cwd(),
 *   minify         : false,
 *   usemaps        : true,
 *   from:          : 'some/path/glob/*.js'
 *   to:            : 'some/path'
 * }
 */
function runEsBuild(config) {

  return new Promise((resolve, reject) => {
    handleRun(config);
    resolve();
  });
}

module.exports = runEsBuild;