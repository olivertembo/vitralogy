import React from "react"
import PropTypes from "prop-types"
import moment from "moment"
import Icon from "react-fa/lib/Icon"
import Result from "antd/lib/result"

import DashboardFilter from "./DashboardFilter"
import DashboardPane from "./DashboardPane"
import * as api from "../../constants/api"

const propTypes = {
  auth: PropTypes.object.isRequired,
}

const defaultProps = {
  auth: {},
}

export default class CustomerDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      hasError: false,
      customerSites: [],
      dashboardTree: [],
      config: {
        startDate: moment().startOf("week"),
        endDate: moment().endOf("week"),
        auth: this.props.auth,
        activeNode: {},
      },
      dashboardTypes: [
        {
          Name: "Site Overview",
          Id: 1,
        },
        {
          Name: "Maintenance Rounds",
          Id: 2,
        },
        {
          Name: "Asset Details",
          Id: 3,
        },
        {
          Name: "Critical Date Calendar",
          Id: 4,
        },
        {
          Name: "Critical Date Summary",
          Id: 5,
        },
        {
          Name: "Critical Dates",
          Id: 6,
        },
        {
          Name: "Smart Rounds",
          Id: 7,
        },
      ],
      dashboardTypesLoading: false,
      showOverview: true,
      pageSize: 100000,
      currentPage: 1,
    }
  }

  componentDidMount() {
    this.getData()

    if (window.innerWidth < 992) {
      this.setState({ showOverview: false })
    }
  }

  getSites() {
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

  getDashboardTreeData() {
    const url = api.CUSTOMER_DASHBOARD_TREE

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

  async getData() {
    this.setState({ isLoading: true })

    const [siteList, dashboardTreeData] = await Promise.all([
      this.getSites(),
      this.getDashboardTreeData(),
    ])

    if (
      siteList.ok &&
      siteList.body.IsSuccess &&
      dashboardTreeData.body.IsSuccess
    ) {
      const customerSites = siteList.body.AccountSites
      const dashboardTree = dashboardTreeData.body.Sites

      let newconfig = Object.assign({}, this.state.config)

      if (dashboardTree.length > 0) {
        const selectedSite = dashboardTree[0]

        const activeNode = {
          value: selectedSite.SiteId,
          label: selectedSite.SiteName,
          type: api.DASHBOARD_TREE_NODE.SITE,
          dashboardSelected: selectedSite.Dashboards[0].toString(),
          dashboardsAvailable: selectedSite.Dashboards,
          activeSite: {
            value: selectedSite.SiteId,
            label: selectedSite.SiteName,
            assetTypesDetails: getAssetTypesDetails(selectedSite)
          },
        }

        newconfig = Object.assign({}, this.state.config, {
          activeNode,
        })
      }

      this.setState({
        customerSites,
        dashboardTree,
        isLoading: false,
        config: newconfig,
        hasError: false,
      })
    } else {
      this.setState({
        isLoading: false,
        hasError: true,
      })
    }
  }

  toggleOverview = () => {
    this.setState({ showOverview: !this.state.showOverview })
  }

  onFiltersApplied = filter => {
    //console.log("onFiltersApplied", filter)
    this.setState({
      config: filter,
    })
  }

  render() {
    const {
      hasError,
      isLoading,
      showOverview,
      config,
      dashboardTree,
      dashboardTypes,
      dashboardTypesLoading,
    } = this.state

    if (hasError) {
      return (
        <div className="data">
          <div className="loading">
            <Result
              status="500"
              title="Unable to load customer dashboard"
              subTitle="Fail to retrieve site summary"
            />
          </div>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className="customer-dashboard">
          <div className="loadingMessage">
            <Icon spin size="5x" name="spinner" />
            &nbsp;Loading dashboard...
          </div>
        </div>
      )
    }

    return (
      <div
        className={`sidebar-layout${
          showOverview ? " toggled" : ""
          }`}
      >
        <DashboardFilter
          config={config}
          toggleOverview={this.toggleOverview}
          onFiltersApplied={this.onFiltersApplied}
          dashboardFilter={dashboardTree}
        />

        <DashboardPane
          config={config}
          dashboardTypes={dashboardTypes}
          dashboardTypesLoading={dashboardTypesLoading}
          onFiltersApplied={this.onFiltersApplied}
          largeview={this.state.showOverview}
        />
      </div>
    )
  }
}

CustomerDashboard.propTypes = propTypes
CustomerDashboard.defaultProps = defaultProps

export function getAssetTypesDetails(site) {
  let assetTypesDetails = []

  if (site.AssetTypes) {
    assetTypesDetails = site.AssetTypes.map(a => {
      let assetType = {
        id: a.AssetTypeId,
        assets: []
      }

      if (a.Assets) {
        assetType.assets = a.Assets.map(x => ({ id: x.AssetId, name: x.AssetName }))
      }

      return assetType
    })
  }

  return assetTypesDetails;
}