import React, { Component } from "react"

class Content extends Component {
  render() {
    let path = this.props.children.props.location.pathname
    let containerClass = "container"

    if (path.includes("/team/edit")) {
      containerClass = "container profile"
    } else if (
      path.includes("/jobs") ||
      path.includes("/sites") ||
      path.includes("/home") ||
      path.includes("/team") ||
      path.includes("/support")
    ) {
      if (this.props.children.props.match.params.jobId !== undefined) {
        // job detail page
        containerClass = null
      } else {
        // job dashboard page
        containerClass = "container-fluid"
      }
    }

    return (
      <div className="content-area">
        <div className={containerClass}>{this.props.children}</div>
      </div>
    )
  }
}

export default Content
