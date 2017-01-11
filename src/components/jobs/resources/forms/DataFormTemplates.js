import React from "react"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"

import OverlayButton from "../../../layout/OverlayButton"
import EmptyStateContainer from "../../../../containers/EmptyStateContainer"
import { format } from "../../../../utils/datetime"
import * as api from "../../../../constants/api"

import { ReactComponent as EditIcon } from "../../../../assets/icons/brand/openModal.svg"


export default class DataFormTemplates extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.uploadedByFormatter = this.uploadedByFormatter.bind(this)
    this.reportLinkFormatter = this.reportLinkFormatter.bind(this)
    this.viewLinkFormatter = this.viewLinkFormatter.bind(this)
  }

  downloadReport(formName, submittedItem) {
    const fileName = `${
      this.props.data.JobNumber
    }-${submittedItem.TemplateName.replace(
      /\s+/g,
      "",
    )}-${submittedItem.Resource.replace(/\s+/g, "")}.pdf`
    this.props.auth.downloadFile(submittedItem.FormReportUrl, fileName)
  }

  uploadedByFormatter(submittedItem) {
    const mobileToolTip = (
      <Tooltip id="uploadViaToolTip">
        {submittedItem.IsLastUpdatedByMobile
          ? "Uploaded via mobile"
          : "Uploaded via web"}
      </Tooltip>
    )
    const offLineToolTip = (
      <Tooltip id="uploadOffLineToolTip">
        {submittedItem.IsLastUpdatedByOffLineSync
          ? "Data capture occurred without connectivity"
          : "Data capture occurred with connectivity"}
      </Tooltip>
    )

    var format = " "
    return (
      <spam className="icons-color">
        <OverlayTrigger placement="left" overlay={mobileToolTip}>
          <Glyphicon
            glyph={submittedItem.IsLastUpdatedByMobile ? "phone" : "blackboard"}
          />
        </OverlayTrigger>
        &nbsp;
        <OverlayTrigger placement="top" overlay={offLineToolTip}>
          <Glyphicon
            glyph={
              submittedItem.IsLastUpdatedByOffLineSync
                ? "cloud-download"
                : "cloud-upload"
            }
          />
        </OverlayTrigger>
        {format}
      </spam>
    )
  }

  viewLinkFormatter(item, submittedItem) {
    const tooltip = (
      <div>
        <strong>Click</strong>&nbsp;
        {submittedItem === undefined || submittedItem === null
          ? "to view " + item.Description + " template form"
          : "to view submission details."}
      </div>
    )

    return (
      <div>
        <OverlayButton
          bsStyle="link"
          className="icon-button"
          bsSize="small"
          disabled={false}
          text={tooltip}
          onClick={() =>
            submittedItem === undefined || submittedItem === null
              ? this.props.onTemplateSelected(item)
              : this.props.onSubmissionSelected(submittedItem)
          }
        >
          {submittedItem === undefined || submittedItem === null
            ? <i class="fa fa-file icon" aria-hidden="true"></i>
            : <EditIcon className="icon"/>}
        </OverlayButton>
        {item.Name}
      </div>
    )
  }

  reportLinkFormatter(item, submittedItem) {
    const pendingholder = <div class="pending-color">Pending</div>
    const formReportToolTip = (
      <Tooltip id="formReport-tooltip" placement="top">
        <strong>Click</strong>
        to download Form Summary Report
      </Tooltip>
    )
    const formReportButton = (
      <div>
        <OverlayTrigger overlay={formReportToolTip} placement="top">
          <Button
            bsStyle="link"
            bsClass="btn-inline"
            bsSize="xsmall"
            onClick={() => this.downloadReport(item.Name, submittedItem)}
          >
            <Icon name="file-pdf-o" />
            &nbsp;Summary
          </Button>
        </OverlayTrigger>
      </div>
    )

    return submittedItem.FormReportUrl === undefined ||
      submittedItem.FormReportUrl === null
      ? pendingholder
      : formReportButton
  }

  render() {
    /* Empty state */
    if (this.props.templates.length === 0) {
      return <div>No blank form templates to submit.</div>
    }

    const emptyTitle =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "No resource forms!"
        : "No job forms!"
    const emptyMesg =
      "Subcontractor has not uploaded a form for this template at this time."

    const templates = this.props.templates.map(item => {
      const submittedItem = this.props.submissions.filter(
        x => x.FormTemplateId === item.FormTemplateId,
      )[0]

      return (
        <li key={item.FormTemplateId}>
          {this.viewLinkFormatter(item, submittedItem)}
          {submittedItem !== undefined && (
              <div>
                <p>
                  <strong>{`${format(submittedItem.CollectedOn, "l LT")} ${
                    submittedItem.SiteTimeZoneShortName
                  }`}</strong>
                  <span>Collected On</span>
                </p>
                <p>
                  <strong>{submittedItem.CreatedBy}</strong>
                  <span>Uploaded By {this.uploadedByFormatter(submittedItem)}</span>
                </p>
                <p>
                  <strong>{this.reportLinkFormatter(item, submittedItem)}</strong>
                  <span>Report</span>
                </p>
              </div>
          )}

          {submittedItem === undefined && (
            <EmptyStateContainer
              alertStyle="info"
              title={emptyTitle}
              message={emptyMesg}
            />
          )}
        </li>
      )
    })

    return <ul className="list-blocks">{templates}</ul>
  }
}
