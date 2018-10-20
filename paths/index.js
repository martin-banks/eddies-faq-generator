const path = require('path')
const mkdirp = require('mkdirp')

exports.local = child => {
  const pathName = path.join(process.cwd(), `static/file_system/${child.replace(/\s+/g, '_') || `new_${Date.now()}`}`)
  //  return pathName
  return new Promise((resolve, reject) => {
    mkdirp(pathName, err => {
      if (err) reject(err)
      resolve(pathName)
    })
  })
}
exports.downloads = child => {
  const pathName = path.join(process.cwd(), `static/file_system/downloads/${child.replace(/\s+/g, '_') || `new_${Date.now()}`}`)
  //  return pathName
  return new Promise((resolve, reject) => {
    mkdirp(pathName, err => {
      if (err) reject(err)
      resolve(pathName)
    })
  })
}

exports.staging = child => {
  const pathName = path.join(process.cwd(), `static/file_system/staging/${child.replace(/\s+/g, '_') || `new_${Date.now()}`}`)
  //  return pathName
  return new Promise((resolve, reject) => {
    mkdirp(pathName, err => {
      if (err) reject(err)
      resolve(pathName)
    })
  })
}