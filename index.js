const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { google } = require('googleapis')
const extract = require('extract-zip')


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = 'token.json'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err)
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles)
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0])

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}


/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v2', auth})
  // https://drive.google.com/file/d/0ByF6K-LU1J97R2lRRnNzeUNxeTA/view?usp=sharing
  // var fileId = '0ByF6K-LU1J97R2lRRnNzeUNxeTA'
  var fileId = '1P0mszvdnXEeLXw3TPzogU1tfItFtpas-yowFYlghFoI'
  var dest = fs.createWriteStream('./tmp/export.zip');
  let data = []
  drive.files.export(
    {
      fileId: fileId,
      mimeType: 'application/zip',
    },
    { responseType: 'stream' },
    (err, response) => {
      if (err) return console.log(err)
      response.data
        .on('error', err => console.log(err))
        .on('end', () => {
          console.log('File has been got')
          dest.on('finish', data => {
            console.log('All data is written')
            console.log(typeof path.join(__dirname, './tmp/export.zip'))
            extract(
              path.join(__dirname, './tmp/export.zip'),
              { dir:`${__dirname}/tmp` },
              async err => {
                if (err) return console.log('Error extracting zip:\n', err, '\n------------')
                let fileContent = await fs.readFileSync(path.join(__dirname, './tmp/ENDOFYEAR.html'))
                fileContent = fileContent
                  .toString()
                  .replace('src="images', ' src="https://someserver/images')

                console.log(fileContent)
              })
          })
          dest.end()
        })
        .pipe(dest)
    }
  )




  // drive.files.list({
  //   pageSize: 50,
  //   // fields: 'nextPageToken, files(id, name, mimeType)',
  // }, (err, res) => {
  //   if (err) return console.log('The API returned an error: ' + err)
  //   const files = res.data.files
  //   if (files.length) {
  //     console.log([
  //       '-----------',
  //       Object.keys(files[0]),
  //       '-----------'
  //     ].join('\n'))
  //     console.log('Files:')
  //     files
  //       // .filter(f => f.mimeType === 'application/vnd.google-apps.folder')
  //       .forEach((file) => {
  //         // const dest = fs.createWriteStream('/download/somefile.txt')
  //         console.log(`${JSON.stringify(file, 'utf-8', 2)}\n--------------`)
  //       })
  //   } else {
  //     console.log('No files found.')
  //   }
  // })
}