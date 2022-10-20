import fs from 'fs'
import axios from 'axios'
import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import aws from 'aws-sdk'
import moment from 'moment'

/**
 * 
 * @param {string} type 
 * @returns key
 */

export const ssm = new aws.SSM({
  region: "eu-west-1"
});


export const keyStore = async (type) => {
  // Get SSM creds.
  const getParametersResponse = await ssm.getParameters({
    Names: [
      "MC_AWR_TOKEN", "TEST_GDRIVE_U", 'G_CHAT_TOKEN', 'G_CHAT_KEY', 'DRIVE_DIRECTORY'
    ],
    WithDecryption: true
  }).promise();

  const parameters = getParametersResponse.Parameters;
  switch (type) {

    case "awrToken":
      const awrToken = parameters.find(param => param.Name === "MC_AWR_TOKEN").Value
      return awrToken

    case "gdriveKey":
      const gdriveKey = parameters.find(param => param.Name === "TEST_GDRIVE_U").Value
      return gdriveKey

    case "gchatToken":
      const gchatToken = parameters.find(param => param.Name === "G_CHAT_TOKEN").Value
      return gchatToken

    case "drive_dir":
      const drive_dir = parameters.find(param => param.Name === "DRIVE_DIRECTORY").Value
      console.log([drive_dir], 'drive_dir');
      return [drive_dir]

    default:
      const gchatKey = parameters.find(param => param.Name === "G_CHAT_KEY").Value
      return gchatKey
  }
}


/**
 * Send error to G Chat.
 * 
 * @param {string} msg 
 */
export const sendMessage = async (msg) => {
  try {
    axios({
      method: 'POST',
      url: `https://chat.googleapis.com/v1/spaces/AAAAbulywdQ/messages?key=${await keyStore('gchatKey')}&token=${await keyStore('gchatToken')}`,
      data: { 'text': `${msg}` }
    })
  } catch (error) {
    console.log(error.data.error.message, 'error');
  }
}


/**
 * Retrieve and save remote file.
 * 
 * @param {string} fileUrl 
 * @param {string} outputLocationPath 
 */
export const downloadFile = (fileUrl, outputLocationPath) => {
  const writer = fs.createWriteStream(outputLocationPath)

  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {

    return new Promise((resolve, reject) => {
      response.data.pipe(writer)
      let error = null

      writer.on('error', err => {
        error = err
        writer.close()
        reject(err)
      })

      writer.on('close', () => {
        if (!error) {
          console.log('Resolve file download.')
          resolve(true)
        }
      })
    })
  })
}

/**
 * Pause
 * 
 * @param {int} time 
 */
export const pause = (time, response) => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () { resolve(response); }, time);
  });
};

/**
 * Create new file in G Drive
 * @param {*} drive 
 * @param {*} fileName 
 */
export const driveCreate = async (drive, file, fileName) => {

  console.log('Sending ' + fileName)

  const response = await drive.files.create({
    resource: {
      name: fileName,
      parents: await keyStore('drive_dir')
    },
    media: {
      mimeType: 'text/csv',
      body: file
    },
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  return response
}



/**
 * Save file to Google Drive in specified directory.
 * 
 * @param {steam} file 
 * @param {string} dir 
 */
export const sendToDrive = async (file, project, gdriveKey) => {

  const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const fileName = 'awr-export-' + project + '-' + yesterday + '.csv'

  // G Drive authentication.
  const client = new JWT({
    email: "aws-test-drive@test-project-354611.iam.gserviceaccount.com",
    key: gdriveKey,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ]
  });

  const drive = google.drive({
    version: 'v3',
    auth: client
  })

  driveCreate(drive, file, fileName)
}

/**
 * Update file in G Drive.
 * 
 * @param {*} drive 
 * @param {*} fileName 
 * @param {*} fileId 
 */
export const driveUpdate = async (drive, file, fileName, fileId) => {
  const response = await drive.files.update({
    fileId: fileId,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    resource: {
      name: fileName
    },
    media: {
      mimeType: 'text/csv',
      body: file
    }
  })

  return response
}
