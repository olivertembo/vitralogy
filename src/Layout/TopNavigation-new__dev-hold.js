import React, { Component } from "react"
//import { Nav, Navbar, NavItem } from "react-bootstrap"
//import { LinkContainer } from "react-router-bootstrap"
//import { Icon } from "react-fa"

import { Menu, Affix } from "antd";

import * as api from "../constants/api"

import LogoutTopNavigation from "./LogoutTopNavigation"
import LoginTopNavigation from "./LoginTopNavigation"
import SimpleLogoutTopNavigation from "./SimpleLogoutTopNavigation"
import {ReactComponent as AppLogo} from '../assets/icons/brand/VitralogyLogo_White.svg'
import { Link } from "react-router-dom";

const logo = require("../assets/images/vitralogy_logo_small.png")

class TopNavigation extends Component {
  state = {
    current: 'menu-item-home'
  }

  onMenuItemClick = e => {   
    this.setState({
      current: e.key,
    });
  };
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

      navLinks = (<>     
        <Menu.Item key="menu-item-home">
          <a href="/home"> Home </a>
        </Menu.Item>
        <Menu.Item key="menu-item-jobs">
          <a href="/jobs"> Jobs </a>
        </Menu.Item>
        <Menu.Item key="menu-item-details">
          <a href="/details"> Details </a>
        </Menu.Item>
        <Menu.Item key="menu-item-team">
          <a href="/team"> Team </a>
        </Menu.Item>      
        <Menu.Item key="menu-item-support">
          <a href="/support"> Support </a>
        </Menu.Item>
        <Menu.Item key="menu-item-binder">
          <a href="/binder">  Virtual Binder </a>
        </Menu.Item>
        <Menu.Item key="menu-item-reporting">
          <a href="/reporting"> Reporting </a>
        </Menu.Item>
        <Menu.Item key="menu-item-invoices">
          <a href="/invoices"> Invoices </a>
        </Menu.Item>   </>             
      )
    } else {
      if (!isLoggedIn) {
        rightNav = <LoginTopNavigation />
      } else {
        rightNav = <SimpleLogoutTopNavigation />
      }
    }

    return (
      // <Affix offsetTop={0}>
      <div className="top-navigation">
        <div className="logo">
          <AppLogo className="app-logo"/>
        </div>
      <Menu mode="horizontal" className="main-menu" onClick={this.onMenuItemClick} selectedKeys={[this.state.current]}>
        {/* <Menu.Item key="menu-item-logo" disabled>
          <AppLogo className="app-logo"/>
        </Menu.Item> */}
        <Menu.Item key="menu-item-home">
          <Link to="/home"> Home </Link>
        </Menu.Item>
        <Menu.Item key="menu-item-jobs">
          <Link to="/jobs"> Jobs </Link>
        </Menu.Item>
        <Menu.Item key="menu-item-details">
          <Link to="/details"> Details </Link>
        </Menu.Item>
        <Menu.Item key="menu-item-team">
          <Link to="/team"> Team </Link>
        </Menu.Item>      
        <Menu.Item key="menu-item-support">
          <Link to="/support"> Support </Link>
        </Menu.Item>
        <Menu.Item key="menu-item-binder">
          <Link to="/binder">  Virtual Binder </Link>
        </Menu.Item>
        <Menu.Item key="menu-item-reporting">
          <Link to="/reporting"> Reporting </Link>
        </Menu.Item>
        {/* <Menu.Item key="menu-item-invoices">
          <Link to="/invoices"> Invoices </Link>
        </Menu.Item>  */}
      </Menu>
      </div>
      // </Affix>
      // <Navbar className={navClassName} fixedTop collapseOnSelect fluid>
      //   <Navbar.Header>
      //     <Navbar.Brand>
      //       <AppLogo className="app-logo"/>
      //     </Navbar.Brand>
      //     <Navbar.Toggle />
      //   </Navbar.Header>
      //   <Navbar.Collapse>
      //     {/* <Navbar.Text>
      //       <strong>{api.PLATFORM_NAME}</strong>
      //     </Navbar.Text> */}
      //     {navLinks}
      //     {rightNav}
      //   </Navbar.Collapse>
      // </Navbar>
    )
  }
}

export default TopNavigation
