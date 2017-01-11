import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { logoutUser } from "../actions/userAccounts"
import Auth from "../Auth/Auth"

const propTypes = {
  location: PropTypes.object,
  auth: PropTypes.instanceOf(Auth),
  logoutUser: PropTypes.func.isRequired,
}

const defaultProps = {}

const getActions = dispatch => {
  return {
    logoutUser: () => dispatch(logoutUser()),
  }
}

class Logout extends React.Component {
  componentDidMount() {
    this.props.auth.logout()
    this.props.logoutUser()
    this.props.history.replace(`/login`)
  }

  render() {
    return (
      <div>
        Logged out, <Link to="login">login</Link> again?
      </div>
    )
  }
}

Logout.propTypes = propTypes
Logout.defaultProps = defaultProps

export default connect(
  null,
  getActions,
)(Logout)
