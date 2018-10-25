const fs = require('fs')
const paths = require('../paths')

exports.template = ({ title, location }) => `<div>
  <style href="${location}/index.css"></style>
  <div id="${title}"></div>
  <script src="${location}/app.js"></script>
</div>`




// exports.write = async ({ title, location, id }) => {
//   const embedCode = template({ title, location: req.location })

//   return new Promise(async (resolve, reject) => {
//     try {
//       fs.writeFileSync(`${paths.staging}/${title}-${id}/embedcode.html`, embedCode)
//       resolve('embed code written')
//     } catch (err) {
//       reject(err)
//     }
//   })
// }
