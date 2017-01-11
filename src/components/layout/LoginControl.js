import React, { Component } from "react"
import { Button } from "react-bootstrap"

class LoginControl extends Component {
  constructor(props) {
    super(props)

    this.handleLoginClick = this.handleLoginClick.bind(this)
    this.handleLogoutClick = this.handleLogoutClick.bind(this)
    this.state = {
      loggedIn: this.props.isLoggedIn,
    }
  }

  handleLoginClick() {
    this.props.loginCallback()
  }

  handleLogoutClick() {
    this.props.logoutCallback()
    this.state = {
      loggedIn: false,
    }
  }

  render() {
    let button = null

    if (this.state.loggedIn) {
      button = <Button onClick={this.handleLogoutClick}>Logout</Button>
    } else {
      button = <Button onClick={this.handleLoginClick}>Login</Button>
    }
    return <div>{button}</div>
  }
}

export default LoginControl
