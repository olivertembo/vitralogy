import React from "react"
import PropTypes from "prop-types"
import Button from "react-bootstrap/lib/Button"
import Modal from "react-bootstrap/lib/Modal"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import Icon from "react-fa/lib/Icon"
import Formsy, { addValidationRule } from "formsy-react"
import { Select, Input } from "formsy-react-components"
import { parse, isValidNumber } from "libphonenumber-js"

addValidationRule("isPhone", (values, value) => {
  if (value === "" || value === undefined) {
    return false
  }

  try {
    const phoneNumber = parse(value, "US")
    const result = isValidNumber(phoneNumber)
    return result
  } catch (e) {
    return false
  }
})

const propTypes = {
  onHide: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  emailTypes: PropTypes.arrayOf(PropTypes.object),
  phoneTypes: PropTypes.arrayOf(PropTypes.object),
  isPosting: PropTypes.bool,
}

const defaultProps = {
  emailTypes: [],
  phoneTypes: [],
  isPosting: false,
}

export default class AddContactForm extends React.Component {
  state = {
    canSubmit: false,
    disabled: false,
    isPosting: false,
    contactOption: "0",
  }

  onCancelClick = () => {
    this.props.onHide()
  }

  contactOption = (name, contactOption) => {
    if (contactOption !== this.state.contactOption) {
      this.myform.inputs[1].setValue("")
      this.myform.inputs[2].setValue("")

      this.setState({ contactOption })
    }
  }

  submitForm = () => {
    const data = this.myform.getModel()
    this.props.onSubmit(data)
  }

  enableSubmit = () => {
    this.setState({ canSubmit: true })
  }

  disableSubmit = () => {
    this.setState({ canSubmit: false })
  }

  render() {
    const contactOptions = [
      { value: "0", label: "Email" },
      { value: "1", label: "Phone" },
    ]

    let types = null
    if (this.state.contactOption === "0") {
      // email options
      types = this.props.emailTypes
    } else {
      // phone options
      types = this.props.phoneTypes
    }
    const contactTypes = types.map(type => ({
      value: type.ItemId.toString(),
      label: type.Value,
    }))

    // Add select text
    contactTypes.unshift({ value: "", label: "Select type..." })

    return (
      <div className="add-contact-form">
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.onCancelClick}
        >
          <Modal.Header closeButton>
            <Modal.Title>{`Add ${
              this.state.contactOption === "0" ? `Email` : `Phone`
            } Contact`}</Modal.Title>
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
                name="contactOption"
                id="contactOption"
                label="Method"
                options={contactOptions}
                onChange={this.contactOption}
                value="0"
                required
              />
              <Select
                name="contactTypeId"
                id="contactTypeId"
                label="Type"
                options={contactTypes}
                required
              />
              <Input
                name="contactInput"
                id="contactInput"
                label={this.state.contactOption === "0" ? "Email" : "Phone"}
                validations={
                  this.state.contactOption === "0" ? "isEmail" : "isPhone"
                }
                validationErrors={{
                  isEmail:
                    "Invalid email address, please use email@domain.com format.",
                  isPhone:
                    "Invalid phone number, please use 123-456-2134 format.",
                }}
                required
              />
            </Formsy>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                bsStyle="primary"
                bsSize="small"
                className="pull-right"
                disabled={!this.state.canSubmit || this.props.isPosting}
                formNoValidate={true}
                onClick={this.submitForm}
              >
                {this.props.isPosting === true ? (
                  <span>
                    <Icon spin name="spinner" /> Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                bsStyle="default"
                bsSize="small"
                className="pull-right"
                onClick={this.onCancelClick}
                disabled={this.props.isPosting}
              >
                Cancel
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

AddContactForm.propTypes = propTypes
AddContactForm.defaultProps = defaultProps
