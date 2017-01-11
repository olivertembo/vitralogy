import React from "react"
import PropTypes from "prop-types"
import moment from "moment"
import Modal from "react-bootstrap/lib/Modal"
import Button from "react-bootstrap/lib/Button"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import Alert from "react-bootstrap/lib/Alert"
import Formsy, { addValidationRule } from "formsy-react"
import { Select, Textarea } from "formsy-react-components"
import { Icon } from "react-fa"
import FileUpload from "../FileUpload"
import * as api from "../../constants/api"

const MIN_CHARS = 10

addValidationRule("isNonZero", (values, value) => {
  if (value > 0) return true

  return false
})

const propTypes = {
  auth: PropTypes.object,
  show: PropTypes.bool.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onDocumentAdded: PropTypes.func.isRequired,
  jobId: PropTypes.number.isRequired,
  stepDocumentTypes: PropTypes.array.isRequired,
}

const defaultProps = {
  auth: {},
  title: "Add Document",
  isPosting: false,
  success: false,
}

export default class DocumentAdd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      canSubmit: false,
      file: {},
      dropzone: null,
      errorMessage: null,
      isPosting: false,
    }

    this.resetForm = this.resetForm.bind(this)
    this.submitForm = this.submitForm.bind(this)
    this.enableSubmit = this.enableSubmit.bind(this)
    this.disableSubmit = this.disableSubmit.bind(this)
    this.handleCloseClick = this.handleCloseClick.bind(this)
    this.onFileAdded = this.onFileAdded.bind(this)
    this.onFileRemoved = this.onFileRemoved.bind(this)
    this.onFileInit = this.onFileInit.bind(this)
  }

  handleCloseClick() {
    this.props.onCloseClick()
  }

  resetForm() {
    console.log("reset form")
    // this.myform.refs.formsy.inputs[0]
    const formsy = this.myform
    formsy.reset()
    formsy.inputs[0].setValue("")
    formsy.inputs[1].setValue("")
    this.state.dropzone.removeAllFiles()
    this.setState({
      file: {},
      canSubmit: false,
    })
  }

  submitForm() {
    this.setState({ isPosting: true })

    const formData = this.myform.getModel()
    const fileData = new FormData()
    fileData.append("content", this.state.file)

    const url = api.CUSTOMER_ADD_DOCUMENT(this.props.jobId)
    const collectedOn = new Date()
    let jobResourceId = null
    let jobSourcingTierId = null
    if (this.props.tierId > 0) {
      jobSourcingTierId = this.props.tierId
      if (this.props.resource) {
        jobResourceId = this.props.resource.JobResourceId
      }
    }

    this.props.auth
      .request("post", url)
      .query({ jobId: this.props.jobId })
      .query({ documentMappingId: formData.documentType })
      .query({ description: formData.description })
      .query({ collectedOn: moment(collectedOn).format() })
      .query({ jobSourcingTierId })
      .query({ jobResourceId })
      .send(fileData)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ success: true })
          } else {
            console.log("failure to post document")
          }
        },
        () => {
          console.log("failure to post document")
        },
      )
      .then(() => {
        this.props.onDocumentAdded(this.state.success)
        this.setState({ isPosting: false })
      })
  }

  enableSubmit() {
    if (this.state.dropzone.files.length > 0) {
      this.setState({ canSubmit: true })
    }
  }

  disableSubmit() {
    this.setState({ canSubmit: false })
  }

  onFileAdded(file) {
    // fun timing issue!
    setTimeout(
      function() {
        if (file.accepted === true) {
          if (this.state.dropzone.files[0].accepted === true) {
            // if user attaches doc first, double check
            // the description field validation
            const formData = this.myform.getModel()
            const descriptionFilled =
              formData.description !== undefined &&
              formData.description.length >= MIN_CHARS

            this.setState({
              file: this.state.dropzone.files[0],
              errorMessage: null,
              canSubmit: descriptionFilled,
            })
          } else {
            console.log("not valid file")
            this.setState({ errorMessage: "Invalid file type" })

            this.state.dropzone.removeAllFiles()

            console.log(this.state.dropzone.getRejectedFiles())
          }
        }
      }.bind(this),
      10,
    )
  }

  onFileRemoved(file) {
    if (file.accepted === true) {
      this.setState({
        file: {},
        canSubmit: false,
      })
    }
  }

  onFileInit(dz) {
    if (dz) {
      this.setState({ dropzone: dz })
    }
  }

  render() {
    const documentTypesNodes = this.props.stepDocumentTypes.map(type => {
      return {
        value: type.MappingId,
        label: type.DocTypeValue,
      }
    })
    documentTypesNodes.unshift({ value: 0, label: "Select document type..." })

    return (
      <div className="document-add">
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.handleCloseClick}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.errorMessage != null && (
              <Alert bsStyle="danger">{this.state.errorMessage}</Alert>
            )}
            <Formsy
              onValidSubmit={this.submitForm}
              disabled={this.state.disabled}
              onValid={this.enableSubmit}
              onInvalid={this.disableSubmit}
              onChange={this.onChange}
              layout="vertical"
              ref={input => {
                this.myform = input
              }}
            >
              {this.state.isPosting && (
                <p>
                  <Icon spin name="spinner" /> Submitting document...
                </p>
              )}
              {!this.state.isPosting && (
                <span>
                  <Select
                    name="documentType"
                    id="documentType"
                    label="Document Type"
                    value="0"
                    options={documentTypesNodes}
                    validations="isNonZero"
                    required
                  />
                  <Textarea
                    rows={3}
                    cols={40}
                    name="description"
                    label="Description"
                    placeholder="Document description."
                    validations="minLength:10"
                    validationErrors={{
                      minLength:
                        "Please provide a file description (minimum 10 chars).",
                    }}
                    required
                  />
                  <div className="form-group">
                    <label
                      className="control-label"
                      data-required="true"
                      htmlFor="file"
                    >
                      File<span className="required-symbol"> *</span>
                    </label>
                    <FileUpload
                      acceptedFiles=".pdf,.txt,.text,.rtf,.xls,.xlsx,.xlsm,.xltx,.xltm,.xlsb,.xlam,.doc,.docx,.docm,.dotx,.dotm,.pptx,.pptm,.potx,.potm,.ppam,.ppsx,.ppsm,.sldx,.sldm,.thmx,.zip,.rar,.7z,image/*"
                      auth={this.props.auth}
                      handlers={{
                        removed: this.onFileRemoved,
                        added: this.onFileAdded,
                        init: this.onFileInit,
                      }}
                    />
                  </div>
                </span>
              )}
            </Formsy>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                bsStyle="primary"
                bsSize="small"
                className="pull-right"
                disabled={this.state.isPosting || !this.state.canSubmit}
                formNoValidate={true}
                onClick={this.submitForm}
              >
                {this.state.isPosting ? (
                  <span>
                    <Icon spin name="spinner" /> Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
              <Button
                bsStyle="default"
                bsSize="small"
                className="pull-right"
                onClick={this.resetForm}
                disabled={this.state.isPosting}
              >
                Reset
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

DocumentAdd.propTypes = propTypes
DocumentAdd.defaultProps = defaultProps
