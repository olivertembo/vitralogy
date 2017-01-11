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
import { userPreferencesRequest } from "../../actions/prefs"
import { changeJobPage } from "../../actions/jobFilters"
import JobDashboardFilterContainer from "./JobDashboardFilterContainer"
import JobFriendlyName from "./JobFriendlyName"
import NoJobsContainer from "../../containers/NoJobsContainer"
import { format } from "../../utils/datetime"
import MomentFormatter from "../MomentFormatter"

require("../../utils/UserPrefsHelper")

const statusOptions = {
  New: "New",
  "In Progress": "In Progress",
  "On Hold": "On Hold",
  Completed: "Completed",
  Canceled: "Canceled",
}

const propTypes = {
  auth: PropTypes.object,
  _jobs: PropTypes.object.isRequired,
  pageSize: PropTypes.number,
}

const defaultProps = {
  auth: {},
  pageSize: 15,
}

const getState = state => {
  return {
    _prefs: { ...state.prefs },
    _jobs: { ...state.jobFilters },
  }
}

const getActions = dispatch => {
  return {
    userPreferencesRequest: () => dispatch(userPreferencesRequest()),
    changeJobPage: page => dispatch(changeJobPage(page)),
  }
}

class JobDashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showFilterOverlay: false,
    }
  }

  componentDidMount() {
    if (this.props._prefs.isLoadingPrefs === false) {
      this.props.userPreferencesRequest(true)
    }
  }

  jobLinkFormatter = (cell, row) => {
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
        <Link to={`/jobs/${row.JobId}`}>{linkText}</Link>
      </OverlayTrigger>
    )
  }

  siteLinkFormatter = (cell, row) => {
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

  vendorLinkFormatter = (cell, row) => {
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

  etaFormatter = (cell, row) => {
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
      (this.props._jobs.activeFilterButton === api.JOB_FILTERS.ACTIVE ||
        this.props._jobs.activeFilterButton === api.JOB_FILTERS.UPCOMING)

    const lateToolTip = (
      <Tooltip id="lateToolTip">
        {this.props._jobs.activeFilterButton === api.JOB_FILTERS.UPCOMING
          ? `Upcoming job will miss ETA, Vitralogy investigation needed`
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

  scheduleFormatter = (cell, row) => {
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
      this.props._jobs.activeFilterButton === api.JOB_FILTERS.ACTIVE
    const schDateAfterCurrDate =
      row.SchDateAfterCurrDate &&
      this.props._jobs.activeFilterButton === api.JOB_FILTERS.ACTIVE

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

  statusFormatter = (cell, row) => {
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

  progressFormatter = (cell, row) => {
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

  correctiveFormatter = (cell, row) => {
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

  formatProgress = activeFilterButton => {
    var format = "Loading Jobs..."
    switch (activeFilterButton) {
      case api.JOB_FILTERS.ACTIVE:
        format = "Loading Active Jobs..."
        break
      case api.JOB_FILTERS.CANCELED:
        format = "Loading Canceled Jobs..."
        break
      case api.JOB_FILTERS.COMPLETED:
        format = "Loading Completed Jobs..."
        break
      case api.JOB_FILTERS.UPCOMING:
        format = "Loading Upcoming Jobs..."
        break
      case api.JOB_FILTERS.PENDING_DATA_ENTRY:
        format = "Loading Pending Data Entry Jobs..."
        break
      default:
        break
    }

    return format
  }

  onPageChange = (page, sizePerPage) => {
    this.props.changeJobPage(page)
  }

  renderPaginationShowsTotal = (start, to, total) => {
    return (
      <p style={{ color: "#337ab7" }}>
        Jobs {start} to {to} of {total}
      </p>
    )
  }

  toggleFilterOverlay = showFilterOverlay => {
    this.setState({ showFilterOverlay })
  }

  resourceFormatter = (cell, row) => {
    const placeholder = <span className="placeholder">N/A</span>
    if (row.ResourceSupportModeId !== api.RESOURCE_SUPPORT_MODE.CONTAINER) {
      const resources = cell.join(", ")
      return <span>{resources || placeholder}</span>
    } else {
      if (row.IsResourceGroupEnabled) {
        return (
          <span>
            <ToolTip
              placement="bottom"
              title={`${row.ResourceGroupTypeName || "Unknown"} Resource Group`}
              mouseEnterDelay={0.5}
            >
              <Icon name="cube" />
              {` (${row.ResourceGroupItemCount}) ${row.ResourceGroupTypeName ||
                "Unknown"}`}
            </ToolTip>
          </span>
        )
      } else {
        // no resources for container
        return placeholder
      }
    }
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
    } = this.props._jobs
    const loadMessage = this.formatProgress(activeFilterButton)

    const options = {
      hideSizePerPage: true,
      noDataText: (
        <NoJobsContainer toggleFilterOverlay={this.toggleFilterOverlay} />
      ),
      paginationShowsTotal: this.renderPaginationShowsTotal,
      sizePerPage: pageSize,
      onPageChange: this.onPageChange.bind(this),
      page: pageNumber,
    }

    return (
      <div className={className}>
        <div className="table-with-filters">
          <JobDashboardFilterContainer
            showFilterOverlay={this.state.showFilterOverlay}
            toggleFilterOverlay={this.toggleFilterOverlay}
          />

          {jobsIsLoading && (
            <div className="data">
              <div className="loading">
                <Icon spin size="5x" name="spinner" />
                &nbsp;
                {loadMessage}
              </div>
            </div>
          )}

          {jobsHasErrored && !jobsIsLoading && (
            <div className="data">
              <div className="loading">
                <Icon size="5x" name="exclamation-triangle" />
                &nbsp;{"Unable to load jobs, contact support"}
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
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="JobId"
                isKey={true}
                hidden
              >
                Job ID
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="JobNumber"
                dataAlign="center"
                dataFormat={this.jobLinkFormatter}
                width="8%"
              >
                Job #
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="ActivityStep"
                width="10%"
                dataFormat={this.correctiveFormatter}
                dataAlign="center"
              >
                Type
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="IsCorrectiveAction"
                hidden
              >
                Type
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="SiteName"
                dataFormat={this.siteLinkFormatter}
                width="15%"
                dataAlign="center"
              >
                Site
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="SiteAddress"
                hidden
              >
                Address
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="IsGeoCodingNeeded"
                hidden
              >
                IsGeoCodingNeeded
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="Latitude"
                hidden
              >
                Latitude
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="Longitude"
                hidden
              >
                Longitude
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="GeoCodingUpdatedOn"
                hidden
              >
                GeoCodingUpdatedOn
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="EtaDateTimeZoneOffset"
                hidden
              >
                EtaDateTimeZoneOffset
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="NumOfMinSchDatePastEta"
                hidden
              >
                NumOfMinSchDatePastEta
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="SchDateAfterEta"
                hidden
              >
                SchDateAfterEta
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="NumOfMinSchDatePastCurrDate"
                hidden
              >
                NumOfMinSchDatePastCurrDate
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="SchDateAfterCurrDate"
                hidden
              >
                SchDateAfterCurrDate
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="NumOfMinEtaPastCurrDate"
                hidden
              >
                NumOfMinEtaPastCurrDate
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="EtaAfterCurrDate"
                hidden
              >
                EtaAfterCurrDate
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="Resources"
                dataFormat={this.resourceFormatter}
                dataAlign="center"
              >
                Resource(s)
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="CustomerEtaDate"
                dataFormat={this.etaFormatter}
                width="15%"
                dataAlign="center"
              >
                ETA Date
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="Status"
                hidden={
                  activeFilterButton === api.JOB_FILTERS.CANCELED ||
                  activeFilterButton === api.JOB_FILTERS.UPCOMING ||
                  activeFilterButton === api.JOB_FILTERS.COMPLETED ||
                  activeFilterButton === api.JOB_FILTERS.PENDING_DATA_ENTRY
                }
                formatExtraData={statusOptions}
                dataFormat={this.statusFormatter}
                width="10%"
                dataAlign="center"
              >
                Status
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="StatusId"
                hidden
              >
                StatusId
              </TableHeaderColumn>
              <TableHeaderColumn row="0" rowSpan="2" dataField="Reason" hidden>
                Reason
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="ReasonId"
                hidden
              >
                ReasonId
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                rowSpan="2"
                dataField="SiteTimeZoneShortName"
                hidden
              >
                SiteTimeZoneShortName
              </TableHeaderColumn>
              <TableHeaderColumn
                row="0"
                colSpan={
                  activeFilterButton === api.JOB_FILTERS.CANCELED ||
                  activeFilterButton === api.JOB_FILTERS.UPCOMING ||
                  activeFilterButton === api.JOB_FILTERS.PENDING_DATA_ENTRY
                    ? 2
                    : 3
                }
                dataAlign="center"
              >
                Active Subcontractor
              </TableHeaderColumn>
              <TableHeaderColumn
                row="1"
                dataField="ActiveVendor"
                dataFormat={this.vendorLinkFormatter}
                dataAlign="center"
              >
                Subcontractor
              </TableHeaderColumn>
              <TableHeaderColumn
                row="1"
                dataField="ActiveVendorScheduledDate"
                dataFormat={this.scheduleFormatter}
                dataAlign="center"
              >
                Scheduled On
              </TableHeaderColumn>
              <TableHeaderColumn
                row="1"
                dataField="ActiveVendorVendorProgress"
                hidden={
                  activeFilterButton === api.JOB_FILTERS.CANCELED ||
                  activeFilterButton === api.JOB_FILTERS.UPCOMING ||
                  activeFilterButton === api.JOB_FILTERS.PENDING_DATA_ENTRY
                }
                dataAlign="center"
                dataFormat={this.progressFormatter}
              >
                Progress
              </TableHeaderColumn>
              <TableHeaderColumn
                row="1"
                dataField="ActiveVendorProgressId"
                hidden
              >
                ProgressId
              </TableHeaderColumn>
              <TableHeaderColumn
                row="1"
                dataField="ActiveVendorFinalizedDate"
                hidden
              >
                ActiveVendorFinalizedDate
              </TableHeaderColumn>
              <TableHeaderColumn
                row="1"
                dataField="ActiveVendorFinalizedBy"
                hidden
              >
                ActiveVendorFinalizedBy
              </TableHeaderColumn>
              <TableHeaderColumn
                row="1"
                dataField="ActiveVendorAccountId"
                hidden
              >
                VendorId
              </TableHeaderColumn>
              <TableHeaderColumn row="1" dataField="IsActivityStarted" hidden>
                IsActivityStarted
              </TableHeaderColumn>
            </BootstrapTable>
          )}
        </div>
      </div>
    )
  }
}

JobDashboard.propTypes = propTypes
JobDashboard.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(JobDashboard)
