import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import React from "react"

import OverlayButton from "../layout/OverlayButton"
import CorrectiveAction from "./CorrectiveAction"
import * as api from "../../constants/api"
import CorrectiveActionDocumentRow from "./CorrectiveActionDocumentRow"
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
  actions: [],
  documents: [],
}

export default class CorrectiveActionTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      actions: [],
      documents: [],
      isFetching: false,
      showAction: false,
      data: null,
    }

    this.dateFormatter = this.dateFormatter.bind(this)
    this.handleOpenCloseAction = this.handleOpenCloseAction.bind(this)
    this.toggleShowAction = this.toggleShowAction.bind(this)
    this.viewLinkFormatter = this.viewLinkFormatter.bind(this)
    this.isExpandableRow = this.isExpandableRow.bind(this)
    this.expandComponent = this.expandComponent.bind(this)
  }

  componentWillMount() {
    this.getActions()
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.resource.JobResourceId !== nextProps.resource.JobResourceId
    ) {
      this.getActions(nextProps.resource.JobResourceId)
    }
  }

  getActions(jobResourceId) {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    if (jobResourceId === undefined) {
      jobResourceId = this.props.resource.JobResourceId
    }

    const url = `${api.JOBS_ROOT}${this.props.jobId}${
      api.JOB_CORRECTIVE_ACTION_ENDPOINT
    }`
    console.log(
      `Retrieving tier#${
        this.props.tierId
      } resource#${jobResourceId} corrective actions: ${url}...`,
    )

    this.props.auth
      .request("get", url)
      .query({ jobResourceId: jobResourceId })
      .query({ jobSourcingTierId: this.props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({
              actions: response.body.CorrectiveActions,
              documents: response.body.CorrectiveDocuments,
            })
          } else {
            console.log("failed to get corrective actions")
          }
        },
        () => {
          console.log("failed to get corrective actions")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  handleOpenCloseAction() {
    this.toggleShowAction(null)
  }

  toggleShowAction(data) {
    this.setState({
      showAction: !this.state.showAction,
      data: data,
    })
  }

  dateFormatter(cell, row) {
    var formatDate = cell
      ? `${format(cell, "l LT")} ${row.SiteTimeZoneShortName}`
      : ""
    return formatDate
  }

  viewLinkFormatter(cell, row) {
    const tooltip = (
      <div>
        <strong>Click</strong>
        to view action taken.
      </div>
    )

    return (
      <OverlayButton
        bsStyle={"link"}
        glyph="alert"
        disabled={false}
        text={tooltip}
        onClick={() => this.toggleShowAction(row)}
      />
    )
  }

  isExpandableRow(row) {
    return row.IsDocumentRequired
  }

  expandComponent(row) {
    let docs = this.state.documents.filter(function(i) {
      return (
        i.JobSourcingTierId === row.JobSourcingTierId &&
        i.JobResourceId === row.JobResourceId
      )
    })

    const props = {
      auth: this.props.auth,
      data: docs,
    }

    return <CorrectiveActionDocumentRow {...props} />
  }

  render() {
    const className = "resource-corrective-actions"
    const emptyTitle = "No resource action!"
    const emptyMesg =
      "Subcontractor has not uploaded a corrective action for this resource at this time."

    const options = {
      hideSizePerPage: true,
      noDataText: "No actions uploaded",
    }

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />
          &nbsp; Fetching corrective actions...
        </Alert>
      )
    }

    if (this.state.actions === undefined || this.state.actions.length === 0) {
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
      <div>
        {this.state.showAction && (
          <CorrectiveAction
            show={this.state.showAction}
            onCloseClick={this.handleOpenCloseAction}
            data={this.state.data}
          />
        )}

        <BootstrapTable
          data={this.state.actions}
          options={options}
          striped
          hover
          condensed
          expandColumnOptions={{
            expandColumnVisible: true,
          }}
          expandableRow={this.isExpandableRow}
          expandComponent={this.expandComponent}
          trClassName="break-word"
        >
          <TableHeaderColumn
            dataField="JobCorrectiveActionId"
            isKey={true}
            hidden
          >
            JobCorrectiveActionId
          </TableHeaderColumn>
          <TableHeaderColumn dataField="AccountName">
            Subcontractor
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="ClientCollectedOn"
            dataFormat={this.dateFormatter}
          >
            Collection On
          </TableHeaderColumn>
          <TableHeaderColumn dataField="UpdatedOn" hidden>
            Updated On
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CreatedOn" hidden>
            CreatedOn
          </TableHeaderColumn>
          <TableHeaderColumn dataField="CreatedBy" hidden>
            CreatedBy
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="Comment"
            dataFormat={this.viewLinkFormatter}
            dataAlign="center"
          >
            Action Taken
          </TableHeaderColumn>
          <TableHeaderColumn dataField="PerformedBy" hidden>
            Performed By
          </TableHeaderColumn>
          <TableHeaderColumn dataField="PerformedOn" hidden>
            Performed On
          </TableHeaderColumn>
          <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
            SiteTimeZoneShortName
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

CorrectiveActionTable.propTypes = propTypes
CorrectiveActionTable.defaultProps = defaultProps
