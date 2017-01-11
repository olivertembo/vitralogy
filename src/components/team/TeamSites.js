import React from "react"
import PropTypes from "prop-types"
import Modal from "react-bootstrap/lib/Modal"
import Icon from "react-fa/lib/Icon"
import Transfer from "antd/lib/transfer"

import * as api from "../../constants/api"
import ToastHelper from "../../utils/ToastHelper"

const propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  selectedUser: PropTypes.object.isRequired,
  auth: PropTypes.object,
}

const defaultProps = {
  auth: {},
}

export default class TeamSites extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      siteOptions: [],
      isLoading: false,
      targetKeys: [],
      siteRestrictions: [],
      selectedKeys: [],
      currentPage: 1,
      pageSize: 100,
      totalDataSize: 0,
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.removeSiteRestrictions = this.removeSiteRestrictions.bind(this)
    this.removeRestriction = this.removeRestriction.bind(this)
    this.addSiteRestrictions = this.addSiteRestrictions.bind(this)
    this.addRestriction = this.addRestriction.bind(this)
  }

  handleChange = (nextTargetKeys, direction, moveKeys) => {
    this.setState({ targetKeys: nextTargetKeys })

    //console.log('Handle Change: ', direction, ' direction');
    //console.log('targetKeys: ', this.state.targetKeys);
    //console.log('moveKeys: ', moveKeys);

    if (direction === "right") {
      this.addSiteRestrictions(moveKeys)
    } else {
      this.removeSiteRestrictions(moveKeys)
    }
  }

  async removeSiteRestrictions(sites) {
    console.log("Remove sites: ", sites, " restrictions")
    const newSiteRestrictions = Object.assign([], this.state.siteRestrictions)

    for (const site of sites) {
      const index = newSiteRestrictions.findIndex(
        x => x.CustomerSiteId === site,
      )
      var opResult = await this.removeRestriction(
        site,
        newSiteRestrictions[index].UserAccountSiteRestrictionId,
      )
      if (opResult) {
        newSiteRestrictions.splice(index, 1)
        //console.log('Site Removed: ', newSiteRestrictions)
      }
    }

    this.setState({
      siteRestrictions: newSiteRestrictions,
    })
  }

  async removeRestriction(site, restrictionId) {
    var opResult = false

    const url = api.SITE_RESTRICTIONS
    console.log("Removing site: ", site)

    await this.props.auth
      .request("delete", url)
      .query({ restrictionId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            opResult = true
          } else {
            ToastHelper.error(response.body.Msg)
          }
        },
        () => {
          ToastHelper.error("Error removing site restriction")
        },
      )

    //console.log('removeRestriction returning ', opResult)
    return opResult
  }

  addSiteRestrictions(sites) {
    console.log("Adding sites: ", JSON.stringify(sites), " restrictions")
    var newSiteRestrictions = this.state.siteRestrictions

    var requests = []
    for (const site of sites) {
      requests.push({
        FakeId: site,
        CustomerSiteId: site,
        UserAccountId: this.props.selectedUser.UserAccountId,
      })
    }

    const url = api.SITE_RESTRICTIONS3
    console.log("Adding sites: ", JSON.stringify(requests))
    this.props.auth
      .request("post", url)
      .send(requests)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            const results = response.body.ResultItems
            if (results !== null) {
              const restrictions = results.map(r => {
                if (r.IsSuccess) {
                  const index = this.state.siteOptions.findIndex(
                    x => x.key === r.FakeId,
                  )
                  const sites = Object.assign([], this.state.siteOptions)

                  return {
                    UserAccountSiteRestrictionId: r.NewId,
                    UserAccountId: this.props.selectedUser.UserAccountId,
                    UserAccountName: this.props.selectedUser.Name,
                    CustomerSiteId: r.FakeId,
                    IsAdmin: this.props.selectedUser.IsAdmin,
                    CustomerSiteName: sites[index].site,
                  }
                }
              })
              newSiteRestrictions.push(...restrictions)
            }
          } else {
            ToastHelper.error(response.body.Msg)
          }
        },
        () => {
          ToastHelper.error("Error adding site restriction")
        },
      )
      .then(() => {
        this.setState({
          siteRestrictions: newSiteRestrictions,
        })
      })
  }

  addRestriction(site) {
    var newSiteRestrictions = {}

    const url = api.SITE_RESTRICTIONS
    console.log("Adding site: ", site)
    this.props.auth
      .request("post", url)
      .query({ accountSiteId: site })
      .query({ userAccountId: this.props.selectedUser.UserAccountId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            newSiteRestrictions.UserAccountSiteRestrictionId =
              response.body.NewId
            newSiteRestrictions.UserAccountId = this.props.selectedUser.UserAccountId
            newSiteRestrictions.UserAccountName = this.props.selectedUser.Name
            newSiteRestrictions.CustomerSiteId = site
            newSiteRestrictions.IsAdmin = this.props.selectedUser.IsAdmin

            const index = this.state.siteOptions.findIndex(x => x.key === site)
            const sites = Object.assign([], this.state.siteOptions)
            newSiteRestrictions.CustomerSiteName = sites[index].site
          } else {
            ToastHelper.error(response.body.Msg)
          }
        },
        () => {
          ToastHelper.error("Error adding site restriction")
        },
      )
      .then(() => {})

    return newSiteRestrictions
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({
      selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys],
    })

    //console.log('sourceSelectedKeys: ', sourceSelectedKeys);
    //console.log('targetSelectedKeys: ', targetSelectedKeys);
  }

  handleScroll = (direction, e) => {
    //console.log('direction:', direction);
    //console.log('target:', e.target);
  }

  componentDidMount() {
    this.getData()
  }

  componentWillReceiveProps(nextProps) {}

  async getData() {
    this.setState({
      isLoading: true,
    })

    const [custSites, siteRes] = await Promise.all([
      this.getCustomerSites(),
      this.getSiteAssignments(),
    ])

    if (custSites.ok && custSites.body.IsSuccess) {
      const siteData = custSites.body.AccountSites.map(item => {
        return {
          key: item.AccountSiteId,
          site: item.Name,
          address: item.Address,
        }
      })

      const targetKeys = []
      const siteRestrictions = siteRes.body.Items
      siteRestrictions.forEach(function(restriction) {
        targetKeys.push(restriction.CustomerSiteId)
      })

      this.setState({
        siteOptions: siteData,
        targetKeys,
        siteRestrictions,
      })

      this.setState({ isLoading: false })
    }
  }

  getCustomerSites() {
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

  getSiteAssignments() {
    const url = api.USER_SITE_RESTRICTIONS

    return new Promise((resolve, reject) => {
      this.props.auth
        .request("get", url)
        .query({ userAccountId: this.props.selectedUser.UserAccountId })
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

  render() {
    const state = this.state

    return (
      <Modal
        backdrop="static"
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <h3>{this.props.selectedUser.Name}</h3>
          <span className="meta">Site Responsibilities</span>
        </Modal.Header>
        <Modal.Body>
          {state.isLoading && (
            <div className="result-msgs">
              <div className="loading">
                <Icon spin size="3x" name="spinner" />
                &nbsp;Loading Site Restrictions...
              </div>
            </div>
          )}

          {!state.isLoading && (
            <Transfer
              dataSource={state.siteOptions}
              titles={["Sites", "Assigned"]}
              listStyle={{
                width: "45%",
                height: 350,
              }}
              // operations={['Assign', 'Un-Assign']}
              showSearch
              targetKeys={state.targetKeys}
              selectedKeys={state.selectedKeys}
              onChange={this.handleChange}
              onSelectChange={this.handleSelectChange}
              onScroll={this.handleScroll}
              render={item => `${item.site}-${item.address}`}
            />
          )}
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    )
  }
}

TeamSites.propTypes = propTypes
TeamSites.defaultProps = defaultProps
