import React from 'react'

export default class MainLayout extends React.Component {

  render () {
    return (<div className="content">
      <nav>
        <ul>
          <li>
            <a href="/addpage">Add page</a>
          </li>
          <li>
            <a href="/pages">All pages</a>
          </li>
        </ul>
      </nav>

      <section>
        { this.props.children }
      </section>

      <style jsx>{`
        .content {
          max-width: 1000px;
          margin: 0 auto
        }
      `}</style>
    </div>)
  }
}