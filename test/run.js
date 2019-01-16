const tUtil = require('../lib/test-util.js');
const path = require('path');

const FRAG_PATH = path.join(__dirname, './__frag');

tUtil.buildFiles(path.join(FRAG_PATH, 'path/toa/'));
