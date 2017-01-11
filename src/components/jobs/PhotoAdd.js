import React from "react"
import PropTypes from "prop-types"
import moment from "moment"
import Modal from "react-bootstrap/lib/Modal"
import Button from "react-bootstrap/lib/Button"
import Alert from "react-bootstrap/lib/Alert"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import Icon from "react-fa/lib/Icon"
import Formsy from "formsy-react"
import { Textarea } from "formsy-react-components"
import FileUpload from "../FileUpload"
import * as api from "../../constants/api"

const MIN_CHARS = 10

const propTypes = {
  auth: PropTypes.object,
  show: PropTypes.bool.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onPhotoAdded: PropTypes.func.isRequired,
  jobId: PropTypes.number.isRequired,
}

const defaultProps = {
  auth: {},
}

export default class PhotoAdd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      canSubmit: false,
      file: {},
      isPosting: false,
      success: false,
      dropzone: null,
      errorMessage: null,
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

  onFileAdded(file) {
    // fun timing issue!
    setTimeout(
      function() {
        if (file.accepted === true) {
          if (this.state.dropzone.files[0].accepted === true) {
            // if user attaches photo first, double check
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

  handleCloseClick() {
    this.props.onCloseClick()
  }

  resetForm() {
    // this.myform.inputs[0]
    const formsy = this.myform
    formsy.reset()
    formsy.inputs[0].setValue("")
    this.state.dropzone.removeAllFiles()
    this.setState({
      file: {},
      canSubmit: false,
    })
  }

  submitForm() {
    if (Object.keys(this.state.file).length === 0) {
      this.setState({ errorMessage: "Select a file to upload!" })
      return
    }

    const formData = this.myform.getModel()
    const fileData = new FormData()
    fileData.append("content", this.state.file)

    const url = api.PHOTO_NEW
    console.log(url)

    const collectedOn = new Date()

    this.setState({ isPosting: true })

    this.props.auth
      .request("post", url)
      .query({ jobId: this.props.jobId })
      .query({ description: formData.description })
      .query({ collectedOn: moment(collectedOn).format() })
      .query({ isMobile: false })
      .query({ documentMappingId: api.DOC_CLASS_VENDOR_PHOTO })
      .send(fileData)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ success: true })
          } else {
            console.log("failure to post photo")
          }
        },
        () => {
          console.log("failure to post photo")
        },
      )
      .then(() => {
        this.props.onPhotoAdded(this.state.success)
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

  render() {
    return (
      <div className="photo-add">
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.handleCloseClick}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Photo</Modal.Title>
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
                  <Icon spin name="spinner" /> Submitting photo...
                </p>
              )}
              {!this.state.isPosting && (
                <span>
                  <Textarea
                    rows={3}
                    cols={40}
                    name="description"
                    label="Description"
                    placeholder="Photo description"
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
                      acceptedFiles="image/*"
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
                disabled={!this.state.canSubmit || this.state.isPosting}
                formNoValidate={true}
                onClick={this.submitForm}
              >
                {this.state.isPosting === true ? (
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

PhotoAdd.propTypes = propTypes
PhotoAdd.defaultProps = defaultProps
