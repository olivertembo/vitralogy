import React from "react"
import _ from "lodash"
import Alert from "react-s-alert"
import TopNavigation from "./TopNavigation"
import Content from "./Content"
import * as api from "../../constants/api"
import "react-mde/lib/styles/scss/react-mde-all.scss"
// import "react-mde/lib/styles/react-mde-command-styles.scss";
// import "react-mde/lib/styles/markdown-default-theme.scss";
import "froala-editor/js/froala_editor.pkgd.min.js"
import "froala-editor/css/froala_style.min.css"
import "froala-editor/css/froala_editor.pkgd.min.css"
// require('bootstrap/dist/css/bootstrap.min.css')
require("react-bootstrap-table/dist/react-bootstrap-table-all.min.css")
// require('bootstrap/dist/js/bootstrap.min.js
require("react-s-alert/dist/s-alert-default.css")

require("../../styles/styles.scss")

class Container extends React.Component {
  constructor() {
    super()

    this.logout = this.logout.bind(this)
    this.login = this.login.bind(this)
  }

  logout() {
    this.props.route.auth.logout()
    this.props.history.replace("/login")
  }

  login() {
    this.props.route.auth.login()
  }

  recursiveCloneChildren(children) {
    return React.Children.map(children, child => {
      if (!_.isObject(child)) return child
      var childProps = { auth: this.props.route.auth }
      childProps.children = this.recursiveCloneChildren(child.props.children)
      return React.cloneElement(child, childProps)
    })
  }

  render() {
    let children = null
    if (this.props.children) {
      children = this.recursiveCloneChildren(this.props.children)
    }

    return (
      <div>
        <Alert stack={{ limit: 3 }} position="bottom-left" />
        <TopNavigation auth={this.props.route.auth} />
        <Content>{children}</Content>
        {api.PLATFORM_ENV !== null && (
          <div className="environment-watermark">
            {api.PLATFORM_ENV.toUpperCase()}
          </div>
        )}
      </div>
    )
  }
}

export default Container
