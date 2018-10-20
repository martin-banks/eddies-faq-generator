import React from 'react'
import Main from '../layouts/main'

export default class AddPage extends React.Component {
  static async getInitialProps (context) {
    const output = {
      locals: context.res && context.res.locals,
      url: context.url,
    }
    return output
  }

  render () {
    return (<>
      <Main>
        <h1>Add FAQ page reference</h1>
        <form action="addpage" method="post">
          <label htmlFor="title">FAQ Title</label>
          <input type="text" name="title" id="title" />

          <label htmlFor="id" name="id">Google Doc ID</label>
          <input type="text" id="id" name="id" />

          <input type="submit" value="FAQ-it" />
        </form>

      </Main>
      <style jsx>{`
        input {
          display: block;
          width: 100%;
          max-width: 800px;
          margin-bottom: 12px;
          font-size: 23px;
        }
      `}</style>
    </>
    )
  }
}