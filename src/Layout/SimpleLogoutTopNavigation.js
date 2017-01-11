import React from "react"
import Nav from "react-bootstrap/lib/Nav"
import NavItem from "react-bootstrap/lib/NavItem"
import LinkContainer from "react-router-bootstrap/lib/LinkContainer"

const propTypes = {}

const defaultProps = {}

const SimpleLogoutTopNavigation = () => (
  <div className="logout-top-navigation">
    <Nav pullRight>
      <LinkContainer to="/logout">
        <NavItem>Logout</NavItem>
      </LinkContainer>
    </Nav>
  </div>
)

SimpleLogoutTopNavigation.propTypes = propTypes
SimpleLogoutTopNavigation.defaultProps = defaultProps

export default SimpleLogoutTopNavigation
