"use strict";

const awsServerlessExpress = require('aws-serverless-express');

const app = require('./js/node/http/server'); // NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below, then redeploy (`npm run package-deploy`)


const binaryMimeTypes = ['image/png'];
const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
