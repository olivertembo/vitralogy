import React from "react"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import Alert from "react-bootstrap/lib/Alert"
import { Icon } from "react-fa"
import PropTypes from "prop-types"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"
import moment from "moment"
import { Link } from "react-router-dom"

import EmptyStateContainer from "../../containers/EmptyStateContainer"
import ToastHelper from "../../utils/ToastHelper"
import * as api from "../../constants/api"
import { format } from "../../utils/datetime"

const propTypes = {
  auth: PropTypes.object,
}

const defaultProps = {
  auth: {},
  sites: [],
}

export default class SiteDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.renderPaginationShowsTotal = this.renderPaginationShowsTotal.bind(this)
    this.addressFormatter = this.addressFormatter.bind(this)
    this.viewLinkFormatter = this.viewLinkFormatter.bind(this)

    this.state = {
      sites: [],
      isLoading: false,
      currentPage: 1,
      pageSize: 18,
      totalDataSize: 0,
    }
  }

  getSites() {
    this.setState({ isLoading: true })

    let url = api.CUSTOMER_SITES

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
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({
              sites: response.body.AccountSites,
              totalDataSize: response.body.TotalCount,
            })
          } else {
            ToastHelper.error(response.body.Msg)
          }
        },
        () => {
          ToastHelper.error("Error retrieving sites")
        },
      )
      .then(() => {
        this.setState({ isLoading: false })
      })
  }

  componentDidMount() {
    this.getSites()
  }

  onPageChange(page, sizePerPage) {
    //console.log("onPageChange page:" + page + " sizePerPage:" + sizePerPage);
    this.setState(
      {
        pageSize: sizePerPage,
        currentPage: page,
      },
      this.getSites,
    )
  }

  renderPaginationShowsTotal(start, to, total) {
    return (
      <p
        style={{
          color: "#337ab7",
        }}
      >
        Sites {start}
        to {to}
        of {total}
      </p>
    )
  }

  viewLinkFormatter(cell, row) {
    const editToolTip = (
      <Tooltip id="editToolTip">{`Click to view ${cell} details`}</Tooltip>
    )
    return (
      <OverlayTrigger overlay={editToolTip} placement="top">
        <Link to={`/sites/${row.AccountSiteId}`}>{cell}</Link>
      </OverlayTrigger>
    )
  }

  addressFormatter(cell, row) {
    const addrToolTip = (
      <Tooltip id="geoToolTip">{`Click to view ${cell} on Google maps`}</Tooltip>
    )

    const geoToolTip = (
      <Tooltip id="geoToolTip">
        {row.IsGeoCoded === false ? (
          `Site requires geocoding, please contact Vitralogy Support to update`
        ) : (
          <ul className="list-unstyled geo-details">
            <li>
              <strong>Coded On&nbsp;:</strong>
              {format(row.GeoCodingUpdatedOn, "MM/DD/YYYY hh:mm A")}
            </li>
            <li>
              <strong>Latitude&nbsp;&nbsp;&nbsp;&nbsp;:</strong>
              {row.Latitude}
            </li>
            <li>
              <strong>Longitude&nbsp;:</strong>
              {row.Longitude}
            </li>
          </ul>
        )}
      </Tooltip>
    )

    const mapsLink = `http://maps.google.com/?q=${cell}`
    const siteFormat = (
      <div>
        <OverlayTrigger overlay={addrToolTip} placement="top">
          <a href={mapsLink} target="_blank">
            {cell}
          </a>
        </OverlayTrigger>
        &nbsp;
        <OverlayTrigger overlay={geoToolTip} placement="top">
          <Icon
            name="globe"
            style={{
              color: row.IsGeoCoded === false ? "red" : "blue",
            }}
          />
        </OverlayTrigger>
      </div>
    )

    return <span>{siteFormat}</span>
  }

  render() {
    const className = "site-dashboard"
    const options = {
      hideSizePerPage: true,
      noDataText: "No sites entered",
      paginationShowsTotal: this.renderPaginationShowsTotal,
      sizePerPage: this.state.pageSize,
      onPageChange: this.onPageChange.bind(this),
      page: this.state.currentPage,
    }

    if (this.state.isLoading) {
      return (
        <div className="job-detail">
          <div className="loading">
            <Icon spin size="5x" name="spinner" />
            &nbsp;Loading Sites...
          </div>
        </div>
      )
    }

    if (this.state.sites === undefined || this.state.sites.length === 0) {
      const msg = <div>Please contact Vitralogy Support to add sites</div>
      let title = `No sites added!`

      return (
        <div className={className}>
          <EmptyStateContainer alertStyle="info" title={title} message={msg} />
        </div>
      )
    }

    return (
      <div className={className}>
        <br />
        <br />{" "}
        {this.state.isLoading === false &&
          this.state.sites !== undefined &&
          this.state.sites.length > 0 && (
            <BootstrapTable
              data={this.state.sites}
              fetchInfo={{
                dataTotalSize: this.state.totalDataSize,
              }}
              striped
              hover
              condensed
              options={options}
              remote
              pagination
            >
              <TableHeaderColumn dataField="AccountSiteId" isKey={true} hidden>
                AccountSiteId
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="Name"
                dataFormat={this.viewLinkFormatter}
              >
                Name
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="Address"
                dataFormat={this.addressFormatter}
              >
                Address
              </TableHeaderColumn>
              <TableHeaderColumn dataField="Latitude" hidden>
                Latitude
              </TableHeaderColumn>
              <TableHeaderColumn dataField="Longitude" hidden>
                Longitude
              </TableHeaderColumn>
              <TableHeaderColumn dataField="IsGeoCoded" hidden>
                IsGeoCoded
              </TableHeaderColumn>
            </BootstrapTable>
          )}
      </div>
    )
  }
}

SiteDashboard.propTypes = propTypes
SiteDashboard.defaultProps = defaultProps
