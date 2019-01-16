const tUtil = require('../lib/test-util.js');
const path = require('path');
const fs = require('fs');
const util = require('yyl-util');

const TEST_CTRL = {
  FRAG: true,
  BUILD_FILES: true,
  PARSE_CONFIG: true,
  SERVER: true
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

  test('tUtil.frag.destory()', async () => {
    await tUtil.frag.destory();
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

    await tUtil.frag.destory();
  });

  test('tUtil.buildFiles(dirPath)', async () => {
    await tUtil.frag.build();

    const iPath = path.join(FRAG_PATH, 'path/toa/');
    const r = await tUtil.buildFiles(iPath);
    expect(r.join('')).toEqual(iPath);
    console.log(iPath);
    expect(fs.existsSync(iPath)).toEqual(true);
    expect(fs.statSync(iPath).isDirectory()).toEqual(true);

    await tUtil.frag.destory();
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
    await tUtil.frag.destory();
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

}
