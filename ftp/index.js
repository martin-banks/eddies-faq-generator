const FTP = require('ftp')
// https://www.npmjs.com/package/ftp
const fs = require('fs')

require('dotenv').config()

const { USERNAME, PASSWORD, HOST } = process.env
const c = new FTP()

const ftp = {
  list ({ path }) {
    return new Promise((resolve, reject) => {
      c.list(path, (err, list) => {
        if (err) reject(err)
        resolve(list)
      })
    })
  },
  put ({ file, from, into }) {
    return new Promise((resolve, reject) => {
      c.put(`${from}/${file}`, `${into}/${file}`, err => {
        if (err) reject(err)
        console.log(`-- SUCCESS --\n${into}/${file} was successfully uploaded`)
        resolve(`-- SUCCESS --\n${into}/${file} was successfully uploaded`)
      })
    })
  },
  mkdir ({ into, name }) {
    return new Promise((resolve, reject) => {
      c.mkdir(`${into}/${name}`, err => {
        if (err) reject(err)
        console.log(`-- SUCCESS --\n${into}/${name} was successfully created`)
        resolve(`-- SUCCESS --\n${into}/${name} was successfully created`)
      })
    })
  },
  end () {
    c.end()
  }
}


/* eslint-disable */
c.on('ready', () => {
  fs.readdir(`${__dirname}/multi-upload`, async (err, response) => {
    if (err) return console.log(err)
    const parent = 'test/uploader/201810/new_folder'
    const child = 'asyced'
    try {
      console.log('making directory')
      await ftp.mkdir({ into: parent, name: child })
    } catch (err) {
      ftp.end()
      throw err
    }
    for (const file of response) {
      try {
        console.log('uploading file:', file)
        ftp.put({
          from: `multi-upload/${file}`,
          into: `${parent}/${child}`,
          file,
        })
      } catch (err) {
        ftp.end()
        throw err
      }
    }
    console.log('all files uploaded')
    try {
      console.log('Fetching list')
      const list = await ftp.list({ path: `${parent}/${child}`})
      console.log({ list })
      ftp.end()
      console.log('discontected from ftp server')
    } catch (err) {
      ftp.end()
      throw err
    }
  })
})

c.connect({
  host: HOST,
  user: USERNAME,
  password: PASSWORD,
  passvTimeout: 15 * 60 * 1000, // 15 minutes
})



    // c.mkdir('test/uploader/201810/new_folder', err => {
    //   response.forEach((file, i) => {
    //     if (err) {
    //       console.log(err)
    //       c.end()
    //       return
    //     }
    //     c.put(`multi-upload/${file}`, `test/uploader/201810/new_folder/${file}`, err => {
    //       if (err) {
    //         console.log(err)
    //         c.end()
    //         return
    //       }
    //       if ((i + 1) === response.length) {
    //         c.list('test/uploader/201810/new_folder', (err, list) => {
    //           if (err) throw err
    //           console.log(list)
    //           c.end()
    //         })
    //       }
    //     })
    //   })
    // })
//   })
// })





// c.on('ready', () => {
//   // c.list('../../multimedia', (err, list) => {})
//   fs.readdir(`${__dirname}/multi-upload`), (err, response) => {
//     if (err) return console.log(err)
//     c.mkdir('test/uploader/201810/new_folder', err => {
//       response.forEach((file, i) => {
//         if (err) {
//           console.log(err)
//           c.end()
//           return
//         }
//         c.put(`multi-upload/${file}`, `test/uploader/201810/new_folder/${file}`, err => {
//           if (err) {
//             console.log(err)
//             c.end()
//             return
//           }
//           if ((i + 1) === response.length) {
//             c.list('test/uploader/201810/new_folder', (err, list) => {
//               if (err) throw err
//               console.log(list)
//               c.end()
//             })
//           }
//         })
//       })
//     })
//   })
// })
