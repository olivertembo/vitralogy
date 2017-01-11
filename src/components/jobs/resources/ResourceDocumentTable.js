import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "react-bootstrap/lib/Tooltip"
import { default as ToolTip } from "antd/lib/tooltip"
import DocumentAdd from "../DocumentAdd"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import * as api from "../../../constants/api"
import { format } from "../../../utils/datetime"
import ToastHelper from "../../../utils/ToastHelper"
import { ReactComponent as FolderIcon } from "../../../assets/icons/brand/folder.svg"

const propTypes = {
  jobId: PropTypes.number.isRequired,
  auth: PropTypes.object,
  tierId: PropTypes.number.isRequired,
  jobResourceId: PropTypes.number.isRequired,
}

const defaultProps = {
  jobResourceId: null,
  auth: {},
  documents: [],
}

export default class DocumentTable extends React.Component {
  constructor(props) {
    super(props)

    this.dateFormatter = this.dateFormatter.bind(this)
    this.uploadedFormatter = this.uploadedFormatter.bind(this)

    this.state = {
      documents: [],
      isFetching: false,
      showAddDocument: false
    }
  }

  handleAddDocument = () => {
    this.setState({
      showAddDocument: !this.state.showAddDocument,
    })
  }

  onDocumentAdded = success => {
    this.handleAddDocument()
    if (success) {
      this.getDocuments()
      ToastHelper.success("Document submitted successfully.")
    } else {
      ToastHelper.error("Error submitting document!")
    }
  }

  dateFormatter(item) {
    const formattedDate = format(item.CollectedOn, "l LT")

    return (
      <span>
        {formattedDate} {item.SiteTimeZoneShortName}{" "}
      </span>
    )
  }

  uploadedFormatter(item) {
    const mobileToolTip = (
      <Tooltip id="uploadViaToolTip">
        {item.IsCreatedByMobile ? "Uploaded via mobile" : "Uploaded via web"}
      </Tooltip>
    )

    return (
      <span>
        <OverlayTrigger placement="left" overlay={mobileToolTip}>
          <Glyphicon glyph={item.IsCreatedByMobile ? "phone" : "blackboard"} />
        </OverlayTrigger>
      </span>
    )
  }

  componentDidMount() {
    this.getDocuments()
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.resource.JobResourceId !== nextProps.resource.JobResourceId
    ) {
      this.getDocuments(nextProps.resource.JobResourceId)
    }
  }

  getDocuments(jobResourceId) {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    if (jobResourceId === undefined) {
      jobResourceId = this.props.resource.JobResourceId
    }

    const url = `${api.DOCUMENTS_ENDPOINT}${this.props.jobId}`

    this.props.auth
      .request("get", url)
      .query({ jobResourceId: jobResourceId })
      .query({ tierId: this.props.tierId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            this.setState({ documents: response.body.Documents })
          } else {
            console.log("failed to get tier documents")
          }
        },
        () => {
          console.log("failed to get tier documents")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  render() {
    const className = "resource-documents"
    const emptyTitle =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "No resource documents!"
        : "No job documents!"
    const emptyMesg =
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
      this.props.data.ResourceSupportModeId ===
        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE
        ? "Subcontractor has not uploaded any documents for resource at this time."
        : "Subcontractor has not uploaded any documents for job at this time."

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />
          &nbsp; Fetching documents...
        </Alert>
      )
    }

    const documentAddModal = (
      <DocumentAdd
        show={this.state.showAddDocument}
        auth={this.props.auth}
        jobId={this.props.jobId}
        resource={this.props.resource}
        tierId={this.props.tierId}
        onCloseClick={this.handleAddDocument}
        onDocumentAdded={this.onDocumentAdded}
        stepDocumentTypes={this.props.stepDocumentTypes}
      />
    )

    const addButton = (
      <button
        className="roundButton fixed"
        onClick={this.handleAddDocument}
      >
        <FolderIcon />
      </button>
    )

    if (
      this.state.documents === undefined ||
      this.state.documents.length === 0
    ) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={emptyTitle}
            message={emptyMesg}
          />

          {this.state.showAddDocument && documentAddModal}

          <div className="mb-lg">{addButton}</div>
        </div>
      )
    }

    return (
      <div className={className}>
        {this.state.showAddDocument && documentAddModal}
        <div className="">{addButton}</div>

        <div className="list-blocks">
          {this.state.documents.map(item => {
            return <li>

              <ToolTip
                placement="topLeft"
                onClick={() =>
                  this.props.auth.downloadFile(item.Url, item.FileName)
                }
                title={`Click to download ${item.DocumentType} - ${
                  item.Description
                }`}
              >
                <p className="click-header">
                  <FolderIcon  />
                  <span>{item.FileName}</span>
                </p>
              </ToolTip>
              <p>
                <strong>{item.DocumentType}</strong>
              </p>
              <p>
                <span>{item.Description}</span>
              </p>
              <p>
                <strong>{this.dateFormatter(item)}</strong>
                <span>Added On</span>
              </p>
              <p>
                <strong>${item.CreatedBy}- ${item.Vendor}</strong>
                <span>Added By <span className="icons-color">{this.uploadedFormatter(item)}</span></span>
              </p>

            </li>
          })}
        </div>
      </div>
    )
  }
}

DocumentTable.propTypes = propTypes
DocumentTable.defaultProps = defaultProps
