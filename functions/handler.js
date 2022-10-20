import axios from 'axios'
import yauzl from 'yauzl-promise'
import moment from 'moment'
import { sendMessage, downloadFile, pause, sendToDrive, keyStore } from './utils/index.js'

export default async (event) => {
  const start = moment().subtract(1, 'days').format('YYYY-MM-DD')
  const project = event.project
  const baseUrl = 'https://api.awrcloud.com/v2/get.php'
  const projectPath = `${project}.zip`;

  const awrUrl = `${baseUrl}?action=export_ranking&project=${project}&token=${await keyStore('awrToken')}&startDate=${start}&stopDate=${start}`
  try {
    // First get URL for zipped CSV download.
    const response1 = await axios({
      method: 'get',
      url: awrUrl,
    })

    // Pause for 10 seconds to allow for CSV to generate.
    await pause(10000, response1)

    // Download zipped CSV.
    // return downloadFile(response1.data.details, '/tmp/' + project + '.zip')
    await downloadFile(response1.data.details, projectPath)

    // Extract file from Zip.
    console.log('Extracting zip.')

    const zipFile = await yauzl.open(`${projectPath}`)
    const entry = await zipFile.readEntry()
    const readStream = await zipFile.openReadStream(entry)

    await sendToDrive(readStream, project, await keyStore('gdriveKey'))

  } catch (error) {
    // Send error to gchat.
    console.log("AAAAHHHHHHHHHHH")
    sendMessage(error)
  }

};
