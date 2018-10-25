import React from 'react'
import Main from '../layouts/main'

const embedCode = `<div>
  <style href="https://server.com/stylesheet.css"></style>
  <script src="https://server.com/project_id"></script>
  <div class="app"></div>
</div>`

const faqPage = doc => (<li>
  <h3>{ doc.title }</h3>
  <p>{ doc.id }</p>
  <p>Embed code:</p>
  <pre>{ doc.embed }</pre>
  <button>
    <a href={ doc.preview }>Preview</a>
  </button>
  {/* <button>Update</button> */}
  {/* <button>Delete</button> */}
  <hr />
  <style jsx>{`
    pre {
      background: black;
      color: #bada55;
      overflow: scroll;
      padding: 20px
    }
    button {
      display: block;
      padding: 10px 20px;
      border: solid 1px #ccc;
      border-radius: 8px;
      font-size: 16px;
      margin-bottom: 20px;
      width: 100%;
    }
  `}</style>
</li>)

export default class Pages extends React.Component {
  static async getInitialProps (context) {
    const output = {
      locals: context.res && context.res.locals,
      url: context.url,
    }
    return output
  }

  render () {
    return (
      <div>
        <Main>
          <h1>Pages</h1>
          <ul>
            {
              Object.values(this.props.locals.manifest.docs)
                .map(faqPage)
            }
          </ul>
          {/* <pre>{ JSON.stringify(this.props.locals.manifest, 'utf-8', 2) }</pre> */}
        </Main>
        
      </div>
    )
  }
}