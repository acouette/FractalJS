"use strict";

var _express = _interopRequireDefault(require("express"));

var _nodePng = require("node-png");

var _main = _interopRequireDefault(require("../../engine/main"));

var _palette = _interopRequireDefault(require("../../util/palette"));

var _url = _interopRequireDefault(require("../../ui/url"));

var _canvas = _interopRequireDefault(require("../canvas"));

var _memoryStream = require("./memoryStream");

var _presets = _interopRequireDefault(require("./presets"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const path = require('path'); // simulate browser environment


global.navigator = {
  hardwareConcurrency: 1
};
global.performance = {
  now() {
    return Date.now();
  }

};
const port = 8080;

function renderOnCanvas(desc, color, width, height) {
  const canvas = new _canvas.default(width, height);
  const params = {
    canvas,
    ...desc,
    colors: { ...color,
      buffer: _palette.default.getBufferFromId(color.id, 1000)
    }
  };
  const engine = new _main.default(params);
  return engine.draw({
    details: 'normal'
  }).then(() => engine.draw({
    details: 'supersampling',
    size: 4
  })).then(() => {
    const buffer = canvas.buffer;
    return new Uint8Array(buffer);
  });
}

function getPngBuffer(array, width, height) {
  return new Promise(resolve => {
    const png = new _nodePng.PNG({
      width,
      height,
      filterType: -1
    });

    for (let i = 0; i < width * height * 4; i += 1) {
      png.data[i] = array[i];
    }

    const iter = 'iter';
    const wstream = new _memoryStream.WMStrm(iter);
    png.pack().pipe(wstream); // stupid PNG library... !

    wstream.on('finish', () => {
      resolve(_memoryStream.memStore[iter]);
    });
  });
}

const app = (0, _express.default)();
app.use(awsServerlessExpressMiddleware.eventContext());
app.get('/fractal', async (req, res) => {
  const width = req.query.width ? Number(req.query.width) : 512;
  const height = req.query.height ? Number(req.query.height) : 512; // preset or default

  let desc = {};
  let color = {};

  if (req.query.preset) {
    [desc, color] = _url.default.readCurrentScheme(_presets.default[Number(req.query.preset)].location);
  } else {
    desc = {
      x: -0.7,
      y: 0,
      w: 2.5,
      iter: 50,
      type: 'mandelbrot',
      smooth: true
    };
    color = {
      offset: 0,
      density: 20,
      id: 0
    };
  } // additional parameters


  if (req.query.offset) color.offset = Number(req.query.offset);
  if (req.query.density) color.density = Number(req.query.density);
  if (req.query.id) color.id = Number(req.query.id);
  if (req.query.x) desc.x = Number(req.query.x);
  if (req.query.y) desc.y = Number(req.query.y);
  if (req.query.w) desc.w = Number(req.query.w);
  if (req.query.iter) desc.iter = Number(req.query.iter);
  if (req.query.type) desc.type = req.query.type;
  if (req.query.smooth) desc.smooth = req.query.smooth === 'true';
  const uint = await renderOnCanvas(desc, color, width, height);
  const str = await getPngBuffer(uint, width, height);
  res.set('Content-Type', 'image/png');
  res.set('Expire', '0');
  res.set('Pragma', 'no-cache');
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Access-Control-Allow-Origin', '*');


  res.send(str);
});

module.exports = app;
