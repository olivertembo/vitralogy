import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Icon from "react-fa/lib/Icon"

import Overview from "./Overview"
import DataPanels from "./DataPanels"
import * as api from "../../constants/api"
import {
  selectSite,
  clearSiteItems,
  getSiteDetails,
  clearSiteDetails,
} from "../../actions/sites"

const propTypes = {
  auth: PropTypes.object,
  params: PropTypes.object,
}

const defaultProps = {
  auth: {},
  params: {},
}

const getState = state => {
  //console.log('Getting site state: ' + JSON.stringify(state.sites))
  return {
    _site: { ...state.sites },
  }
}

const getActions = dispatch => {
  return {
    selectSite: site => dispatch(selectSite(site)),
    clearSiteItems: () => dispatch(clearSiteItems()),
    getSiteDetails: siteId => dispatch(getSiteDetails(siteId)),
    clearSiteDetails: () => dispatch(clearSiteDetails()),
  }
}

class CustomerDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
      data: {},
      customerSites: [],
      currentPage: 1,
      pageSize: 18,
      totalDataSize: 0,
      showOverview: true,
    }

    this.toggleOverview = this.toggleOverview.bind(this)
    this.onFailedSiteClick = this.onFailedSiteClick.bind(this)
  }

  get displayName() {
    return "CustomerDetail"
  }

  componentDidMount() {
    this.props.selectSite(null)
    this.getData()

    if (window.innerWidth < 992) {
      this.setState({ showOverview: false })
    }
  }

  componentWillReceiveProps(nextProps) {
    //if (nextProps._site.items.length > 0) {
    //    this.setState({ customerSites: nextProps._site.items })
    //}
  }

  componentWillUnmount() {
    this.props.selectSite(null)
    this.props.clearSiteItems()
    this.props.clearSiteDetails()
  }

  onFailedSiteClick(id) {
    if (
      this.props._site.selected === null ||
      this.props._site.selected.value.AccountSiteId !== id
    ) {
      const findSite = this.state.customerSites.filter(
        item => item.AccountSiteId === id,
      )[0]

      const siteItem = { value: findSite, label: findSite.Name }

      this.props.selectSite(siteItem)
    }
  }

  toggleOverview() {
    this.setState({ showOverview: !this.state.showOverview })
  }

  getCustomerData() {
    const url = api.CUSTOMER_DETAILS

    return new Promise((resolve, reject) => {
      this.props.auth.request("get", url).then(
        response => {
          resolve(response)
        },
        failure => {
          reject(failure)
        },
      )
    })
  }

  getSiteData() {
    const url = api.CUSTOMER_SITES

    return new Promise((resolve, reject) => {
      this.props.auth
        .request("post", url)
        .send({
          SearchParameters: {
            SiteName: "",
          },
          PageRequest: {
            PageSize: this.state.pageSize,
            PageNumber: this.state.currentPage,
          },
        })
        .then(
          response => {
            resolve(response)
          },
          failure => {
            reject(failure)
          },
        )
    })
  }

  async getData() {
    this.setState({ isLoading: true })

    const [custDetails, siteList] = await Promise.all([
      this.getCustomerData(),
      this.getSiteData(),
    ])

    if (custDetails.ok && custDetails.body.IsSuccess) {
      const custData = custDetails.body.Details

      this.setState({
        data: custData,
        customerSites: siteList.body.AccountSites,
      })

      this.setState({ isLoading: false })
    }
  }

  render() {
    const props = {
      auth: this.props.auth,
      data: this.state.data,
      customerSites: this.state.customerSites,
    }

    if (this.state.isLoading) {
      return (
        <div className="job-detail">
          <div className="loading">
            <Icon spin size="5x" name="spinner" />
            &nbsp;Loading Customer Details...
          </div>
        </div>
      )
    }

    return (
      <div
        className={`job-detail job-detail--with-sidebar${
          this.state.showOverview ? " toggled" : ""
        }`}
      >
        <Overview
          {...props}
          toggleOverview={this.toggleOverview}
          onSiteClick={this.onFailedSiteClick}
        />

        <DataPanels {...props} />
      </div>
    )
  }
}

CustomerDetail.propTypes = propTypes
CustomerDetail.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(CustomerDetail)
