import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Icon from "react-fa/lib/Icon"

import Overview from "./Overview"
import DataPanels from "./DataPanels"
import * as api from "../../constants/api"
import ToastHelper from "../../utils/ToastHelper"
import { getSiteDetails, clearSiteDetails } from "../../actions/site"

const propTypes = {
  auth: PropTypes.object,
  params: PropTypes.object,
}

const defaultProps = {
  auth: {},
  params: {},
}

const getState = state => {
  return {
    _site: {
      ...state.site,
    },
  }
}

const getActions = dispatch => {
  return {
    getSiteDetails: siteId => dispatch(getSiteDetails(siteId)),
    clearSiteDetails: () => dispatch(clearSiteDetails()),
  }
}

class SiteDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showOverview: true,
    }

    this.toggleOverview = this.toggleOverview.bind(this)
  }

  get displayName() {
    return "SiteDetail"
  }

  componentDidMount() {
    this.props.clearSiteDetails()

    if (
      this.props._site.details === undefined ||
      this.props._site.details === null ||
      Object.keys(this.props._site.details).length === 0
    ) {
      this.props.getSiteDetails(Number(this.props.match.params.id))
    }

    if (window.innerWidth < 992) {
      this.setState({ showOverview: false })
    }
  }

  componentWillUnmount() {
    this.props.clearSiteDetails()
  }

  toggleOverview() {
    this.setState({
      showOverview: !this.state.showOverview,
    })
  }

  render() {
    if (this.props._site.isLoadingDetails) {
      return (
        <div className="job-detail">
          <div className="loading">
            <Icon spin size="5x" name="spinner" />
            &nbsp;Loading Site Details...
          </div>
        </div>
      )
    }

    const props = {
      auth: this.props.auth,
      id: Number(this.props.match.params.id),
      data: this.props._site,
    }

    return (
      <div
        className={`job-detail job-detail--with-sidebar${
          this.state.showOverview ? " toggled" : ""
        }`}
      >
        <Overview {...props} toggleOverview={this.toggleOverview} />

        <DataPanels {...props} />
      </div>
    )
  }
}

SiteDetail.propTypes = propTypes
SiteDetail.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(SiteDetail)
