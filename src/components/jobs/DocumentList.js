import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"

import ToastHelper from "../../utils/ToastHelper"
import OverlayButton from "../layout/OverlayButton"
import EmptyStateContainer from "../../containers/EmptyStateContainer"
import DocumentAdd from "./DocumentAdd"
import * as api from "../../constants/api"
import { format } from "../../utils/datetime"

const propTypes = {
  jobId: PropTypes.number.isRequired,
  auth: PropTypes.object,
  stepDocumentTypes: PropTypes.array.isRequired,
}

const defaultProps = {
  auth: {},
  documents: [],
}

export default class DocumentList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      documents: [],
      showAddDocument: false,
      isFetching: false,
    }

    this.handleAddDocument = this.handleAddDocument.bind(this)
    this.onDocumentAdded = this.onDocumentAdded.bind(this)
  }

  handleAddDocument() {
    this.setState({ showAddDocument: !this.state.showAddDocument })
  }

  onDocumentAdded(success) {
    this.handleAddDocument()
    if (success) {
      this.getDocuments()
      ToastHelper.success("Document submitted successfully.")
    } else {
      ToastHelper.error("Error submitting document!")
    }
  }

  componentWillMount() {
    this.getDocuments()
  }

  getDocuments() {
    if (this.state.isFetching || this.props.jobId === 0) {
      return
    }

    this.setState({ isFetching: true })

    const url = `${api.DOCUMENTS_ENDPOINT}${this.props.jobId}`
    console.log(`Retrieving job level docs: ${url}...`)

    this.props.auth
      .request("get", url)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ documents: response.body.Documents })
          } else {
            console.log("failed to get job  documents")
          }
        },
        () => {
          console.log("failed to get job documents")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  render() {
    const className = "document-list"
    const addTooltip = "Add a document to the job."

    if (this.state.isFetching) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" /> Fetching documents...
        </Alert>
      )
    }

    if (
      this.state.documents === undefined ||
      this.state.documents.length === 0
    ) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title="No job level documents!"
            message="Add documents here that will be seen by subcontractors."
          />
          <br />

          {this.state.showAddDocument && (
            <DocumentAdd
              show={this.state.showAddDocument}
              auth={this.props.auth}
              onCloseClick={this.handleAddDocument}
              onDocumentAdded={this.onDocumentAdded}
              jobId={this.props.jobId}
              tierId={0}
              stepDocumentTypes={this.props.stepDocumentTypes}
            />
          )}

          <OverlayButton
            className="pull-right"
            bsSize="small"
            bsStyle="info"
            glyph="plus"
            disabled={false}
            text={addTooltip}
            onClick={this.handleAddDocument}
          >
            {" "}
            Add
          </OverlayButton>
        </div>
      )
    }

    const items = this.state.documents.map(item => {
      const tooltip = `Added by ${item.CreatedBy} from ${
        item.Vendor
      } on ${format(item.CollectedOn, "l LT")} ${
        item.SiteTimeZoneShortName
      } - ${item.Description}`

      return (
        <li key={item.JobDocumentId}>
          <OverlayButton
            className="pull-left"
            bsStyle={"link"}
            glyph="file"
            disabled={false}
            text={tooltip}
            onClick={() =>
              this.props.auth.downloadFile(item.Url, item.FileName)
            }
          >
            {" "}
            {item.DocumentType}
          </OverlayButton>
        </li>
      )
    })

    return (
      <div className={className}>
        {this.state.showAddDocument && (
          <DocumentAdd
            show={this.state.showAddDocument}
            auth={this.props.auth}
            onCloseClick={this.handleAddDocument}
            onDocumentAdded={this.onDocumentAdded}
            jobId={this.props.jobId}
            tierId={0}
            stepDocumentTypes={this.props.stepDocumentTypes}
          />
        )}
        <OverlayButton
          className="pull-right"
          bsSize="small"
          bsStyle="info"
          glyph="plus"
          disabled={false}
          text={addTooltip}
          onClick={this.handleAddDocument}
        >
          {" "}
          Add
        </OverlayButton>
        <br />
        <br />

        <div className="row">
          <div className="col-sm-12">
            <ul className="list-unstyled">{items}</ul>
          </div>
        </div>
      </div>
    )
  }
}

DocumentList.propTypes = propTypes
DocumentList.defaultProps = defaultProps
