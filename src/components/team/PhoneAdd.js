import React from "react"
import PropTypes from "prop-types"
import Button from "react-bootstrap/lib/Button"
import { connect } from "react-redux"
import Formsy, { addValidationRule } from "formsy-react"
import { Select, Input } from "formsy-react-components"
import { parse as phoneParse, isValidNumber } from "libphonenumber-js"

addValidationRule("isPhone", (values, value) => {
  if (value === "" || value === undefined) {
    return false
  }

  try {
    const phoneNumber = phoneParse(value, "US")
    const result = isValidNumber(phoneNumber)
    return result
  } catch (e) {
    return false
  }
})

addValidationRule("isNonZero", (values, value) => {
  if (value > 0) {
    return true
  }

  return false
})

const propTypes = {
  onPhoneSubmit: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
  showCancelButton: PropTypes.bool,
}

const defaultProps = {
  showCancelButton: false,
}

const getState = state => {
  return {
    ...state.lookups,
  }
}

class PhoneAdd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      phoneTypes: [],
      canSubmit: false,
    }

    this.submitForm = this.submitForm.bind(this)
    this.enableSubmit = this.enableSubmit.bind(this)
    this.disableSubmit = this.disableSubmit.bind(this)
  }

  submitForm() {
    const data = this.myform.getModel()
    this.props.onPhoneSubmit(data)
  }

  enableSubmit() {
    this.setState({ canSubmit: true })
  }

  disableSubmit() {
    this.setState({ canSubmit: false })
  }

  render() {
    const options = this.props.phoneTypes.map(type => {
      return {
        value: type.ItemId,
        label: type.Value,
      }
    })

    options.unshift({ value: 0, label: "Select type..." })

    return (
      <div className="team-add clearfix mb-lg">
        <Formsy
          onSubmit={this.submitForm}
          disabled={this.state.disabled}
          onValid={this.enableSubmit}
          onInvalid={this.disableSubmit}
          ref={input => {
            this.myform = input
          }}
        >
          <div className="col-sm-5">
            <Select
              name="phoneTypeId"
              id="phoneTypeId"
              value={this.state.phoneTypeId}
              options={options}
              validations="isNonZero"
              required
            />
          </div>
          <div className="col-sm-5">
            <Input
              name="phone"
              placeholder="Phone"
              type="text"
              value={this.state.phone}
              validations="isPhone"
              validationErrors={{
                isPhone: "Invalid, please use 123-456-2134 format.",
              }}
              required
            />
          </div>
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="xs"
            className="pull-right ml-sm"
            disabled={!this.state.canSubmit}
            formNoValidate={true}
          >
            Add
          </Button>
          {this.props.showCancelButton && (
            <Button
              bsStyle="default"
              bsSize="xs"
              className="pull-right"
              onClick={this.props.onCancelClick}
            >
              Cancel
            </Button>
          )}
        </Formsy>
      </div>
    )
  }
}

PhoneAdd.propTypes = propTypes
PhoneAdd.defaultProps = defaultProps

export default connect(getState)(PhoneAdd)
