import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import Label from "react-bootstrap/lib/Label"
import { Link } from "react-router-dom"
import Icon from "react-fa/lib/Icon"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"
import { default as ToolTip } from "antd/lib/tooltip"

import * as api from "../../constants/api"
import { changeSupportJobPage } from "../../actions/support"
import SupportDashboardFilterContainer from "./SupportDashboardFilterContainer"
import JobFriendlyName from "../jobs/JobFriendlyName"
import NoJobsContainer from "../../containers/NoJobsContainer"
import { format } from "../../utils/datetime"
import MomentFormatter from "../MomentFormatter"

const statusOptions = {
  New: "New",
  "In Progress": "In Progress",
  "On Hold": "On Hold",
  Completed: "Completed",
  Canceled: "Canceled",
}

const propTypes = {
  auth: PropTypes.object,
  _support: PropTypes.object.isRequired,
  pageSize: PropTypes.number,
}

const defaultProps = {
  auth: {},
  pageSize: 15,
}

const getState = state => {
  return {
    _support: { ...state.support },
  }
}

const getActions = dispatch => {
  return {
    changeSupportJobPage: page => dispatch(changeSupportJobPage(page)),
  }
}

class SupportDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.jobLinkFormatter = this.jobLinkFormatter.bind(this)
    this.siteLinkFormatter = this.siteLinkFormatter.bind(this)
    this.enumFormatter = this.enumFormatter.bind(this)
    this.etaFormatter = this.etaFormatter.bind(this)
    this.scheduleFormatter = this.scheduleFormatter.bind(this)
    this.statusReasonFormatter = this.statusReasonFormatter.bind(this)
    this.statusFormatter = this.statusFormatter.bind(this)
    this.renderPaginationShowsTotal = this.renderPaginationShowsTotal.bind(this)
    this.progressFormatter = this.progressFormatter.bind(this)
    this.correctiveFormatter = this.correctiveFormatter.bind(this)
    this.formatProgress = this.formatProgress.bind(this)
  }

  componentDidMount() {}

  componentWillUnmount() {}

  jobLinkFormatter(cell, row) {
    let tipText = `Click to edit ${
      row.PriorityId === api.JOB_PRIORITY_ITEM.Emergency ? "priority " : ""
    }job# ${cell}`
    let linkText = cell

    if (row.PriorityId === api.JOB_PRIORITY_ITEM.Emergency) {
      linkText = (
        <span>
          {linkText}{" "}
          <span className="issue">
            <Icon name="flag" />
          </span>
        </span>
      )
    }

    const editToolTip = <Tooltip id="editToolTip">{tipText}</Tooltip>

    return (
      <OverlayTrigger overlay={editToolTip} placement="top">
        <Link to={`/support/${row.JobId}`}>{linkText}</Link>
      </OverlayTrigger>
    )
  }

  siteLinkFormatter(cell, row) {
    const addrToolTip = (
      <Tooltip id="geoToolTip">{`Click to view ${
        row.SiteAddress
      } on Google maps`}</Tooltip>
    )

    const geoToolTip = (
      <Tooltip id="geoToolTip">
        {row.IsGeoCodingNeeded === true ? (
          `Site requires geocoding, Vitralogy investigation needed`
        ) : (
          <ul className="list-unstyled geo-details">
            <li>
              <strong>Coded On&nbsp;: </strong>{" "}
              {format(row.GeoCodingUpdatedOn, "MM/DD/YYYY hh:mm A")}
            </li>
            <li>
              <strong>Latitude&nbsp;&nbsp;&nbsp;&nbsp;: </strong> {row.Latitude}{" "}
            </li>
            <li>
              <strong>Longitude&nbsp;: </strong> {row.Longitude}{" "}
            </li>
          </ul>
        )}
      </Tooltip>
    )

    const mapsLink = `http://maps.google.com/?q=${row.SiteAddress}`
    const siteFormat = (
      <div>
        <OverlayTrigger overlay={addrToolTip} placement="top">
          <a href={mapsLink} target="_blank" rel="noopener noreferrer">
            {row.SiteName}
          </a>
        </OverlayTrigger>
        &nbsp;
        <OverlayTrigger overlay={geoToolTip} placement="top">
          <Icon
            name="globe"
            style={{ color: row.IsGeoCodingNeeded ? "red" : "blue" }}
          />
        </OverlayTrigger>
      </div>
    )

    return <span>{siteFormat}</span>
  }

  vendorLinkFormatter(cell, row) {
    const vsToolTip = (
      <Tooltip id="toolTip">{`Vitralogy investigation needed`}</Tooltip>
    )
    var formatter = (
      <OverlayTrigger overlay={vsToolTip} placement="top">
        <div className="issue">
          <Icon name="exclamation-triangle" />
          <span>&nbsp;Not Set</span>
        </div>
      </OverlayTrigger>
    )

    formatter = cell ? cell : formatter
    return formatter
  }

  enumFormatter(cell, row, enumObject) {
    return enumObject[cell]
  }

  statusReasonFormatter(cell, row, enumObject) {
    return `${enumObject[cell]}`
  }

  etaFormatter(cell, row) {
    if (cell === null) {
      return (
        <span className="issue">
          <Icon name="exclamation-triangle" />
          &nbsp;Not Set
        </span>
      )
    }

    const etaAfterCurrDate =
      row.EtaAfterCurrDate &&
      (this.props._support.activeFilterButton === api.JOB_FILTERS.ACTIVE ||
        this.props._support.activeFilterButton === api.JOB_FILTERS.UPCOMING)

    const lateToolTip = (
      <Tooltip id="lateToolTip">
        {this.props._support.activeFilterButton === api.JOB_FILTERS.UPCOMING
          ? `Upcoming support job will miss ETA, Vitralogy investigation needed`
          : `ETA missed, Vitralogy investigation needed`}
      </Tooltip>
    )

    var lateFormatter = (
      <OverlayTrigger overlay={lateToolTip} placement="top">
        <span>
          <Icon name="exclamation-triangle" />
          &nbsp;
          <MomentFormatter
            datetime={cell}
            formatter="MM/DD/YYYY h:mm A"
            timezone={row.SiteTimeZoneShortName}
          />
        </span>
      </OverlayTrigger>
    )

    var formatDate = etaAfterCurrDate ? (
      lateFormatter
    ) : (
      <MomentFormatter
        datetime={cell}
        formatter="MM/DD/YYYY h:mm A"
        timezone={row.SiteTimeZoneShortName}
      />
    )
    var formatter = (
      <span className={etaAfterCurrDate ? "issue" : "no-issue"}>
        {formatDate}
      </span>
    )

    return formatter
  }

  scheduleFormatter(cell, row) {
    if (cell === null) {
      return (
        <span className="issue">
          <Icon name="exclamation-triangle" />
          &nbsp;Not Set
        </span>
      )
    }

    const schDateAfterEta =
      row.SchDateAfterEta &&
      this.props._support.activeFilterButton === api.JOB_FILTERS.ACTIVE
    const schDateAfterCurrDate =
      row.SchDateAfterCurrDate &&
      this.props._support.activeFilterButton === api.JOB_FILTERS.ACTIVE

    const lateToolTip = (
      <Tooltip id="lateToolTip">
        {schDateAfterEta
          ? `Subcontractor schedule date will miss ETA, Vitralogy investigation needed`
          : `Subcontractor late, Vitralogy investigation needed`}
      </Tooltip>
    )

    var lateFormatter = (
      <OverlayTrigger overlay={lateToolTip} placement="top">
        <span>
          <Icon name="exclamation-triangle" />
          &nbsp;
          <MomentFormatter
            datetime={cell}
            formatter="MM/DD/YYYY h:mm A"
            timezone={row.SiteTimeZoneShortName}
          />
        </span>
      </OverlayTrigger>
    )

    var formatDate =
      schDateAfterEta || schDateAfterCurrDate ? (
        lateFormatter
      ) : (
        <MomentFormatter
          datetime={cell}
          formatter="MM/DD/YYYY h:mm A"
          timezone={row.SiteTimeZoneShortName}
        />
      )
    var formatter = (
      <span
        className={
          schDateAfterEta || schDateAfterCurrDate ? "issue" : "no-issue"
        }
      >
        {formatDate}
      </span>
    )

    return formatter
  }

  statusFormatter(cell, row) {
    var style = "info"
    var icon = ""
    var formatter = <p />
    switch (row.StatusId) {
      case api.STATUS_ITEM.IN_PROGRESS:
        style = "success"
        icon = "briefcase"
        break
      case api.STATUS_ITEM.ON_HOLD:
        style = "warning"
        icon = "hand-paper-o"
        break
      case api.STATUS_ITEM.COMPLETED:
        style = "primary"
        icon = "check"
        break
      case api.STATUS_ITEM.CANCELED:
        style = "danger"
        icon = "ban"
        break
      case api.STATUS_ITEM.NEW:
      default:
        style = "info"
        icon = "play"
        break
    }

    formatter = (
      <Label bsStyle={style}>
        {" "}
        <Icon name={icon} />
        &nbsp;{cell}{" "}
      </Label>
    )
    return formatter
  }

  progressFormatter(cell, row) {
    var style = "primary"
    var icon = ""
    let progFormatter = <span />

    if (row.IsActivityStarted && !row.IsComplete) {
      progFormatter = (
        <span>
          <span className="no-issue">
            <ToolTip
              placement="left"
              title={`Work order started by ${row.ActiveVendor} `}
            >
              <Icon name="hand-paper-o" />
            </ToolTip>
          </span>
        </span>
      )
    }

    switch (row.ActiveVendorProgressId) {
      case api.SourcingTierProgressEnum.SIGNED_OFF:
        style = "success"
        icon = "pencil"
        break
      case api.SourcingTierProgressEnum.CHECKED_IN:
        style = "info"
        icon = "sign-in"
        break
      case api.SourcingTierProgressEnum.CHECKED_OUT:
        style = "warning"
        icon = "sign-out"
        break
      case api.SourcingTierProgressEnum.PENDING:
      default:
        style = "primary"
        icon = "hourglass-start"
        break
    }

    if (
      row.ActiveVendorProgressId === api.SourcingTierProgressEnum.SIGNED_OFF
    ) {
      progFormatter = (
        <span>
          {progFormatter}{" "}
          <span>
            <ToolTip
              placement="topRight"
              title={`Signed off on ${format(
                row.ActiveVendorFinalizedDate,
                "l LT",
              )} ${row.SiteTimeZoneShortName} by ${
                row.ActiveVendorFinalizedBy
              }`}
            >
              <Label bsStyle={style}>
                {" "}
                <Icon name={icon} /> {cell}{" "}
              </Label>
            </ToolTip>
          </span>
        </span>
      )
    } else {
      progFormatter = (
        <span>
          {progFormatter}{" "}
          <Label bsStyle={style}>
            {" "}
            <Icon name={icon} /> {cell}{" "}
          </Label>
        </span>
      )
    }

    return progFormatter
  }

  correctiveFormatter(cell, row) {
    const friendlyName = (
      <JobFriendlyName
        name={row.AStep_Name}
        shortName={row.AStep_ShortName}
        siteShortName={row.ASiteAStep_ShortName}
        description={row.AStep_Description}
        siteDescription={row.ASiteAStep_Description}
      />
    )

    const toolTip = (
      <Tooltip id="correctiveToolTip">{`Corrective Action Job`}</Tooltip>
    )

    const formatter = row.IsCorrectiveAction ? (
      <OverlayTrigger overlay={toolTip} placement="top">
        <span className="issue">
          <Icon name="wrench" />
          &nbsp;{friendlyName}
        </span>
      </OverlayTrigger>
    ) : (
      friendlyName
    )

    return formatter
  }

  formatProgress(activeFilterButton) {
    var format = "Loading Support Jobs..."
    switch (activeFilterButton) {
      case api.JOB_FILTERS.ACTIVE:
        format = "Loading Active Support Jobs..."
        break
      case api.JOB_FILTERS.CANCELED:
        format = "Loading Canceled Support Jobs..."
        break
      case api.JOB_FILTERS.COMPLETED:
        format = "Loading Completed Support Jobs..."
        break
      case api.JOB_FILTERS.UPCOMING:
        format = "Loading Upcoming Support Jobs..."
        break
      case api.JOB_FILTERS.PENDING_DATA_ENTRY:
        format = "Loading Pending Data Entry Support Jobs.."
        break
      default:
        break
    }

    return format
  }

  onPageChange(page, sizePerPage) {
    this.props.changeSupportJobPage(page)
  }

  renderPaginationShowsTotal(start, to, total) {
    return (
      <p style={{ color: "#337ab7" }}>
        Support Jobs {start} to {to} of {total}
      </p>
    )
  }

  render() {
    const className = "job-dashboard"
    const {
      pageSize,
      pageNumber,
      jobs,
      jobsIsLoading,
      jobsHasErrored,
      activeFilterButton,
    } = this.props._support
    const loadMessage = this.formatProgress(activeFilterButton)

    const options = {
      hideSizePerPage: true,
      paginationShowsTotal: this.renderPaginationShowsTotal,
      sizePerPage: pageSize,
      onPageChange: this.onPageChange.bind(this),
      page: pageNumber,
      noDataText: <NoJobsContainer supportJobs={true} />,
    }

    return (
      <div className={className}>
        <div className="table-with-filters">
          <SupportDashboardFilterContainer />

          {jobsIsLoading && (
            <div className="data">
              <div className="loading">
                <Icon spin size="5x" name="spinner" />
                &nbsp;{loadMessage}
              </div>
            </div>
          )}

          {jobsHasErrored && !jobsIsLoading && (
            <div className="data">
              <div className="loading">
                <Icon size="5x" name="exclamation-triangle" />
                &nbsp;{"Unable to load support jobs, contact support"}
              </div>
            </div>
          )}

          {!jobsIsLoading && !jobsHasErrored && (
            <BootstrapTable
              data={jobs.Jobs}
              fetchInfo={{ dataTotalSize: jobs.TotalCount }}
              striped
              hover
              condensed
              options={options}
              remote
              pagination
              trClassName="break-word"
            >
              <TableHeaderColumn dataField="JobId" isKey={true} hidden>
                Job ID
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="JobNumber"
                dataAlign="center"
                dataFormat={this.jobLinkFormatter}
                width="8%"
              >
                Job #
              </TableHeaderColumn>
              <TableHeaderColumn dataField="SupportTypeName" width="8%">
                Support Needed
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="ServiceContractName"
                width="15%"
                hidden
              >
                Contract
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="ActivityStep"
                width="10%"
                dataFormat={this.correctiveFormatter}
                dataAlign="center"
              >
                Type
              </TableHeaderColumn>
              <TableHeaderColumn dataField="IsCorrectiveAction" hidden>
                Type
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="SiteName"
                dataFormat={this.siteLinkFormatter}
                width="15%"
                dataAlign="center"
              >
                Site
              </TableHeaderColumn>
              <TableHeaderColumn dataField="SiteAddress" hidden>
                Address
              </TableHeaderColumn>
              <TableHeaderColumn dataField="IsGeoCodingNeeded" hidden>
                IsGeoCodingNeeded
              </TableHeaderColumn>
              <TableHeaderColumn dataField="Latitude" hidden>
                Latitude
              </TableHeaderColumn>
              <TableHeaderColumn dataField="Longitude" hidden>
                Longitude
              </TableHeaderColumn>
              <TableHeaderColumn dataField="GeoCodingUpdatedOn" hidden>
                GeoCodingUpdatedOn
              </TableHeaderColumn>
              <TableHeaderColumn dataField="EtaDateTimeZoneOffset" hidden>
                EtaDateTimeZoneOffset
              </TableHeaderColumn>
              <TableHeaderColumn dataField="NumOfMinSchDatePastEta" hidden>
                NumOfMinSchDatePastEta
              </TableHeaderColumn>
              <TableHeaderColumn dataField="SchDateAfterEta" hidden>
                SchDateAfterEta
              </TableHeaderColumn>
              <TableHeaderColumn dataField="NumOfMinSchDatePastCurrDate" hidden>
                NumOfMinSchDatePastCurrDate
              </TableHeaderColumn>
              <TableHeaderColumn dataField="SchDateAfterCurrDate" hidden>
                SchDateAfterCurrDate
              </TableHeaderColumn>
              <TableHeaderColumn dataField="NumOfMinEtaPastCurrDate" hidden>
                NumOfMinEtaPastCurrDate
              </TableHeaderColumn>
              <TableHeaderColumn dataField="EtaAfterCurrDate" hidden>
                EtaAfterCurrDate
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="CustomerEtaDate"
                dataFormat={this.etaFormatter}
                width="13%"
                dataAlign="center"
              >
                ETA Date
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="Status"
                hidden={
                  activeFilterButton === api.JOB_FILTERS.CANCELED ||
                  activeFilterButton === api.JOB_FILTERS.UPCOMING ||
                  activeFilterButton === api.JOB_FILTERS.COMPLETED
                }
                formatExtraData={statusOptions}
                dataFormat={this.statusFormatter}
                width="5%"
                dataAlign="center"
              >
                Status
              </TableHeaderColumn>
              <TableHeaderColumn dataField="StatusId" hidden>
                StatusId
              </TableHeaderColumn>
              <TableHeaderColumn dataField="Reason" hidden>
                Reason
              </TableHeaderColumn>
              <TableHeaderColumn dataField="ReasonId" hidden>
                ReasonId
              </TableHeaderColumn>
              <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
                SiteTimeZoneShortName
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="ActiveVendorScheduledDate"
                dataFormat={this.scheduleFormatter}
                dataAlign="center"
                width="13%"
              >
                Scheduled On
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="ActiveVendorVendorProgress"
                hidden={
                  activeFilterButton === api.JOB_FILTERS.CANCELED ||
                  activeFilterButton === api.JOB_FILTERS.UPCOMING
                }
                dataAlign="center"
                dataFormat={this.progressFormatter}
                width="7%"
              >
                Progress
              </TableHeaderColumn>
              <TableHeaderColumn dataField="ActiveVendorProgressId" hidden>
                ProgressId
              </TableHeaderColumn>
              <TableHeaderColumn dataField="ActiveVendorFinalizedDate" hidden>
                ActiveVendorFinalizedDate
              </TableHeaderColumn>
              <TableHeaderColumn dataField="ActiveVendorFinalizedBy" hidden>
                ActiveVendorFinalizedBy
              </TableHeaderColumn>
              <TableHeaderColumn dataField="ActiveVendorAccountId" hidden>
                VendorId
              </TableHeaderColumn>
              <TableHeaderColumn dataField="IsActivityStarted" hidden>
                IsActivityStarted
              </TableHeaderColumn>
            </BootstrapTable>
          )}
        </div>
      </div>
    )
  }
}

SupportDashboard.propTypes = propTypes
SupportDashboard.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(SupportDashboard)
