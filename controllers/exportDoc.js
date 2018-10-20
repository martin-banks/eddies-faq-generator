/* eslint no-console: 0 */
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { google } = require('googleapis')
const extract = require('extract-zip')
const template = require('../embed/template').template
const paths = require('../paths')
const mv = require('mv')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive']
const TOKEN_PATH = 'token.json'

function mvSync (target, destination) {
  return new Promise((resolve, reject) => {
    mv(target, destination, err => {
      if (err) reject(err)
      resolve(`${target}\nwas moved successfully`)
    })
  })
}

exports.exportDoc = (req, res, next) => {
  // Load client secrets from a local file.
  const { id, title } = req.body
  console.log({ id })
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err)
    // Authorize a client with credentials, then call the Google Drive API.
    console.log('authorizing')
    authorize(JSON.parse(content), listFiles.bind({ req, res, id, next, title }))
  })
}

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
function listFiles (auth) {
  console.log({ auth })
  console.log('authorized')
  console.log('connecting to drive')
  const drive = google.drive({version: 'v2', auth})
  // https://drive.google.com/file/d/0ByF6K-LU1J97R2lRRnNzeUNxeTA/view?usp=sharing
  // var fileId = '0ByF6K-LU1J97R2lRRnNzeUNxeTA'
  var fileId = this.id
  console.log({ fileId })
  const projectName = `${this.title}__${this.id}`
  const zipFilePath = `${__dirname}/../static/file_system/downloads/${projectName}.zip`
  var dest = fs.createWriteStream(zipFilePath)
  let data = []
  drive.files.export(
    {
      fileId: fileId,
      mimeType: 'application/zip',
    },
    { responseType: 'stream' },
    (err, response) => {
      console.log('response recieved')
      if (err) return console.log(err)
      response.data
        .on('error', err => console.log(err))
        .on('end', () => {
          console.log('File has been got')
          dest.on('finish', data => {
            console.log('All data is written')
            console.log('extracting')
            console.log(process.cwd())
            extract(
              path.join(process.cwd(), `static/file_system/downloads/${projectName}.zip`),
              { dir: path.join(process.cwd(), `static/file_system/downloads/${projectName}`) },
              async extractError => {
                if (extractError) return console.log('Error extracting zip:\n', extractError, '\n------------')
                fs.readdir(path.join(process.cwd(), `static/file_system/downloads/${projectName}`), async (fileListErr, fileList) => {
                  if (fileListErr) return console.log('--- ERROR GETTING FILELIST ---\n', fileListErr, '\n-------------------')
                  console.log({ fileList })
                  const htmlFile = fileList.filter(f => f.includes('.html'))[0]
                  try {
                    let fileContent = await fs.readFileSync(path.join(process.cwd(), `static/file_system/downloads/${projectName}/${htmlFile}`))
                    console.log('extraction done')
                    console.log('starting corrections')
                    fileContent = fileContent
                      .toString()
                      .replace(/src="images/gi, `src="http://localhost:3000/static/file_system/staging/${projectName}/images`)
                    console.log('corrections done')
                    console.log('writing corrected file')
                    // write corrected file to local dir
                    const staging = await paths.staging(`${projectName}`)
                    console.log({ staging })
                    // Directory is created if needed in paths module
                    await fs.writeFileSync(`${staging}/index.html`, fileContent)
                    console.log(template)
                    console.log(JSON.stringify(template, 'utf-8', 2))
                    const embed = template({ title: this.req.body.title, location: 'https://someserver' })
                    await fs.writeFileSync(`${staging}/embed.html`, embed)
                    // write public link to manifest
                    // generate embed code
                    // write embedcode to local
                    // await template.write({ title: this.req.body.title, location: 'https://someserver', id: this.id })
                    // push all files to ftp
                    
                    console.log('moving images folder')
                    await mvSync(path.join(process.cwd(), `static/file_system/downloads/${projectName}/images`), `${staging}/images`)
                    console.log('images folder moved')
                    
                    // this.res.sendFile(path.join(process.cwd(), `static/file_system/staging/${projectName}/index.html`))
                    // redirect to new faq preview
                    this.res.redirect(`static/file_system/staging/${projectName}/index.html`)
                    console.log('corrected file written')
                  } catch (extractAsyncError) {
                    return console.error(extractAsyncError)
                  }
                })
              }
            )
          })
          dest.end()
          // this.next()
        })
        .pipe(dest)
    }
  )
}
