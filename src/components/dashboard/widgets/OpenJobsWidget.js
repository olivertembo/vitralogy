import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import moment from "moment"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
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

export default class OpenJobsWidget extends React.Component {
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

    const url = `${api.OPEN_JOBS_DASHBOARD_WIDGET}`

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
            console.log("failed to get open job stats")
          }
        },
        () => {
          console.log("failed to get open job stats")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  jobLinkFormatter(cell, row) {
    let tipText = `Click to view ${
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
    const touched = row.VendorStarted

    const lateToolTip = (
      <Tooltip id="lateToolTip">
        {touched
          ? `Subcontractor late but job has started`
          : `Subcontractor late and job has not started, Vitralogy investigation needed`}
      </Tooltip>
    )

    var lateFormatter = (
      <OverlayTrigger overlay={lateToolTip} placement="top">
        <span>
          <Icon name="exclamation-triangle" />{" "}
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

  render() {
    const className = "open-jobs-widget"
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
      const msg = <div>No active jobs for specified interval.</div>
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No active jobs scheduled!`}
            message={msg}
          />
        </div>
      )
    }

    return (
      <div className={className}>
        <span className="open-jobs-widget-data">
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
                width="17%"
              >
                Job #
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="AStep_Name"
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
              <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
                SiteTimeZoneShortName
              </TableHeaderColumn>
              <TableHeaderColumn dataField="ActiveVendor" dataAlign="center">
                Service Provider
              </TableHeaderColumn>
              <TableHeaderColumn
                dataField="ActiveVendorScheduledDate"
                dataFormat={this.scheduleFormatter}
                dataAlign="center"
                width="30%"
              >
                Scheduled Date
              </TableHeaderColumn>
            </BootstrapTable>
          </Scrollbars>
        </span>
      </div>
    )
  }
}

OpenJobsWidget.propTypes = propTypes
OpenJobsWidget.defaultProps = defaultProps
