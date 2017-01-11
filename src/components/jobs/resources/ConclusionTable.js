import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import React from "react"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import * as api from "../../constants/api"
import EmptyStateContainer from "../../containers/EmptyStateContainer"
import { format } from "../../utils/datetime"

const propTypes = {
  jobId: PropTypes.number.isRequired,
  auth: PropTypes.object.isRequired,
  tierId: PropTypes.number.isRequired,
  jobResourceId: PropTypes.number.isRequired,
}

const defaultProps = {
  auth: {},
  conclusions: [],
}

export default class ConclusionTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      conclusions: [],
      isFetching: false,
    }

    this.dateFormatter = this.dateFormatter.bind(this)
    this.collectedByFormatter = this.collectedByFormatter.bind(this)
    this.uploadedByFormatter = this.uploadedByFormatter.bind(this)
    this.statusFormatter = this.statusFormatter.bind(this)
  }

  componentDidMount() {
    this.getConclusions()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.resource.JobResourceId != nextProps.resource.JobResourceId) {
      this.getConclusions(nextProps.resource.JobResourceId)
    }
  }

  getConclusions(jobResourceId) {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    if (jobResourceId === undefined) {
      jobResourceId = this.props.resource.JobResourceId
    }

    const url = `${api.CONCLUSION_ENDPOINT}${this.props.jobId}`

    this.props.auth
      .request("get", url)
      .query({ jobResourceId: jobResourceId })
      .query({ tierId: this.props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ conclusions: response.body.Conclusions })
          } else {
            console.log("failed to get results")
          }
        },
        () => {
          console.log("failed to get results")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  uploadedByFormatter(cell, row) {
    const mobileToolTip = (
      <Tooltip id="uploadViaToolTip">
        {row.IsCreatedByMobile ? "Uploaded via mobile" : "Uploaded via web"}
      </Tooltip>
    )
    const offLineToolTip = (
      <Tooltip id="uploadOffLineToolTip">
        {row.IsCreatedByOffLineSync
          ? "Data capture occurred without connectivity"
          : "Data capture occurred with connectivity"}
      </Tooltip>
    )

    var format = " " + cell
    return (
      <p>
        <OverlayTrigger placement="left" overlay={mobileToolTip}>
          <Glyphicon glyph={row.IsCreatedByMobile ? "phone" : "blackboard"} />
        </OverlayTrigger>
        &nbsp;
        <OverlayTrigger placement="top" overlay={offLineToolTip}>
          <Glyphicon
            glyph={
              row.IsCreatedByOffLineSync ? "cloud-download" : "cloud-upload"
            }
          />
        </OverlayTrigger>
        {format}
      </p>
    )
  }

  statusFormatter(cell, row) {
    const toolTip = <Tooltip id="statusToolTip">{row.Comment}</Tooltip>
    var format = " " + cell
    return <p>{format}</p>
  }

  collectedByFormatter(cell, row) {
    var format =
      cell +
      " on " +
      `${format(row.CollectedOn, "l LT")} ${row.SiteTimeZoneShortName}`
    return format
  }

  dateFormatter(cell, row) {
    var formatDate = cell
      ? `${format(cell, "l LT")} ${row.SiteTimeZoneShortName}`
      : ""
    return formatDate
  }

  render() {
    const className = "conclusion-table"
    const emptyTitle = "No resource conclusion!"
    const emptyMesg =
      "Subcontractor has not uploaded a conclusion for this resource at this time."

    const options = {
      noDataText: "No results uploaded",
    }

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />
          Fetching results...
        </Alert>
      )
    }

    if (
      this.state.conclusions === undefined ||
      this.state.conclusions.length === 0
    ) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={emptyTitle}
            message={emptyMesg}
          />
        </div>
      )
    }

    return (
      <div className={className}>
        <BootstrapTable
          data={this.state.conclusions}
          options={options}
          striped
          hover
          condensed
          trClassName="break-word"
        >
          <TableHeaderColumn
            dataField="JobSourcingTierConclusionId"
            isKey={true}
            hidden
          >
            JobSourcingTierConclusionId
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Vendor" hidden>
            Subcontractor
          </TableHeaderColumn>
          <TableHeaderColumn dataField="ResourceType" hidden dataAlign="center">
            Resource Type
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Resource" hidden dataAlign="center">
            Resource
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="ConclusionStatus"
            dataFormat={this.statusFormatter}
            dataAlign="center"
          >
            Status
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Comment">Comment</TableHeaderColumn>
          <TableHeaderColumn
            dataField="CreatedBy"
            width="19%"
            dataFormat={this.uploadedByFormatter}
          >
            Uploaded By
          </TableHeaderColumn>
          <TableHeaderColumn dataField="IsCreatedByMobile" hidden>
            Mobile
          </TableHeaderColumn>
          <TableHeaderColumn dataField="IsCreatedByOffLineSync" hidden>
            OffLine
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="ForUser"
            width="33%"
            dataFormat={this.collectedByFormatter}
          >
            Collected By
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="CollectedOn"
            dataFormat={this.dateFormatter}
            hidden
          >
            Collection On
          </TableHeaderColumn>
          <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
            SiteTimeZoneShortName
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

ConclusionTable.propTypes = propTypes
ConclusionTable.defaultProps = defaultProps
