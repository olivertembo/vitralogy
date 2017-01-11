import React from "react"
import Nav from "react-bootstrap/lib/Nav"
import NavDropdown from "react-bootstrap/lib/NavDropdown"
import MenuItem from "react-bootstrap/lib/MenuItem"
import NavItem from "react-bootstrap/lib/NavItem"
import LinkContainer from "react-router-bootstrap/lib/LinkContainer"

class LogoutTopNavigation extends React.Component {
  render() {
    // Check Vitralogy access, if no VAS token then
    // need to not show blank dropdowns
    if (this.props.accountName.length === 0) {
      return <div />
    }

    return (
      <div className="logout-top-navigation">
        <Nav pullRight>
         
          <NavDropdown
            eventKey={2}
            title={this.props.name}
            id="basic-nav-dropdown"
          >
            <LinkContainer to="/help">
              <MenuItem eventKey={2.4}>Help</MenuItem>
            </LinkContainer>
            <MenuItem divider />
            <LinkContainer to="/logout">
              <MenuItem eventKey={2.3}>Logout</MenuItem>
            </LinkContainer>
          </NavDropdown>
          <NavItem disabled className="account" title={this.props.accountName}>{this.props.accountName}</NavItem>
        </Nav>
      </div>
    )
  }
}

export default LogoutTopNavigation
