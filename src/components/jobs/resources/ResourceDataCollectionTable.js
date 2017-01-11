import React from "react"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Button from "react-bootstrap/lib/Button"
import Alert from "react-bootstrap/lib/Alert"
import { Scrollbars } from "react-custom-scrollbars"
import Modal from "react-bootstrap/lib/Modal"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"

import * as api from "../../../constants/api"
import OverlayButton from "../../layout/OverlayButton"
import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import DataForm from "./DataForm"
import { format } from "../../../utils/datetime"

const propTypes = {
  auth: PropTypes.object.isRequired,
  jobId: PropTypes.number.isRequired,
  tierId: PropTypes.number.isRequired,
  jobResourceId: PropTypes.number.isRequired,
}

const defaultProps = {
  jobResourceId: null,
  auth: {},
  submittedForms: [],
  templates: [],
}

export default class ResourceDataCollectionTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      templates: [],
      submittedForms: [],
      isFetching: false,
      isFetchingTemplates: false,
      showForm: false,
      formData: {},
    }

    this.dateFormatter = this.dateFormatter.bind(this)
    this.viewLinkFormatter = this.viewLinkFormatter.bind(this)
    this.uploadedByFormatter = this.uploadedByFormatter.bind(this)
    this.onSubmissionSelected = this.onSubmissionSelected.bind(this)
    this.onTemplateSelected = this.onTemplateSelected.bind(this)
    this.onCancelClick = this.onCancelClick.bind(this)
    this.hideForm = this.hideForm.bind(this)
    this.downloadReport = this.downloadReport.bind(this)
    this.reportLinkFormatter = this.reportLinkFormatter.bind(this)
  }

  componentDidMount() {
    this.getSubmittedForms()
    this.getFormTemplates()
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.resource.JobResourceId !== nextProps.resource.JobResourceId
    ) {
      this.getSubmittedForms(nextProps.resource.JobResourceId)
    }
  }

  getFormTemplates() {
    if (this.state.isFetchingTemplates) {
      return
    }

    this.setState({ isFetchingTemplates: true })

    const url = `${api.JOBS_ROOT}${this.props.jobId}${api.JOB_FORM_TEMPLATES}`
    console.log(`Retrieving form templates: ${url}...`)

    this.props.auth
      .request("get", url)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ templates: response.body.JobForms })
          }
        },
        () => {
          console.log("failed to get job form templates")
        },
      )
      .then(() => {
        this.setState({ isFetchingTemplates: false })
      })
  }

  getSubmittedForms(jobResourceId) {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    if (jobResourceId === undefined) {
      jobResourceId = this.props.resource.JobResourceId
    }

    const url = `${api.JOBS_ROOT}${this.props.jobId}${
      api.JOB_FORM_RESULT_ENDPOINT
    }`
    console.log(
      `Retrieving tier#${
        this.props.tierId
      } level resource#${jobResourceId} forms: ${url}...`,
    )

    // if (Object.getOwnPropertyNames(this.props.resource).length !== 0) {  if
    // (jobResourceId === undefined) {    jobResourceId =
    // this.props.resource.JobResourceId  } }

    this.props.auth
      .request("get", url)
      .query({ jobSourcingTierId: this.props.tierId })
      .query({ jobResourceId: jobResourceId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ submittedForms: response.body.JobFormResults })
          } else {
            console.log("failed to get submitted job forms")
          }
        },
        () => {
          console.log("failed to get submitted job forms")
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

  viewLinkFormatter(cell, row) {
    const tooltip = (
      <div>
        <strong>Click</strong>&nbsp;to view submission details.
      </div>
    )

    return (
      <p>
        <OverlayButton
          bsStyle="link"
          className=""
          bsSize="small"
          glyph="edit"
          disabled={false}
          text={tooltip}
          onClick={() => this.onSubmissionSelected(row)}
        />
        &nbsp;{cell}
      </p>
    )
  }

  reportLinkFormatter(cell, row) {
    const pendingholder = <span>Pending...</span>
    const formReportToolTip = (
      <Tooltip id="formReport-tooltip" placement="top">
        <strong>Click</strong> to download Form Summary Report
      </Tooltip>
    )
    const formReportButton = (
      <p>
        <OverlayTrigger overlay={formReportToolTip} placement="top">
          <Button
            bsStyle="link"
            bsClass="btn-inline"
            bsSize="xsmall"
            onClick={() => this.downloadReport(row)}
          >
            <Icon name="file-pdf-o" />
          </Button>
        </OverlayTrigger>
        &nbsp;Summary
      </p>
    )

    return row.FormReportUrl === null ? pendingholder : formReportButton
  }

  dateFormatter(cell, row) {
    var formatDate = cell
      ? `${format(cell, "l LT")}&nbsp;${row.SiteTimeZoneShortName}`
      : ""
    return formatDate
  }

  onSubmissionSelected(submission) {
    const {
      DefaultUISchema,
      JSONSchema,
      ResultData,
      TemplateName,
      JobFormResultId,
      FormTemplateId,
    } = submission

    this.setState({
      formData: {
        DefaultUISchema,
        JSONSchema,
        DefaultFormData: ResultData,
        TemplateName,
        JobFormResultId,
        FormTemplateId,
      },
      showForm: true,
    })
  }

  onCancelClick() {
    this.hideForm()
  }

  hideForm() {
    this.setState({ showForm: false, formData: {} })
  }

  onTemplateSelected(formData) {
    this.setState({ formData, showForm: true })
  }

  downloadReport(row) {
    const fileName = `${this.props.data.JobNumber}-${row.TemplateName.replace(
      /\s+/g,
      "",
    )}-${row.Resource.replace(/\s+/g, "")}.pdf`
    this.props.auth.downloadFile(row.FormReportUrl, fileName)
  }

  render() {
    const className = "resource-forms"
    const emptyTitle =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "No resource forms!"
        : "No job forms!"
    const emptyMesg =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "Subcontractor has not uploaded any forms for resource at this time."
        : "Subcontractor has not uploaded any forms for job at this time."
    const options = {
      hideSizePerPage: true,
      noDataText: "No forms uploaded",
    }

    const scrollStyle = {
      width: "100%",
    }

    const templateNodes = this.state.templates.map(template => {
      const tooltip = (
        <div>
          <strong>Click</strong>&nbsp;to view {template.Description}
          &nbsp;template form
        </div>
      )

      return (
        <li key={template.FormTemplateId}>
          <OverlayButton
            className=""
            bsStyle={"link"}
            glyph="file"
            disabled={false}
            text={tooltip}
            onClick={() => this.onTemplateSelected(template)}
          />
          {template.Name}- Effective {format(template.CreatedOn, "l LT")}
        </li>
      )
    }, this)

    if (
      this.state.submittedForms === undefined ||
      this.state.submittedForms.length === 0
    ) {
      return (
        <div className={className}>
          {/* Modal to display the data form to work on */
          this.state.showForm && (
            <Modal
              backdrop="static"
              show={this.state.showForm}
              onHide={this.hideForm}
              dialogClassName="data-form-modal"
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  {this.state.formData.TemplateName === undefined
                    ? this.state.formData.Name + " - Form Template"
                    : this.state.formData.TemplateName}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Scrollbars
                  style={scrollStyle}
                  autoHeight
                  autoHeightMin={25}
                  autoHeightMax={700}
                >
                  <DataForm formData={this.state.formData} />
                </Scrollbars>
                <br />

                <OverlayButton
                  bsStyle="info"
                  className="pull-right"
                  bsSize="small"
                  glyph=""
                  disabled={false}
                  text="Dismiss Dialog"
                  onClick={this.onCancelClick}
                >
                  Close
                </OverlayButton>
              </Modal.Body>
            </Modal>
          )}

          <h5>Data Forms to Complete</h5>
          {this.state.isFetchingTemplates && (
            <Alert bsStyle="info">
              <Icon spin name="spinner" />
              &nbsp;Fetching Templates...
            </Alert>
          )}

          <ul className="list-unstyled">{templateNodes}</ul>

          <h5>Completed Data Forms</h5>

          {this.state.isFetching === true && (
            <Alert bsStyle="info">
              <Icon spin name="spinner" />
              &nbsp;Fetching Forms...
            </Alert>
          )}

          {this.state.isFetching === false && (
            <EmptyStateContainer
              alertStyle="info"
              title={emptyTitle}
              message={emptyMesg}
            />
          )}
        </div>
      )
    }

    return (
      <div className={className}>
        {/* Modal to display the data form to work on */
        this.state.showForm && (
          <Modal
            backdrop="static"
            show={this.state.showForm}
            onHide={this.hideForm}
            dialogClassName="data-form-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {this.state.formData.TemplateName === undefined
                  ? this.state.formData.Name + " - Form Template"
                  : this.state.formData.TemplateName}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Scrollbars
                style={scrollStyle}
                autoHeight
                autoHeightMin={25}
                autoHeightMax={700}
              >
                <DataForm formData={this.state.formData} />
              </Scrollbars>
              <br />

              <OverlayButton
                bsStyle="info"
                className="pull-right"
                bsSize="small"
                glyph=""
                disabled={false}
                text="Dismiss Dialog"
                onClick={this.onCancelClick}
              >
                Close
              </OverlayButton>
            </Modal.Body>
          </Modal>
        )}

        <h5>Data Forms to Complete</h5>
        {this.state.isFetchingTemplates === true && (
          <Alert bsStyle="info">
            <Icon spin name="spinner" />
            &nbsp;Fetching Templates...
          </Alert>
        )}
        <ul className="list-unstyled">{templateNodes}</ul>

        <h5>Completed Data Forms</h5>

        {this.state.isFetching === true && (
          <Alert bsStyle="info">
            <Icon spin name="spinner" />
            &nbsp;Fetching Forms...
          </Alert>
        )}

        <BootstrapTable
          data={this.state.submittedForms}
          options={options}
          striped
          hover
          condensed
          trClassName="break-word"
        >
          <TableHeaderColumn dataField="JobFormResultId" isKey={true} hidden>
            Form ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField="DefaultUISchema" hidden>
            DefaultUISchema
          </TableHeaderColumn>
          <TableHeaderColumn dataField="JSONSchema" hidden>
            JSONSchema
          </TableHeaderColumn>
          <TableHeaderColumn dataField="ResultData" hidden>
            ResultData
          </TableHeaderColumn>
          <TableHeaderColumn dataField="FormTemplateId" hidden>
            FormTemplateId
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Tier" hidden width="75">
            Tier
          </TableHeaderColumn>
          <TableHeaderColumn dataField="Vendor" hidden>
            Subcontractor
          </TableHeaderColumn>
          <TableHeaderColumn dataField="ResourceType" hidden dataAlign="center">
            Resource Type
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="Resource"
            hidden
            dataAlign="center"
            width="15%"
          >
            Resource
          </TableHeaderColumn>
          <TableHeaderColumn dataField="JobResourceId" hidden>
            Resource ID
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="CreatedBy"
            width="13%"
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
            dataField="CollectedOn"
            dataFormat={this.dateFormatter}
            dataAlign="center"
          >
            Collected On
          </TableHeaderColumn>
          <TableHeaderColumn dataField="SiteTimeZoneShortName" hidden>
            SiteTimeZoneShortName
          </TableHeaderColumn>
          <TableHeaderColumn dataField="JobSourcingTierId" hidden>
            Sourcing Tier ID
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="TemplateName"
            dataFormat={this.viewLinkFormatter}
            dataAlign="center"
          >
            {" "}
            Type
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="FormReportUrl"
            hidden={this.props.data.IsComplete === false}
            dataFormat={this.reportLinkFormatter}
            dataAlign="center"
          >
            {" "}
            Report
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

ResourceDataCollectionTable.propTypes = propTypes
ResourceDataCollectionTable.defaultProps = defaultProps
