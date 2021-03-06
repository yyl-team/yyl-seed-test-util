const tUtil = require('../lib/test-util.js');
const path = require('path');
const fs = require('fs');
const util = require('yyl-util');
const request = require('yyl-request');
const extOs = require('yyl-os');

const TEST_CTRL = {
  FRAG: true,
  INIT_PLUGINS: true,
  PARSE_CONFIG: true,
  BUILD_FILES: true,
  SERVER: true,
  HIDE_URL_TAIL: true
};


const FRAG_PATH = path.join(__dirname, './__frag');

if (TEST_CTRL.FRAG) {
  test('tUtil.frag.init(iPath)', async () => {
    const r = await tUtil.frag.init(FRAG_PATH);
    expect(r).toEqual(FRAG_PATH);
  });

  test('tUtil.frag.build()', async () => {
    await tUtil.frag.build();
    expect(fs.existsSync(FRAG_PATH)).toEqual(true);
    expect(fs.readdirSync(FRAG_PATH).length).toEqual(0);
  });

  test('tUtil.frag.destroy()', async () => {
    await tUtil.frag.destroy();
    expect(fs.existsSync(FRAG_PATH)).toEqual(false);
  });
}

if (TEST_CTRL.BUILD_FILES) {
  test('tUtil.buildFiles(filePath)', async () => {
    await tUtil.frag.build();

    const iPath = path.join(FRAG_PATH, 'path/to/1.txt');
    const r = await tUtil.buildFiles(iPath);
    expect(r.join('')).toEqual(iPath);
    expect(fs.existsSync(iPath)).toEqual(true);
    expect(fs.statSync(iPath).isDirectory()).toEqual(false);

    await tUtil.frag.destroy();
  });

  test('tUtil.buildFiles(dirPath)', async () => {
    await tUtil.frag.build();

    const iPath = path.join(FRAG_PATH, 'path/toa/');
    const r = await tUtil.buildFiles(iPath);
    expect(r.join('')).toEqual(iPath);
    console.log(iPath);
    expect(fs.existsSync(iPath)).toEqual(true);
    expect(fs.statSync(iPath).isDirectory()).toEqual(true);

    await tUtil.frag.destroy();
  });

  test('tUtil.buildFiles(arr)', async () => {
    await tUtil.frag.build();

    const arr = [
      path.join(FRAG_PATH, 'path/to/a/1.txt'),
      path.join(FRAG_PATH, 'path/to/b/'),
      path.join(FRAG_PATH, 'path/to/c/2.txt')
    ];

    const r = await tUtil.buildFiles(arr);

    arr.forEach((iPath) => {
      expect(fs.existsSync(iPath)).toEqual(true);
    });

    expect(r.length).toEqual(arr.length);
    await tUtil.frag.destroy();
  });
}

if (TEST_CTRL.INIT_PLUGINS) {
  test('tUtil.initPlugins(plugins, iPath)', async() => {
    await tUtil.frag.init(FRAG_PATH);
    await tUtil.frag.build();

    // run
    const testPlugins = ['yyl-flexlayout', 'yyl-os@0.4.0'];
    await tUtil.initPlugins(testPlugins, FRAG_PATH);

    // check
    const pkgPath = path.join(FRAG_PATH, 'package.json');
    const p1Path = path.join(FRAG_PATH, 'node_modules/yyl-flexlayout');
    const p2Path = path.join(FRAG_PATH, 'node_modules/yyl-os');
    [pkgPath, p1Path, p2Path].forEach((iPath) => {
      expect(fs.existsSync(iPath)).toEqual(true);
    });
    const p2PkgPath = path.join(p2Path, 'package.json');
    const ver = require(p2PkgPath).version;

    expect(ver).toEqual('0.4.0');

    // destroy
    await tUtil.frag.destroy();
  });
}

if (TEST_CTRL.PARSE_CONFIG) {
  test('tUtil.parseConfig(configPath)', async () => {
    const configPath = path.join(__dirname, './demo/config.js');
    const config = await tUtil.parseConfig(configPath);
    const oriConfig = require(configPath);

    const dirname = path.dirname(configPath);

    if (config.alias) {
      Object.keys(config.alias).forEach((key) => {
        expect(config.alias[key]).toEqual(util.path.resolve(dirname, oriConfig.alias[key]));
      });
    }
  });
}

if (TEST_CTRL.SERVER) {
  test('tUtil.server.start(dist, port)', async () => {
    const demoPath = path.join(__dirname, './demo');
    await tUtil.server.start(demoPath, 5000);
    const [err, res] = await request('http://127.0.0.1:5000/config.js');

    expect(err).toEqual(null);
    if (res) {
      expect(res.statusCode).toEqual(200);
    }
    await tUtil.server.start(demoPath, 5000);
  });

  test('tUtil.server.getAppSync()', async () => {
    expect(typeof tUtil.server.getAppSync() !== 'undefined').toEqual(true);
  });

  test('tUtil.server.abort()', async () => {
    await tUtil.server.abort();
    const canUse = await extOs.checkPort(5000);
    expect(canUse).toEqual(true);
  });
}

if (TEST_CTRL.HIDE_URL_TAIL) {
  test('tUtil.hideUrlTail(url)', async () => {
    const successMap = {
      'http://www.testhost.com/hello.js?a=1': 'http://www.testhost.com/hello.js',
      'http://www.testhost.com/hello.js#path=/index': 'http://www.testhost.com/hello.js',
      'http://www.testhost.com/hello.js#path=/index?key=val': 'http://www.testhost.com/hello.js',
      'http://www.testhost.com/hello.js?key=val#path=/index': 'http://www.testhost.com/hello.js'
    };
    Object.keys(successMap).forEach((key) => {
      expect(tUtil.hideUrlTail(key)).toEqual(successMap[key]);
    });
  });
}
