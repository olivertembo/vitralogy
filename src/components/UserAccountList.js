import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Icon from "react-fa/lib/Icon"
import List from "antd/lib/list"
import Alert from "antd/lib/alert"
import Card from "antd/lib/card"
import Avatar from "antd/lib/avatar"
import ReactGA from "react-ga"
import {
  userAccountsRequest,
  userAccountLoginRequest,
  licenseAgreementCheckRequest,
} from "../actions/userAccounts"
import LicenseAgreementContainer from "../containers/LicenseAgreementContainer"
import * as api from "../constants/api"

const propTypes = {
  auth: PropTypes.object,
  licenseAgreementCheckRequest: PropTypes.func.isRequired,
  userAccountsRequest: PropTypes.func.isRequired,
  userAccountLoginRequest: PropTypes.func.isRequired,
  checkingLicenseAgreement: PropTypes.bool.isRequired,
  userAccounts: PropTypes.array,
  isLoading: PropTypes.bool.isRequired,
  isLoggingIn: PropTypes.bool.isRequired,
  hasError: PropTypes.bool.isRequired,
  licenseAccepted: PropTypes.bool.isRequired,
  licenseAgreement: PropTypes.object,
}

const defaultProps = {
  auth: {},
  userAccounts: [],
}

class UserAccountList extends React.Component {
  constructor(props) {
    super(props)

    this.handleAccountClick = this.handleAccountClick.bind(this)
  }

  componentDidMount() {
    // if (this.props.route.switchDashboards === true) {
    //     // Show user account list without auto logging in
    //     this.props.userAccountsRequest(this.props.auth, false)
    // } else {
    this.props.licenseAgreementCheckRequest(this.props.auth)
    // }
  }

  handleAccountClick(account) {
    this.props.userAccountLoginRequest(
      api.AUTH_ROLES,
      this.props.auth.getToken(),
      account,
      this.props.auth,
    )
  }

  render() {
    const className = "userAccountList"

    if (this.props.checkingLicenseAgreement) {
      let msg = "Checking license acceptance..."
      return (
        <div className="data">
          <div className="loading">
            <Icon spin size="5x" name="spinner" />
            &nbsp;{msg}
          </div>
        </div>
      )
    }

    if (this.props.licenseAccepted === false && this.props.licenseChecked) {
      return (
        <LicenseAgreementContainer
          auth={this.props.auth}
          licenseAgreement={this.props.licenseAgreement}
        />
      )
    }

    if (this.props.hasError) {
      return (
        <div className="data">
          <div className="loading">
            <Icon size="5x" name="exclamation-triangle" />
            &nbsp;
            {
              "Unable to log into your account, Please contact Vitralogy Support."
            }
          </div>
        </div>
      )
    }

    if (this.props.isLoggingIn || this.props.isLoading) {
      let msg = "Loading user accounts..."
      if (this.props.isLoggingIn) {
        msg = " Logging into account..."
      }
      return (
        <div className="data">
          <div className="loading">
            <Icon spin size="5x" name="spinner" />
            &nbsp;{msg}
          </div>
        </div>
      )
    }

    if (this.props.userAccounts.length === 0) {
      return (
        <div>
          <br />
          <span>
            <Icon name="exclamation-triangle" size="5x" /> No user accounts
            found!
          </span>
          <p>Please contact Vitralogy Support to setup your account</p>
        </div>
      )
    }

    return (
      <div className={className}>
        <Alert
          type="info"
          showIcon
          message="Account Selection"
          description={`Please select an account to work with or contact Vitralogy Support to setup your account`}
        />
        <br />
        <List
          grid={{ gutter: 8, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
          itemLayout="horizontal"
          pagination={{
            pageSize: 12,
            hideOnSinglePage: true,
          }}
          dataSource={this.props.userAccounts}
          renderItem={item => (
            <List.Item key={item.UserAccountId}>
              <Card
                hoverable={true}
                onClick={() => {
                  ReactGA.set({ userId: item.UserAccountId })
                  this.handleAccountClick(item)
                }}
                bordered={true}
                active="true"
              >
                <Card.Meta
                  avatar={
                    <Avatar
                      size="large"
                      style={{ backgroundColor: "#87d068" }}
                      icon={"user"}
                    />
                  }
                  title={item.AccountName}
                  description={"Click to select"}
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    ...state.userAccounts,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    userAccountsRequest: authService =>
      dispatch(userAccountsRequest(authService)),
    userAccountLoginRequest: (url, token, account, authService) =>
      dispatch(userAccountLoginRequest(url, token, account, authService)),
    licenseAgreementCheckRequest: authService =>
      dispatch(licenseAgreementCheckRequest(authService)),
  }
}

UserAccountList.propTypes = propTypes
UserAccountList.defaultProps = defaultProps

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserAccountList)
