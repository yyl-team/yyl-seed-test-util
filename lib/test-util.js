const path = require('path');
const util = require('yyl-util');
const extOs = require('yyl-os');
const connect = require('connect');
const serveStatic = require('serve-static');
const serveFavicon = require('serve-favicon');
const serveIndex = require('serve-index');
const extFs = require('yyl-fs');
const fs = require('fs');
const http = require('http');

require('http-shutdown').extend();

const IS_DOC_REG = /(\/|\\)$/;

const cache = {
  server: null,
  app: null
};

const tUtil = {
  hideUrlTail(url) {
    return url
      .replace(/\?.*?$/g, '')
      .replace(/#.*?$/g, '');
  },
  async buildFiles (ctx) {
    const iType = util.type(ctx);
    let list = [];
    if ( iType === 'string') {
      list.push(ctx);
    } else if (iType === 'array') {
      list = ctx;
    } else {
      throw `expect typeof ctx == string|array but found [${iType}]`;
    }
    await util.forEach(list, async (iPath) => {
      let rPath = util.path.resolve(process.cwd(), iPath);
      let isDoc = false;

      if (iPath.match(IS_DOC_REG)) {
        isDoc = true;
      }
      let dirname;
      if (isDoc) {
        await extFs.mkdirSync(rPath);
      } else {
        dirname = path.dirname(rPath);
        await extFs.mkdirSync(dirname);
        fs.writeFileSync(rPath, '');
      }
    });
    return list;
  },
  frag: {
    path: null,
    init (iPath) {
      this.path = iPath;
      return Promise.resolve(iPath);
    },
    async build () {
      const iPath = this.path;
      if (!iPath) {
        throw 'please run tUtil.frag.init(iPath) first';
      }
      if (fs.existsSync(iPath)) {
        await extFs.removeFiles(iPath);
      } else {
        await extFs.mkdirSync(iPath);
      }
      return iPath;
    },
    async destroy () {
      const iPath = this.path;
      if (!iPath) {
        throw 'please run tUtil.frag.init(iPath) first';
      }

      await extFs.removeFiles(iPath, true);
    }
  },
  async initPlugins(plugins, iPath) {
    if (!plugins || !plugins.length) {
      return;
    }

    if (!iPath) {
      throw 'init plugins fail, iPath is not set';
    }

    if (!fs.existsSync(iPath)) {
      throw `init plugins fail, iPath is not exists: ${iPath}`;
    }
    const iPkgPath = path.join(iPath, './package.json');
    const nodeModulePath = path.join(iPath, 'node_modules');
    if (!fs.existsSync(iPkgPath)) {
      fs.writeFileSync(iPkgPath, '{}');
    }

    if (!fs.existsSync(nodeModulePath)) {
      extFs.mkdirSync(nodeModulePath);
    }

    const installLists = [];

    plugins.forEach((str) => {
      let iDir = '';
      let iVer = '';
      const pathArr = str.split(/[\\/]+/);
      let pluginPath = '';
      let pluginName = '';
      if (pathArr.length > 1) {
        pluginName = pathArr.pop();
        pluginPath = pathArr.join('/');
      } else {
        pluginName = pathArr[0];
      }

      if (~pluginName.indexOf('@')) {
        iDir = pluginName.split('@')[0];
        iVer = pluginName.split('@')[1];
      } else {
        iDir = pluginName;
      }
      let iPath = path.join(nodeModulePath, pluginPath, iDir);
      let iPkgPath = path.join(iPath, 'package.json');
      let iPkg;
      if (fs.existsSync(iPath) && fs.existsSync(iPkgPath)) {
        if (iVer) {
          iPkg = require(iPkgPath);
          if (iPkg.version != iVer) {
            installLists.push(str);
          }
        }
      } else {
        installLists.push(str);
      }
    });

    if (installLists.length) {
      const cmd = `npm install ${installLists.join(' ')} --loglevel http`;
      await extOs.runCMD(cmd, iPath);
    } else {
      return;
    }
  },
  parseConfig(configPath) {
    const config = require(configPath);
    const dirname = path.dirname(configPath);

    // alias format to absolute
    Object.keys(config.alias).forEach((key) => {
      config.alias[key] = util.path.resolve(
        dirname,
        config.alias[key]
      );
    });

    if (config.resource) {
      Object.keys(config.resource).forEach((key) => {
        const curKey = util.path.resolve(dirname, key);
        config.resource[curKey] = util.path.resolve(dirname, config.resource[key]);
        delete config.resource[key];
      });
    }

    return config;
  },
  server: {
    async start(root, port) {
      if (cache.server) {
        await tUtil.server.abort();
      }
      await util.makeAwait((next) => {
        const app = connect();
        app.use(serveStatic(root));
        app.use(serveFavicon(path.join(__dirname, '../resource/favicon.ico')));
        app.use(serveIndex(root));

        cache.server = http.createServer(app).withShutdown();
        cache.app = app;

        cache.server.listen(port, () => {
          next();
        });
      });
    },
    getAppSync() {
      return cache.app;
    },
    use(middleware) {
      if (cache.app) {
        cache.app.use(middleware);
      }
    },
    async abort () {
      if (cache.server) {
        await util.makeAwait((next) => {
          cache.server.shutdown(() => {
            cache.server = null;
            cache.app = null;
            next();
          });
        });
      }
    }
  }
};

module.exports = tUtil;
