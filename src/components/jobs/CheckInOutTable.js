import React from "react"
import { Label, Glyphicon, Tooltip, OverlayTrigger } from "react-bootstrap"
import { TableHeaderColumn, BootstrapTable } from "react-bootstrap-table"
import PropTypes from "prop-types"
import Alert from "react-bootstrap/lib/Alert"
import { Icon } from "react-fa"

import * as api from "../../constants/api"
import EmptyStateContainer from "../../containers/EmptyStateContainer"
import { format } from "../../utils/datetime"

const propTypes = {
  jobId: PropTypes.number.isRequired,
  tierId: PropTypes.number.isRequired,
  auth: PropTypes.object,
}

const defaultProps = {
  auth: {},
}

export default class CheckInOutTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: [],
      isFetching: false,
    }

    this.checkInFormatter = this.checkInFormatter.bind(this)
    this.dateFormatter = this.dateFormatter.bind(this)
    this.checkOutFormatter = this.checkOutFormatter.bind(this)
    this.offlineFormatter = this.offlineFormatter.bind(this)
  }

  componentDidMount() {
    this.getIvr()
  }

  getIvr() {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })
    const url = `${api.TIMELOG_ENDPOINT}${this.props.jobId}`

    this.props.auth
      .request("get", url)
      .query({ tierId: this.props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ items: response.body.TimeLogs })
          } else {
            console.log("failed to get checkins/checkouts issuccess = false")
          }
        },
        () => {
          console.log("failed to get checkins/checkouts")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  checkInFormatter(cell, row) {
    const mobileToolTip = (
      <Tooltip id="checkInViaToolTip">
        {row.CheckInIsMobile ? "Check In via mobile" : "Check In via web"}
      </Tooltip>
    )
    const offLineToolTip = (
      <Tooltip id="checkInOffLineToolTip">
        {row.CheckInIsOfflineSync
          ? "Check In occurred without connectivity"
          : "Check In occurred with connectivity"}
      </Tooltip>
    )
    var formatText =
      " " +
      cell +
      " on " +
      `${format(row.CheckInTime, "l LT")} ${row.SiteTimeZoneShortName}`
    if (row.CheckInFor && row.CheckInFor !== cell) {
      formatText += ` for ${row.CheckInFor}`
    }
    return (
      <p>
        <OverlayTrigger placement="left" overlay={mobileToolTip}>
          <Glyphicon glyph={row.CheckInIsMobile ? "phone" : "blackboard"} />
        </OverlayTrigger>
        &nbsp;
        <OverlayTrigger placement="top" overlay={offLineToolTip}>
          <Glyphicon
            glyph={row.CheckInIsOfflineSync ? "cloud-download" : "cloud-upload"}
          />
        </OverlayTrigger>
        {formatText}
      </p>
    )
  }

  checkOutFormatter(cell, row) {
    const mobileToolTip = (
      <Tooltip id="checkOutViaToolTip">
        {row.CheckOutIsMobile ? "Check Out via mobile" : "Check Out via web"}
      </Tooltip>
    )
    const offLineToolTip = (
      <Tooltip id="checkOutOffLineToolTip">
        {row.CheckOutIsOfflineSync
          ? "Check Out occurred without connectivity"
          : "Check Out occurred with connectivity"}
      </Tooltip>
    )
    var formatText = " " + cell
    if (row.CheckOutStatus) {
      formatText +=
        " on " +
        `${format(row.CheckOutTime, "l LT")} ${row.SiteTimeZoneShortName}`
      if (row.CheckOutFor && row.CheckOutFor !== cell) {
        formatText += ` for ${row.CheckOutFor}`
      }

      return (
        <p>
          <OverlayTrigger placement="left" overlay={mobileToolTip}>
            <Glyphicon glyph={row.CheckOutIsMobile ? "phone" : "blackboard"} />
          </OverlayTrigger>
          &nbsp;
          <OverlayTrigger placement="top" overlay={offLineToolTip}>
            <Glyphicon
              glyph={
                row.CheckOutIsOfflineSync ? "cloud-download" : "cloud-upload"
              }
            />
          </OverlayTrigger>
          {formatText}
        </p>
      )
    } else {
      return
    }
  }

  dateFormatter(cell, row) {
    var formatDate = cell
      ? `${format(cell, "l LT")} ${row.SiteTimeZoneShortName}`
      : ""

    return formatDate
  }

  offlineFormatter(cell, row) {
    var style = "info"
    var text = "N/A"

    if (row.CheckOutTime) {
      style = cell == null ? "info" : "warning"
      text = cell == null ? "No" : "Yes"
    }

    return <Label bsStyle={style}> {text} </Label>
  }

  render() {
    const className = "check-in-out-table"
    const options = {
      noDataText: "No check in/out uploaded",
    }

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> {`Fetching Check In's/Out's...`}
        </Alert>
      )
    }

    if (this.state.items === undefined || this.state.items.length === 0) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No check in/out uploaded!`}
            message={`No check in/out submitted by the subcontractor`}
          />
        </div>
      )
    }

    return (
      <div className={className}>
        <BootstrapTable
          data={this.state.items}
          options={options}
          striped
          hover
          condensed
          trClassName="break-word"
        >
          <TableHeaderColumn dataField="Id" isKey={true} hidden>
            CheckIn ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField="JobSourcingTierId" hidden>
            JobSourcingTierId
          </TableHeaderColumn>
          <TableHeaderColumn dataField="SourcingTier" hidden>
            Tier
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Vendor" hidden>
            {" "}
            Subcontractor
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="CheckInBy"
            width="150"
            dataFormat={this.checkInFormatter}
          >
            Check In By
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckInFor" hidden>
            {" "}
            CheckIn For
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckInTime" hidden>
            CheckIn Time
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckInLatitude" hidden>
            CheckIn Latitude
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckInLongitude" hidden>
            CheckIn Longitude
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckInIsMobile" hidden>
            CheckIn Mobile
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckInIsOfflineSync" hidden>
            CheckIn OffLine
          </TableHeaderColumn>
          <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
            SiteTimeZoneShortName
          </TableHeaderColumn>

          <TableHeaderColumn
            dataField="CheckOutBy"
            width="150"
            dataFormat={this.checkOutFormatter}
          >
            Check Out By
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckOutFor" hidden>
            {" "}
            CheckOut For
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckOutTime" hidden>
            CheckOut Time
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckOutLatitude" hidden>
            CheckOut Latitude
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckOutLongitude" hidden>
            CheckOut Longitude
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckOutIsMobile" hidden>
            CheckOut Mobile
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="CheckOutStatus"
            dataAlign="center"
            width="75"
          >
            Check Out Status
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CheckOutIsOfflineSync" hidden>
            CheckOut Offline
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

CheckInOutTable.propTypes = propTypes
CheckInOutTable.defaultProps = defaultProps
