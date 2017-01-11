import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import moment from "moment"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import Label from "react-bootstrap/lib/Label"
import { Link } from "react-router-dom"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"
import { Scrollbars } from "react-custom-scrollbars"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import * as api from "../../../constants/api"
import MomentFormatter from "../../MomentFormatter"
import JobFriendlyName from "../../jobs/JobFriendlyName"

const propTypes = {
  config: PropTypes.object.isRequired,
  autoHeightMax: PropTypes.number,
}

const defaultProps = {
  config: {},
  autoHeightMax: 300,
}

export default class CorrectiveActionsWidget extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false,
      data: {
        TotalCount: 0,
        Jobs: [],
      },
    }
  }

  componentDidMount() {
    this.getData()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      this.getData(nextProps.config)
    }
  }

  getData = config => {
    if (config === undefined) {
      config = this.props.config
    }

    if (
      this.state.isFetching ||
      config === null ||
      config.activeNode.activeSite === undefined
    ) {
      return
    }

    this.setState({ isFetching: true })

    let dtStart = moment(config.startDate).format("MM/DD/YYYY"),
      dtEnd = moment(config.endDate).format("MM/DD/YYYY")

    const url = `${api.CORRECTIVE_ACTION_JOBS_DASHBOARD_WIDGET}`

    config.auth
      .request("get", url)
      .query({ accountSiteId: config.activeNode.activeSite.value })
      .query({ beginDate: dtStart })
      .query({ endDate: dtEnd })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({ data: response.body })
          } else {
            console.log("failed to get open corrective action job stats")
          }
        },
        () => {
          console.log("failed to get open corrective action job stats")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

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
        <Link to={`/jobs/${row.JobId}`}>{linkText}</Link>
      </OverlayTrigger>
    )
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

    const schDateCurrent = row.ActiveVendorScheduledDateCurrent
    const schDatePast = row.ActiveVendorScheduledDatePast
    const touched = row.VendorStarted || row.ActiveVendorFinalizedDate !== null

    const lateToolTip = (
      <Tooltip id="lateToolTip">
        {touched
          ? row.ActiveVendorFinalizedDate === null
            ? `Subcontractor late but job has started`
            : `Subcontractor was late to start job`
          : `Subcontractor late and job has not started, Vitralogy investigation needed`}
      </Tooltip>
    )

    var lateFormatter = (
      <OverlayTrigger overlay={lateToolTip} placement="top">
        <span>
          {row.ActiveVendorFinalizedDate === null && (
            <Icon name="exclamation-triangle" />
          )}{" "}
          <MomentFormatter
            datetime={cell}
            formatter="MM/DD/YYYY h:mm A"
            timezone={row.SiteTimeZoneShortName}
          />
        </span>
      </OverlayTrigger>
    )

    var formatDate = schDatePast ? (
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
          schDatePast && !touched
            ? "issue"
            : schDatePast || schDateCurrent
            ? "minor-issue"
            : "no-issue"
        }
      >
        {formatDate}
      </span>
    )

    return formatter
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

    return friendlyName
  }

  statusFormatter = (cell, row) => {
    var style = "info"
    var icon = ""
    var status = "New"
    var formatter = <p />
    switch (Number(cell)) {
      case api.STATUS_ITEM.IN_PROGRESS:
        style = "success"
        icon = "briefcase"
        status = "In Progress"
        break
      case api.STATUS_ITEM.ON_HOLD:
        style = "warning"
        icon = "hand-paper-o"
        status = "On Hold"
        break
      case api.STATUS_ITEM.COMPLETED:
        style = "primary"
        icon = "check"
        status = "Completed"
        break
      case api.STATUS_ITEM.CANCELED:
        style = "danger"
        icon = "ban"
        status = "Canceled"
        break
      case api.STATUS_ITEM.NEW:
      default:
        style = "info"
        icon = "play"
        status = "New"
        break
    }

    formatter = (
      <Label bsStyle={style}>
        {" "}
        <Icon name={icon} />
        &nbsp;{status}{" "}
      </Label>
    )
    return formatter
  }

  completedFormatter = (cell, row) => {
    if (cell === null) {
      return <span>{cell}</span>
    }

    const toolTip = (
      <Tooltip id="signOffToolTip">{`Signed off by ${
        row.ActiveVendorFinalizedBy
      }`}</Tooltip>
    )

    var formatDate = (
      <MomentFormatter
        datetime={cell}
        formatter="MM/DD/YYYY h:mm A"
        timezone={row.SiteTimeZoneShortName}
      />
    )

    var formatter = (
      <OverlayTrigger overlay={toolTip} placement="top">
        <span>{formatDate}</span>
      </OverlayTrigger>
    )

    return formatter
  }

  render() {
    const className = "corrective-actions-widget"
    const options = {
      hideSizePerPage: true,
      noDataText: "No data available",
    }
    const scrollStyle = {
      width: "100%",
    }

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching data...
        </Alert>
      )
    }

    if (this.state.data.TotalCount === 0 || this.state.data.Jobs.length === 0) {
      const msg = <div>No active corrective jobs for specified interval.</div>
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No active corrective jobs scheduled!`}
            message={msg}
          />
        </div>
      )
    }

    return (
      <div className={className}>
        <Scrollbars
          style={scrollStyle}
          autoHeight
          autoHeightMin={45}
          autoHeightMax={this.props.autoHeightMax}
        >
          <BootstrapTable
            data={this.state.data.Jobs}
            options={options}
            striped
            hover
            condensed
            trClassName="break-word"
          >
            <TableHeaderColumn dataField="JobId" isKey={true} hidden>
              Job ID
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="JobNumber"
              dataAlign="center"
              dataFormat={this.jobLinkFormatter}
              width="10%"
            >
              Job #
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="StatusId"
              dataFormat={this.statusFormatter}
              width="10%"
              dataAlign="center"
            >
              Status
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="AStep_Name"
              width="15%"
              dataFormat={this.correctiveFormatter}
              dataAlign="center"
            >
              Type
            </TableHeaderColumn>
            <TableHeaderColumn dataField="AStep_ShortName" hidden>
              AStep_ShortName
            </TableHeaderColumn>
            <TableHeaderColumn dataField="ASiteAStep_ShortName" hidden>
              ASiteAStep_ShortName
            </TableHeaderColumn>
            <TableHeaderColumn dataField="AStep_Description" hidden>
              AStep_Description
            </TableHeaderColumn>
            <TableHeaderColumn dataField="ASiteAStep_Description" hidden>
              ASiteAStep_Description
            </TableHeaderColumn>
            <TableHeaderColumn dataField="IsCorrectiveAction" hidden>
              IsCorrectiveAction
            </TableHeaderColumn>
            <TableHeaderColumn dataField="PriorityId" hidden>
              PriorityId
            </TableHeaderColumn>
            <TableHeaderColumn dataField="IsCorrectiveAction" hidden>
              IsCorrectiveAction
            </TableHeaderColumn>
            <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
              SiteTimeZoneShortName
            </TableHeaderColumn>
            <TableHeaderColumn dataField="ActiveVendor" dataAlign="center">
              Service Provider
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="ActiveVendorScheduledDate"
              dataAlign="center"
              dataFormat={this.scheduleFormatter}
            >
              Scheduled Date
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="ActiveVendorFinalizedDate"
              dataFormat={this.completedFormatter}
              dataAlign="center"
            >
              Date Completed
            </TableHeaderColumn>
          </BootstrapTable>
        </Scrollbars>
      </div>
    )
  }
}

CorrectiveActionsWidget.propTypes = propTypes
CorrectiveActionsWidget.defaultProps = defaultProps
