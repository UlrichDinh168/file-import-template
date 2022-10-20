
import axios from 'axios'
import yauzl from 'yauzl'
import moment from 'moment'
import { sendMessage, downloadFile, pause, sendToDrive, keyStore } from './functions/utils/index.js'

export const fetch = async () => {
  console.log("run");

  const start = moment().subtract(1, "days").format("YYYY-MM-DD");
  const project = "Neste.de";
  const baseUrl = "https://api.awrcloud.com/v2/get.php";

  const awrUrl = `${baseUrl}?action=export_ranking&project=${project}&token=${await keyStore('awrToken')}&startDate=${start}&stopDate=${start}`

  const projectPath = `${project}.zip`;
  try {
    // First get URL for zipped CSV download.
    const response1 = await axios({
      method: 'get',
      url: awrUrl,
    })
    // Pause for 10 seconds to allow for CSV to generate.
    await pause(10000, response1)
    // Download zipped CSV.
    await downloadFile(response1.data.details, projectPath);

    await yauzl.open(projectPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) throw err
      zipfile.readEntry()
      zipfile.on('entry', function (entry) {

        // file entry
        zipfile.openReadStream(entry, async (err, readStream) => {
          if (err) throw err

          await readStream.on("end", () => {
            console.log('Unzip end')
            zipfile.readEntry()
          });

          await sendToDrive(readStream, project, await keyStore('gdriveKey'))

        })
      })

      // Temp work-around - ensure correct async above for steaming.
      // currently without this pause, the function ends before the file
      // is sent to G Drive.
    })
    await pause(5000)
  }
  catch (error) {
    // Send error to gchat.
    console.log("AAAAHHHHHHHHHHH")
    console.log(error, 'err');
    sendMessage(error)
  }
};

// fetch()