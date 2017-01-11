import React, { Component } from "react"
import { Nav, Navbar, NavItem } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { Icon } from "react-fa"

import * as api from "../constants/api"
import LogoutTopNavigation from "./LogoutTopNavigation"
import LoginTopNavigation from "./LoginTopNavigation"
import SimpleLogoutTopNavigation from "./SimpleLogoutTopNavigation"
import {ReactComponent as AppLogo} from '../assets/icons/brand/VitralogyLogo_White.svg'

const logo = require("../assets/images/vitralogy_logo_small.png")

class TopNavigation extends Component {
  getNavClassName = () => {
    switch (api.PLATFORM_ENV) {
      case "qa":
        return "navbar-qa"
      case "staging":
        return "navbar-staging"
      case "prod":
        return "navbar-prod"
      default:
      case "dev":
        return "navbar-dev"
    }
  }

  render() {
    const isLoggedIn = this.props.auth.isAuthenticated()
    const vasAccess = this.props.auth.vitralogyAccess()
    const navClassName = this.getNavClassName()

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
              {/* <Icon name="tachometer" className="nav__item-icon"/>  */}
              Home
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/jobs">
            <NavItem>
              {/* <Icon name="briefcase" className="nav__item-icon"/>  */}
              Jobs
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/details">
            <NavItem>
              {/* <Icon name="info-circle" className="nav__item-icon"/>  */}
              Details
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/team">
            <NavItem>
              {/* <Icon name="users" className="nav__item-icon"/>  */}
              Team
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/support">
            <NavItem>
              {/* <Icon name="medkit" className="nav__item-icon"/>  */}
              Support
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/binder">
            <NavItem>
              {/* <Icon name="folder-open" className="nav__item-icon"/>  */}
              Virtual Binder
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/reporting">
            <NavItem>
              {/* <Icon name="bar-chart" className="nav__item-icon"/>  */}
              Reporting
            </NavItem>
          </LinkContainer>
          {/* <LinkContainer to="/invoices">
            <NavItem>
              <Icon name="file-text" className="nav__item-icon"/> Invoices
            </NavItem>
          </LinkContainer> */}
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
      <Navbar className={navClassName} fixedTop collapseOnSelect fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <AppLogo className="app-logo"/>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          {/* <Navbar.Text>
            <strong>{api.PLATFORM_NAME}</strong>
          </Navbar.Text> */}
          {navLinks}
          {rightNav}
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default TopNavigation
