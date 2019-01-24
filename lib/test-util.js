const path = require('path');
const util = require('yyl-util');
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

const testUtil = {
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
        throw 'please run testUtil.frag.init(iPath) first';
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
        throw 'please run testUtil.frag.init(iPath) first';
      }

      await extFs.removeFiles(iPath, true);
    }
  },
  parseConfig (configPath) {
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
        await this.server.abort();
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

module.exports = testUtil;
