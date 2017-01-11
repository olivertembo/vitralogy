import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import LicenseAgreement from "../components/LicenseAgreement"
import * as api from "../constants/api"
import {
  licenseAgreementAccepted,
  userAccountsRequest,
} from "../actions/userAccounts"

const propTypes = {
  auth: PropTypes.object,
  licenseAgreement: PropTypes.object.isRequired,
  licenseAgreementAccepted: PropTypes.func.isRequired,
}

const defaultProps = {
  auth: {},
}

const getState = state => {
  return {
    ...state.userAccounts,
  }
}

const getActions = dispatch => {
  return {
    licenseAgreementAccepted: () => dispatch(licenseAgreementAccepted()),
    userAccountsRequest: authService =>
      dispatch(userAccountsRequest(authService)),
  }
}

class LicenseAgreementContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      disableAgree: true,
      isPosting: false,
    }

    this.onAgreeClicked = this.onAgreeClicked.bind(this)
    this.onScrollStop = this.onScrollStop.bind(this)
  }

  onAgreeClicked() {
    this.setState({
      isPosting: true,
      disableAgree: true,
    })

    // Todo put this entire thing in redux action
    const { LicenseAgreementId, RandomKey } = this.props.licenseAgreement

    const data = {
      LicenseAgreementId,
      Key: RandomKey,
      IsMobile: false,
      WebBrowserUserAgentString: navigator.userAgent,
    }

    const url = `${api.LICENSE}/${LicenseAgreementId}/${
      api.LICENSE_AGREE_ENDPOINT
    }`

    this.props.auth
      .request("post", url)
      .send(data)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.props.licenseAgreementAccepted()
            this.props.userAccountsRequest(this.props.auth)
          } else {
            console.log("error with accepting agreement post")
          }
        },
        () => {
          // error
          console.log("error with accepting agreement http request")
        },
      )
      .then(() => {
        this.setState({ isPosting: false })
      })
  }

  onScrollStop(values) {
    const { top } = values

    // This prop hits 1 when fully scrolled down
    if (top > 0.99) {
      this.setState({ disableAgree: false })
    }
  }

  render() {
    return (
      <div className="license-agreement-container">
        <LicenseAgreement
          text={this.props.licenseAgreement.Content}
          onScrollStop={this.onScrollStop}
          disableAgree={this.state.disableAgree}
          onAgreeClicked={this.onAgreeClicked}
          isPosting={this.state.isPosting}
        />
      </div>
    )
  }
}

LicenseAgreementContainer.propTypes = propTypes
LicenseAgreementContainer.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(LicenseAgreementContainer)
