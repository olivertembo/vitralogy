import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import List from "antd/lib/list"
import Card from "antd/lib/card"
import Avatar from "antd/lib/avatar"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import * as api from "../../../constants/api"

const getState = state => {
  return {
    _site: { ...state.sites },
    _userAccounts: { ...state.userAccounts },
  }
}

const propTypes = {
  auth: PropTypes.object.isRequired,
  _site: PropTypes.object,
}

const defaultProps = {
  auth: {},
}

class SiteRestrictionTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: [],
      isFetching: false,
    }
  }

  componentDidMount() {
    this.getRestrictions()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.site.AccountSiteId !== nextProps.site.AccountSiteId) {
      this.getRestrictions(nextProps.site.AccountSiteId)
    }
  }

  getRestrictions(accountSiteId) {
    if (this.state.isFetching) {
      return
    }

    if (accountSiteId === undefined) {
      accountSiteId = this.props.site.AccountSiteId
    }

    this.setState({ isFetching: true })

    this.props.auth
      .request("get", api.SITE_RESTRICTIONS)
      .query({ accountSiteId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({ items: response.body.Items })
          } else {
            console.log(`failed to get site restictions items`)
          }
        },
        () => {
          console.log(`unknown, failed to get site restrictions items`)
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  render() {
    const className = "resource-items"

    const { _site } = this.props

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching site restrictions...
        </Alert>
      )
    }

    if (_site.isLoadingDetails) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching site info...
        </Alert>
      )
    }

    if (this.state.items === undefined || this.state.items.length === 0) {
      const msg = <div>No site restrictions.</div>
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No site restrictions defined for ${
              _site.selectedDetails.Name
            }!`}
            message={msg}
          />
        </div>
      )
    }

    return (
      <List
        grid={{ gutter: 16, column: 3 }}
        className={className}
        itemLayout="horizontal"
        loading={this.state.isFetching}
        dataSource={this.state.items}
        renderItem={item => (
          <List.Item key={item.UserAccountSiteRestrictionId}>
            <Card>
              <Card.Meta
                avatar={
                  <Avatar
                    size="large"
                    style={{ backgroundColor: "#87d068" }}
                    icon="user"
                  />
                }
                title={item.UserAccountName}
                description={
                  item.IsAdmin ? "Customer Administrator" : "Customer Worker"
                }
              />
            </Card>
          </List.Item>
        )}
      />
    )
  }
}

SiteRestrictionTable.propTypes = propTypes
SiteRestrictionTable.defaultProps = defaultProps

export default connect(getState)(SiteRestrictionTable)
