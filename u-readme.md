## Introduction
A simple app that exports data from Advanced Web Ranking (AWR) and saves to Google Drive. Errors appear during the process will be posted to Google chat via Webhook

## Features
- Download Advanced Web Ranking (AWR) report and extract file using [yauzl-proimse](https://github.com/overlookmotel/yauzl-promise)
- Credentials and keys are stored in AWS Parameters (SSM)

## Script
- `cd functions && npm install` or `npm i` to install dependencies.
- `npm start` to init the app.

## Notes
- Files locate inside `functions` folder are for Lambda execution.
- `test-index.js` uses [yauzl](https://github.com/thejoshwolfe/yauzl.git)
- `test-index-yauzl.js` uses [yauzl-proimse](https://github.com/overlookmotel/yauzl-promise)