import React from "react"

class Content extends React.Component {
  render() {
    let path = this.props.children.props.location.pathname
    let containerClass = "container"

    if (path.includes("/team/edit")) {
      containerClass = "container profile"
    } else {
      if (
        Object.keys(this.props.children.props.match.params).length > 0 &&
        this.props.children.props.match.params.jobId !== undefined
      ) {
        // job detail page
        containerClass = null
      } else {
        // job dashboard page
        containerClass = "container-fluid"
      }
    }

    let contentAreaClass = "content-area"
    if (path.includes("/binder")) {
      contentAreaClass += " binder"
    }

    return (
      <div className={contentAreaClass}>
        <div className={containerClass}>{this.props.children}</div>
      </div>
    )
  }
}

export default Content
