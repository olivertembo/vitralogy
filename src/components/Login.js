import React from "react"
import PropTypes from "prop-types"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import Button from "react-bootstrap/lib/Button"

import Auth from "../Auth/Auth"

const propTypes = {
  location: PropTypes.object,
  auth: PropTypes.instanceOf(Auth),
}

const defaultProps = {}

export default class Login extends React.Component {
  componentDidMount() {
    if (this.props.auth.getToken() === null) {
      this.props.auth.login()
    }
  }

  render() {
    return (
      <div>
        <h3>Please login to continue...</h3>
        <ButtonToolbar>
          <Button bsStyle="primary" onClick={this.props.auth.login.bind(this)}>
            Login
          </Button>
        </ButtonToolbar>
      </div>
    )
  }
}

Login.propTypes = propTypes
Login.defaultProps = defaultProps
