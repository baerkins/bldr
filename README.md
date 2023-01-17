<center>
<h1>🚨 🚨 🚨 <br>This jawn is in active development.<br>🚨 🚨 🚨</h1>
<p>Use at your own risk.</p>
</center>



<center>
<h1>Bldr</h1>
</center>

## Installation

`npm i -g @bluecadet/bldr`

## Documentation

- [Config documentation](#config)
  - [Config Setup](#config-setup)
  - [Environment Config](#environment-config)
  - [PostCSS config](#postcss-config)
  - [Esbuild and Rollup Config](#esbuildrollup-override-config)
    - [Recommended Babel Config](#recommended-babel-config)
  - [Browsersync Config](#browsersync-config)
- [Command documentation](#commands)
- [Processing documentation](#processing)

## Config

Bldr relies on a `bldrConfig.js` file to point to where files should be sourced, distributed to, and watched.

Bldr supports 2 main processes: `dev` and `build`, where `dev` is meant to run locally, and `build` is meant for production. The main difference: JS files in `dev` are processed with [esBuild](https://esbuild.github.io/), while JS files in `build` are processed with [Rollup](https://rollupjs.org). CSS is always processed by [PostCss](https://postcss.org/). This keeps development builds fast, and production builds more thorough.

### Config Setup

#### Base config

Config can be setup to either export a single object, or an object with `dev` and `build` objects.

If path values for the `dev` and `build` processes are identical, you can use export a single object:

```js
module.exports = {
  // file configuration
}
```

If you need to support different path structures for `dev` and `build` commands, use the following configuration:

```js
module.exports = {
  dev: {
    // file configuration
  },
  build: {
    // file configuration
  }
}
```

Both the single config object and the `dev` and `build` keyed object support the following file configuration objects (described below):

```js
{
  css: {
    // src/dest/watch config for processing files with postcss
  },
  js: {
    // src/dest/watch config for processing files with esbuild (dev) or rollup (build)
  },
  images: {
    // src/dest/watch config for processing files with postcss
  }
}
```

Each of these keys can support a single object (`css: {}`) OR and array of objects:

```js
{
  css: [
    {
      // src/dest/watch config
    },
    {
      // src/dest/watch config
    },
  ],
  js: {
    // src/dest/watch config
  },
  images: {
    // src/dest/watch config
  }
}
```

This is useful if there are multiple directories in one project to run processes on.


#### `src`, `dest`, `watch` config

`src` config expects a path (string). This path is the 'incoming' path for processing. Glob patterns can be used.

Example:

```js
css: {
  src: './path/to/src/css/**/*.css'
}
```

`dest` config expects a path (string). This path is the 'destination' for processing. This is the directory where builds will be created.

Example:

```js
css: {
  dest: './path/to/public/css/'
}
```

`watch` config is only used in the `dev` process, and expects an array of paths (array of strings). These paths will be 'watched' by chokidar.

Example:

```js
css: {
  watch: [
    './path/to/src/css/**/*.css',
    './path/to/other/css/**/*.css'
  ]
}
```

##### Example basic config:
```js
module.exports = {
  css: {
    src: './path/to/src/css/**/*.css',
    dest: './path/to/public/css/',
    watch: [
      './path/to/src/css/**/*.css',
      './path/to/other/css/**/*.css'
    ]
  }
}
```

##### Example dev/build config:

```js
module.exports = {
  dev: {
    css: {
      src: './path/to/src/css/**/*.css',
      dest: './path/to/public/css/',
      watch: [
        './path/to/src/css/**/*.css',
        './path/to/other/css/**/*.css'
      ]
    }
  },
  build: {
    css: {
      src: './path/to/src/css/**/*.css',
      dest: './path/to/public/css/',
      watch: [
        './path/to/src/css/**/*.css',
        './path/to/other/css/**/*.css'
      ]
    }
  }
}
```

#### `watchReload` config

When running `bldr watch` you may need other files to trigger an automatic reload. To do this, add a `watchReload` key with a value of an array to config:

##### Example basic config:
```js
module.exports = {
  css: {
    ...
  },
  js: {
    ...
  },
  watchReload: [
    './**/*.twig',
    './**/*.html',
    './**/*.php'
  ]
}
```

##### Example dev/build config:
In practice, the `watchReload` key only applies to the `watch` process, which will only ever honor basic and `dev` config, so its not needed in `build`.

```js
module.exports = {
  dev: {
    css: {...},
    js: {...},
    watchReload: [
      './**/*.twig',
      './**/*.html',
      './**/*.php'
    ]
  },
  build: {
    css: {...}
  }
}
```


#### Environment config

Within the basic config object or the `dev` key, an `env` object can be added to define seperate build environments. This allows you to create specific config for a specific set of files (such as 'cms' or 'theme'). Consider it to be multiple `dev` configurations.

Once an env config object is created, they can be ran using the flag `env=ENV_KEY_NAME`.

Example basic config:

```js
module.exports = {
  css: [
    {
      src: './theme/src/css/**/*.css',
      dest: './theme/public/css/',
      watch: ['./theme/src/css/**/*.css',]
    },
    {
      src: './cms/src/css/**/*.css',
      dest: './cms/public/css/',
      watch: ['./cms/src/css/**/*.css',]
    },
  ],
  env: {
    themeOnly: {
      css: {
        src: './theme/src/css/**/*.css',
        dest: './theme/public/css/',
        watch: ['./theme/src/css/**/*.css',]
      },
    }
  }
}
```

Example dev/build config:

```js
module.exports = {
  dev: {
    css: [
      {
        src: './theme/src/css/**/*.css',
        dest: './theme/public/css/',
        watch: ['./theme/src/css/**/*.css',]
      },
      {
        src: './cms/src/css/**/*.css',
        dest: './cms/public/css/',
        watch: ['./cms/src/css/**/*.css',]
      },
    ],
    env: {
      themeOnly: {
        css: {
          src: './theme/src/css/**/*.css',
          dest: './theme/public/css/',
          watch: ['./theme/src/css/**/*.css',]
        },
      }
    }
  }
}
```

In this example, `bldr dev` will watch and process css in both the `theme` and `cms` directories, but running

```bash
$ bldr dev env=themeOnly
```

will only watch the `theme` directory. Multiple `env` objects can be configured.

Each object in the `env` config has the same options as the `dev` and `build` config.


### PostCSS config

Configure postcss by adding a `postcss.config.js` file to the root of your project. bldr uses [postcss-load-config](https://github.com/postcss/postcss-load-config) under the hood. As such, make sure to add plugins using the object syntax in the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples).

In addition to the default context variables of (`ctx.env` (`process.env.NODE_ENV`) and `ctx.cwd` (`process.cwd()`)), there is an additional `bldrEnv`, which will have the value of the current build command (`dev`, `build`, or `watch`). Again, refer to the `postcss-load-config` documentation [here](https://github.com/postcss/postcss-load-config#examples).

### EsBuild/Rollup override config

Both esBuild and rollup options can be changed/overwritten in the config. The following config is available:

```js
const buildStatistics = require('rollup-plugin-build-statistics');

module.exports = {
  dev: ...,
  build: ...,
  esBuild: {
    plugins: [
      // Array of esbuild plugins
      require("essass"),
    ],
    overridePlugins: false,
    esBuild: require('esbuild'), // overrides bldr version of esbuild
  },
  rollup: {
    inputOptions: {
      plugins: [
        // Array of rollup input plugins
        buildStatistics({
          projectName: 'awesome-project',
        }),
      ]
    },
    outputOptions: {
      plugins: [
        // Array of rollup output plugins
      ]
    },
    overridePlugins: false,
    rollup: require('rollup'), // overrides bldr version of rollup
  }
}
```

If `overridePlugins` is set to false (default value), items in the `plugins` arrays will be added to the existing bldr plugins. If `overridePlugins` is set to true, then default bldr plugins will not be used, and only those provided in the `plugins` array will be added.

If you need a specific version of esbuild or rollup, add the require statement as shown above.

#### Recommended Babel Config

By default, if a babel config file exists, bldr will use the `@rollup/plugin-babel` with the options of `{babelHelpers: 'bundled'}`. You can override this config by setting an object in the rollup section of `bldrConfig.js`:

```
{
  ...,
  rollup: {
    babelPluginOptions: {
      babelHelpers: 'bundled',
    }
  }
```

More options [here](https://github.com/rollup/plugins/tree/master/packages/babel#options).

##### Babel Config

While you can setup babel as you like, the following is recommended (particularly with the default setting `babelHelpers` to runtime):

Install the following packages to your projects package.json:
```
npm i --save-dev @babel/preset-env core-js
```

then create a `babel.config.json` file containing:

```
{
  "compact" : false,
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ]
}
```


#### Browsersync Config

If you would like to run watch mode without browsersync, you can disable broswersync by adding `disableBrowsersync: true` to your bldrConfig.js file.

### Local Config

Create a local config file by running `bldr init` or creating a file in root named `bldrConfigLocal.js`.

Local config is primarily used to store browsersync settings. As such, it is not a file that needs to be tracked.

Example dev/build config:

```js
module.exports = {
  browserSync: {
    proxy: 'http://site.local'
    // other browsersync options as per https://browsersync.io/docs/options
  }
}
```

## Commands

### `init`

```bash
$ bldr init
```

Running `init` will attempt to create boilerplate config files in the project root.


### `dev`

```bash
$ bldr dev
```

Running `dev` will run postcss and esbuild without minification.

### `watch`

```bash
$ bldr watch
```

Running `watch` will run postcss and esbuild without minification (same as `dev`). Additionally:
- a chokidar instance will initialize to watch files and run appropriate processes when files are added/removed/updated based on file type
- a browsersync instance will be created if it does not exist. Edit `bldrConfigLocal.js` to add [browsersync options](https://browsersync.io/docs/options) as needed.


### `build`

```bash
$ bldr build
```

Running `build` will run postcss and rollup with minification. Rollup will also run babel.


## Processing

Default Rollup plugins:
- @rollup/plugin-babel
- @rollup/plugin-commonjs
- rollup-plugin-terser
- @rollup/plugin-node-resolve
- @rollup/plugin-eslint