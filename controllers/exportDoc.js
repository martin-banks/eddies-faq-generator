/* eslint no-console: 0 */
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { google } = require('googleapis')
const extract = require('extract-zip')
const template = require('../embed/template').template
const paths = require('../paths')
const mv = require('mv')
const FTP = require('ftp')
const ftpSync = require('../ftp/ftpSync')

require('dotenv').config()

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

const mediaServer = 'https://media.news.com.au/nnd/T3Interactives/test/uploader/faq'

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
function authorize (credentials, callback) {
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
function getAccessToken (oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', code => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
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
                      .replace(/src="images/gi, `src="${mediaServer}/${projectName}`)
                      // remove links to font import
                      // fails in Kurator validation
                      .replace(/\@import url\(.+\)\; \./, '\.')

                      /* 
                      @import url(https://themes.googleusercontent.com/fonts/css?kit=fpjTOVmNbO4Lz34iLyptLcWpXo_CmM6erK5IinBZ-8PVus-cM8ZA-pXCeyO7rfhH96xlbbE5D7Gw2o7jubnkMA); */
                      

                    console.log('corrections done')
                    console.log('writing corrected file')
                    // write corrected file to local dir
                    const staging = await paths.staging(`${projectName}`)
                    const downloads = path.join(process.cwd(), `static/file_system/downloads/${projectName}`)
                    console.log({ staging })
                    // Directory is created if needed in paths module
                    await fs.writeFileSync(`${staging}/index.html`, fileContent)
                    const faqAsString = fileContent
                      .replace(/"/g, '\\"')
                      .replace(/'/g, "\\'")
                    await fs.writeFileSync(`${staging}/app.js`, `document.querySelector('#${projectName}').innerHTML = "${faqAsString}"`)
                    console.log(template)
                    console.log(JSON.stringify(template, 'utf-8', 2))
                    const embed = template({
                      title: projectName,
                      location: `${mediaServer}/${projectName}`
                    })
                    await fs.writeFileSync(`${staging}/embed.html`, embed)


                    console.log('moving images out of folder', `${downloads}/images`)

                    const imageFiles = await fs.readdirSync(`${downloads}/images`)
                    console.log({ imageFiles })
                    for (const file of imageFiles) {
                      console.log('moving file', file, `${downloads}/images/${file}`)
                      await mvSync(`${downloads}/images/${file}`, `${staging}/${file}`)
                    }

                    console.log('images moved')

                    // * Do FTP stuff
                    const { USERNAME, PASSWORD, HOST } = process.env
                    const c = new FTP()

                    c.connect({
                      host: HOST,
                      user: USERNAME,
                      password: PASSWORD,
                      passvTimeout: 5 * 60 * 1000, // 5 minutes
                    })

                    c.on('ready', () => {
                      fs.readdir(`${staging}`, async (err, response) => {
                        console.log('staging files', response)
                        if (err) return console.log(err)
                        const parent = `test/uploader/faq`
                        const child = projectName
                        try {
                          console.log('making directory')
                          await ftpSync(c).mkdir({ into: parent, name: child })
                        } catch (err) {
                          console.log(err)
                          ftpSync(c).end()
                          return
                        }
                        for (const file of response) {
                          console.log({ staging, file })
                          try {
                            console.log('uploading file:', file)
                            ftpSync(c).put({
                              file,
                              from: `${staging}`,
                              into: `${parent}/${child}`,
                            })
                          } catch (err) {
                            ftpSync(c).end()
                            throw err
                          }
                        }
                        console.log('all files uploaded')
                        try {
                          console.log('Fetching list')
                          const list = await ftpSync(c).list({ path: `${parent}/${child}`})
                          console.log({ list })
                          ftpSync(c).end()
                          console.log('discontected from ftp server')
                        } catch (err) {
                          ftpSync(c).end()
                          throw err
                        }
                      })
                    })
                    

                    // this.res.sendFile(path.join(process.cwd(), `static/file_system/staging/${projectName}/index.html`))
                    // redirect to new faq preview
                    const preview = `${mediaServer}/${projectName}/index.html`
                    this.req.body.embed = template({
                      title: projectName,
                      location: `${mediaServer}/${projectName}`
                    })
                    this.req.body.preview = preview
                    this.next()
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
