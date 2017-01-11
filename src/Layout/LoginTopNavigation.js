import React from "react"
import Nav from "react-bootstrap/lib/Nav"
import NavItem from "react-bootstrap/lib/NavItem"
import { LinkContainer } from "react-router-bootstrap"

class LoginTopNavigation extends React.Component {
  render() {
    return (
      <div className="login-top-navigation">
        <Nav pullRight>
          <LinkContainer to="/login">
            <NavItem href="#">Login</NavItem>
          </LinkContainer>
        </Nav>
      </div>
    )
  }
}

export default LoginTopNavigation
