import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { Row, Col } from "react-bootstrap"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import Formsy from "formsy-react"
import { Input } from "formsy-react-components"
import Switch from "antd/lib/switch"
import SweetAlert from "react-bootstrap-sweetalert"

import {
  postUserIsActive,
  postUserRoleType,
  postUserSetupEmail,
} from "../../actions/team"
const questionIcon = require("../../assets/images/question.png")

const getState = state => {
  return {
    userAccountRoleTypes: [...state.lookups.userAccountRoleTypes],
  }
}

const getActions = dispatch => {
  return {
    postUserIsActive: payload => dispatch(postUserIsActive(payload)),
    postUserRoleType: payload => dispatch(postUserRoleType(payload)),
    postUserSetupEmail: payload => dispatch(postUserSetupEmail(payload)),
  }
}

const propTypes = {
  data: PropTypes.object.isRequired,
  postUserIsActive: PropTypes.func.isRequired,
  userAccountRoleTypes: PropTypes.array.isRequired,
  postUserRoleType: PropTypes.func.isRequired,
  postUserSetupEmail: PropTypes.func.isRequired,
}

const defaultProps = {}

class AuthenticationInfo extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      alert: null,
    }

    this.hideAlert = this.hideAlert.bind(this)
    this.onRoleChange = this.onRoleChange.bind(this)
    this.onActiveChange = this.onActiveChange.bind(this)
  }

  get displayName() {
    return "AuthenticationInfo"
  }

  componentDidMount = () => {
    this.setState({
      alert: null,
    })
  }

  hideAlert() {
    this.setState({
      alert: null,
    })
  }

  onActiveChange(checked) {
    //console.log(`active switch to ${checked}`);
    let mesg = (
      <span>
        Are you sure you wish to change {this.props.data.Name} active state to{" "}
        {checked ? "enabled" : "disabled"}?
      </span>
    )

    const payload = {
      userAccountId: this.props.data.UserAccountId,
      isActive: checked,
    }

    this.setState({
      alert: (
        <SweetAlert
          title="Modify Status"
          custom
          showCancel
          customIcon={questionIcon}
          confirmBtnText="Yes, Change!"
          confirmBtnBsStyle="success"
          cancelBtnBsStyle="default"
          onConfirm={() => {
            this.props.postUserIsActive(payload)
            this.hideAlert()
          }}
          onCancel={() => this.hideAlert()}
        >
          {mesg}
        </SweetAlert>
      ),
    })
  }

  onRoleChange(checked) {
    //console.log(`role switch to ${checked}`);

    let mesg = (
      <span>
        Are you sure you wish to change {this.props.data.Name} role to{" "}
        {checked ? "administrator" : "worker"}?
      </span>
    )

    const payload = {
      userAccountId: this.props.data.UserAccountId,
      isAdmin: checked,
    }

    this.setState({
      alert: (
        <SweetAlert
          title="Modify Role"
          custom
          showCancel
          customIcon={questionIcon}
          confirmBtnText="Yes, Change!"
          confirmBtnBsStyle="success"
          cancelBtnBsStyle="default"
          onConfirm={() => {
            this.props.postUserRoleType(payload)
            this.hideAlert()
          }}
          onCancel={() => this.hideAlert()}
        >
          {mesg}
        </SweetAlert>
      ),
    })
  }

  onSetupEmailSubmit = data => {
    const payload = {
      userAccountId: this.props.data.UserAccountId,
      setupEmail: data.setupEmail,
    }
    this.props.postUserSetupEmail(payload)
  }

  render() {
    const className = "authentication - info"

    if (this.props.data === null) {
      return (
        <div className={className}>
          <Icon spin size="2x" name="spinner" /> Loading...
        </div>
      )
    }

    const { SetupEmail, IsAdmin, IsActive, IsRegistered } = this.props.data

    return (
      <div className={className}>
        {this.state.alert}

        <Formsy onSubmit={this.onSetupEmailSubmit}>
          <Input
            name="setupEmail"
            id="setupEmail"
            label="Email"
            value={SetupEmail || ""}
            validations="isEmail"
            validationErrors={{
              isEmail: "Invalid, please use email@domain.com format.",
            }}
            disabled={IsRegistered || this.props.disabled}
            required
          />
          {!IsRegistered && (
            <Button disabled={!this.props.isAdmin} type="submit">
              Save Email
            </Button>
          )}
        </Formsy>

        <Formsy>
          <Row>
            <label className="control-label col-sm-3">Role</label>
            <Col sm={9}>
              <Switch
                checkedChildren="Admin"
                unCheckedChildren="Worker"
                checked={IsAdmin}
                onChange={this.onRoleChange}
                disabled={this.props.isSelf || !this.props.isAdmin}
              />
            </Col>
          </Row>
        </Formsy>

        <Formsy>
          <Row>
            <label className="control-label col-sm-3">Active</label>
            <Col sm={9}>
              <Switch
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
                checked={IsActive}
                onChange={this.onActiveChange}
                disabled={this.props.isSelf || !this.props.isAdmin}
              />
            </Col>
          </Row>
        </Formsy>
      </div>
    )
  }
}

AuthenticationInfo.propTypes = propTypes
AuthenticationInfo.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(AuthenticationInfo)
