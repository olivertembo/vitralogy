import React from "react"
import PropTypes from "prop-types"
import { Modal, Button } from "react-bootstrap"
import Formsy, { addValidationRule } from "formsy-react"
import { Select, Input } from "formsy-react-components"
import { Icon } from "react-fa"
import FormsyFroala from "../formsyWrappers/FormsyFroala"
import * as api from "../../constants/api"

addValidationRule("isNonZero", (values, value) => {
  if (value > 0) {
    return true
  }

  return false
})

const propTypes = {
  auth: PropTypes.object,
  show: PropTypes.bool.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onCommentAdded: PropTypes.func.isRequired,
  jobId: PropTypes.number.isRequired,
}

const defaultProps = {
  auth: {},
}

export default class CommentAdd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      types: [],
      canSubmit: false,
      isPosting: false,
      success: false,
    }

    this.submitForm = this.submitForm.bind(this)
    this.enableSubmit = this.enableSubmit.bind(this)
    this.disableSubmit = this.disableSubmit.bind(this)
    this.handleCloseClick = this.handleCloseClick.bind(this)
  }

  componentWillMount() {
    let url = api.COMMENT_TYPES

    this.props.auth
      .request("get", url)
      .query({ type: api.COMMENT_TYPE_CUSTOMER })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          this.setState({ types: response.body })
        },
        failure => {
          console.log("failure to get comment types")
        },
      )
  }

  handleCloseClick() {
    this.props.onCloseClick()
  }

  submitForm(data) {
    this.setState({ isPosting: true })

    // const data = this.myform.refs.formsy.getModel()

    let url = api.COMMENT_NEW
    this.props.auth
      .request("post", url)
      .send({ JobId: this.props.jobId })
      .send({ JobCommentTypeId: data.commentTopicId })
      .send({ Subject: data.commentSubject })
      .send({ Comment: data.comment })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ success: true })
          } else {
            console.log("failure to post comment")
          }
        },
        () => {
          console.log("failure to post comment")
        },
      )
      .then(() => {
        this.props.onCommentAdded(this.state.success)
        this.setState({ isPosting: false })
      })
  }

  enableSubmit() {
    this.setState({ canSubmit: true })
  }

  disableSubmit() {
    this.setState({ canSubmit: false })
  }

  render() {
    if (this.state.isPosting) {
      return (
        <p>
          <Icon spin name="spinner" /> Submitting comment...
        </p>
      )
    }

    var options = this.state.types.map(function(type) {
      return {
        value: type.ItemId,
        label: type.Value,
      }
    })

    options.unshift({ value: 0, label: "Select topic type..." })

    return (
      <div className="comment-add">
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.handleCloseClick}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Comment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formsy
              onSubmit={this.submitForm}
              disabled={this.state.disabled}
              onValid={this.enableSubmit}
              onInvalid={this.disableSubmit}
              onChange={this.onChange}
              ref={input => {
                this.myform = input
              }}
            >
              <Select
                name="commentTopicId"
                id="commentTopicId"
                label="Topic"
                value="0"
                options={options}
                validations="isNonZero"
                required
              />
              <Input
                name="commentSubject"
                id="commentSubject"
                label="Subject"
                placeholder="Subject"
                validations="minLength:5"
                validationErrors={{
                  minLength: "Please provide a subject.",
                }}
                required
                type="text"
              />
              <FormsyFroala
                name="comment"
                licenseKey={api.FROALA_KEY}
                placeholder="Input comment here."
                label="Comment"
                validations={{
                  minLength: 1,
                }}
                validationErrors={{
                  minLength: "Field cannot be empty.",
                }}
                required
              />
              <Modal.Footer>
                <Button onClick={this.handleCloseClick}>Cancel</Button>
                <Button
                  bsStyle="primary"
                  disabled={!this.state.canSubmit || this.state.isPosting}
                  formNoValidate={true}
                  type="submit"
                >
                  &nbsp;
                  {this.state.isPosting === true ? (
                    <span>
                      <Icon spin name="spinner" /> Submitting...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </Modal.Footer>
            </Formsy>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

CommentAdd.propTypes = propTypes
CommentAdd.defaultProps = defaultProps
