const FTP = require('ftp')
// * https://www.npmjs.com/package/ftp

/* eslint-disable */
function ftpSync (c) {
  return {
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
}

module.exports = ftpSync

