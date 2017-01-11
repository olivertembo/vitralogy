import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import moment from "moment"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
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

export default class ProjectServicesWidget extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: false,
      data: {
        TotalCount: 0,
        Projects: [],
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

    const url = `${api.SERVICE_PROJECTS_DASHBOARD_WIDGET}`

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
            this.setState({
              data: response.body,
            })
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

  closeOnFormatter = (cell, row) => {
    if (cell === null) {
      return <span className="no-issue">---</span>
    }

    var formatDate = (
      <MomentFormatter
        datetime={cell}
        formatter="MM/DD/YYYY h:mm A"
        timezone={row.SiteTimeZoneShortName}
      />
    )
    var formatter = <span className="no-issue">{formatDate}</span>

    return formatter
  }

  projectEtaFormatter = (cell, row) => {
    if (cell === null) {
      return <span className="no-issue">---</span>
    }

    var formatDate = (
      <MomentFormatter
        datetime={cell}
        formatter="MM/DD/YYYY h:mm A"
        timezone={row.SiteTimeZoneShortName}
      />
    )
    var formatter = <span className="no-issue">{formatDate}</span>

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

    const schDateCurrent = row.CurrentAStepScheduledDatePast
    const schDatePast = row.CurrentAStepScheduledDatePast
    const touched = row.CurrentAStepStarted

    const lateToolTip = (
      <Tooltip id="lateToolTip">
        {touched
          ? `Subcontractor late but active job has started`
          : `Subcontractor late and active job has not started, Vitralogy investigation needed`}
      </Tooltip>
    )

    var lateFormatter = (
      <OverlayTrigger overlay={lateToolTip} placement="top">
        <span>
          {!row.CurrentAStepStarted && <Icon name="exclamation-triangle" />}{" "}
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
        name={row.CurrentAStepName}
        shortName={row.CurrentAStepShortName}
        siteShortName={row.CurrentASiteAStep_ShortName}
        description={row.CurrentAStepDescription}
        siteDescription={row.CurrentASiteAStep_Description}
      />
    )

    const toolTip = (
      <Tooltip id="correctiveToolTip">{`Corrective Action Job`}</Tooltip>
    )

    const formatter = row.CurrentAStepIsCorrectiveAction ? (
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
    const className = "project-services-widget"
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

    if (
      this.state.data.TotalCount === 0 ||
      this.state.data.Projects.length === 0
    ) {
      const msg = <div>No projects for specified interval.</div>
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No project services!`}
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
            data={this.state.data.Projects}
            options={options}
            striped
            hover
            condensed
            trClassName="break-word"
          >
            <TableHeaderColumn dataField="ProjectId" isKey={true} hidden>
              Project ID
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="Project"
              dataAlign="center"
              //width="10%"
            >
              Service
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="ClosedOn"
              dataFormat={this.closeOnFormatter}
              dataAlign="center"
            >
              Last Completed
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="CurrentOn"
              dataFormat={this.projectEtaFormatter}
              dataAlign="center"
            >
              Latest Active
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="CurrentAStepName"
              //width="15%"
              dataFormat={this.correctiveFormatter}
              dataAlign="center"
            >
              Active Job
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CurrentAStepShortName" hidden>
              CurrentAStepShortName
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CurrentASiteAStep_ShortName" hidden>
              CurrentASiteAStep_ShortName
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CurrentAStepDescription" hidden>
              CurrentAStepDescription
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CurrentASiteAStep_Description" hidden>
              CurrentASiteAStep_Description
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="CurrentAStepIsCorrectiveAction"
              hidden
            >
              CurrentAStepIsCorrectiveAction
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CurrentAStepPriorityId" hidden>
              CurrentAStepPriorityId
            </TableHeaderColumn>
            <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
              SiteTimeZoneShortName
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="CurrentAStepScheduledDate"
              dataFormat={this.scheduleFormatter}
              dataAlign="center"
            >
              Scheduled Date
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="CurrentAStepScheduledDateCurrent"
              hidden
            >
              CurrentAStepScheduledDateCurrent
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CurrentAStepScheduledDatePast" hidden>
              CurrentAStepScheduledDatePast
            </TableHeaderColumn>
            <TableHeaderColumn dataField="CurrentAStepStarted" hidden>
              CurrentAStepStarted
            </TableHeaderColumn>
          </BootstrapTable>
        </Scrollbars>
      </div>
    )
  }
}

ProjectServicesWidget.propTypes = propTypes
ProjectServicesWidget.defaultProps = defaultProps
