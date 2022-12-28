## Introduction
- A simple app that exports data daily from Advanced Web Ranking (AWR) and saves to Google Drive. Errors appear during the process will be posted to Google chat via Webhook


## Features
- Download Advanced Web Ranking (AWR) report and extract file using [yauzl-proimse](https://github.com/overlookmotel/yauzl-promise)
- Credentials and keys are stored in AWS Parameters (SSM)
- It was managed by AWS Lambda Application.
- Codebase was stored in AWS S3.
- The application was provisioned and managed by AWS Cloudformation.

## Script
- `cd functions && npm install` or `npm i` to install dependencies.
- `npm start` to init the app.

## Notes
- There are two versions: `yauzl` and `yauzl-promise`.
- Files locate inside `functions` folder are for Lambda execution.
- Run `npm start` to start `test-index.js` that uses [yauzl](https://github.com/thejoshwolfe/yauzl.git)
- Run `npm run startyauzl` to start `test-index-yauzl.js` that uses [yauzl-proimse](https://github.com/overlookmotel/yauzl-promise)
