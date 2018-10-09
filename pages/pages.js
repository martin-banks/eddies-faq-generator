import React from 'react'
import Main from '../layouts/main'

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
          <pre>{ JSON.stringify(this.props.locals, 'utf-8', 2) }</pre>
        </Main>
      </div>
    )
  }
}