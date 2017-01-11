import React, { Component } from "react"
import { Nav, Navbar, NavItem } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { Icon } from "react-fa"

import * as api from "../../constants/api"
import LogoutTopNavigation from "./LogoutTopNavigation"
import LoginTopNavigation from "./LoginTopNavigation"
import SimpleLogoutTopNavigation from "./SimpleLogoutTopNavigation"

class TopNavigation extends Component {
  render() {
    const isLoggedIn = this.props.auth.loggedIn()
    const vasAccess = this.props.auth.vitralogyAccess()

    let rightNav = null
    let navLinks = null
    if (vasAccess) {
      rightNav = (
        <LogoutTopNavigation
          accountName={this.props.auth.getProfileAccountName()}
          name={this.props.auth.getProfileName()}
        />
      )

      navLinks = (
        <Nav>
          <LinkContainer to="/home">
            <NavItem>
              <Icon name="tachometer" /> Home
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/jobs">
            <NavItem>
              <Icon name="briefcase" /> Jobs
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/details">
            <NavItem>
              <Icon name="info-circle" /> Details
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/team">
            <NavItem>
              <Icon name="users" /> Team
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/support">
            <NavItem>
              <Icon name="medkit" /> Support
            </NavItem>
          </LinkContainer>
        </Nav>
      )
    } else {
      if (!isLoggedIn) {
        rightNav = <LoginTopNavigation />
      } else {
        rightNav = <SimpleLogoutTopNavigation />
      }
    }

    return (
      <Navbar fixedTop collapseOnSelect fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <img
              src={require("../../assets/images/vitralogy_logo_small.png")}
              alt="Vitralogy Collaborative Process Automation"
              title="Vitralogy Collaborative Process Automation"
            />
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Navbar.Text>
            <strong>{api.PLATFORM_NAME}</strong>
          </Navbar.Text>
          {navLinks}
          {rightNav}
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default TopNavigation
