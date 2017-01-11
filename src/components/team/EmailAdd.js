import React from "react"
import PropTypes from "prop-types"
import Button from "react-bootstrap/lib/Button"
import { connect } from "react-redux"
import Formsy, { addValidationRule } from "formsy-react"
import { Select, Input } from "formsy-react-components"

addValidationRule("isNonZero", (values, value) => {
  if (value > 0) {
    return true
  }

  return false
})

const propTypes = {
  onEmailSubmit: PropTypes.func.isRequired,
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

class EmailAdd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      emailTypes: [],
      canSubmit: false,
    }

    this.submitForm = this.submitForm.bind(this)
    this.enableSubmit = this.enableSubmit.bind(this)
    this.disableSubmit = this.disableSubmit.bind(this)
  }

  submitForm() {
    const data = this.myform.getModel()
    this.props.onEmailSubmit(data)
    this.myform.reset()
  }

  enableSubmit() {
    this.setState({ canSubmit: true })
  }

  disableSubmit() {
    this.setState({ canSubmit: false })
  }

  render() {
    const options = this.props.emailTypes.map(type => {
      return {
        value: type.ItemId,
        label: type.Value,
      }
    })

    options.unshift({ value: 0, label: "Select type..." })

    return (
      <div className="team-add clearfix">
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
              name="emailTypeId"
              id="emailTypeId"
              value=""
              options={options}
              validations="isNonZero"
              required
            />
          </div>
          <div className="col-sm-5">
            <Input
              name="email"
              placeholder="Email"
              type="email"
              value=""
              validations="isEmail"
              validationErrors={{
                isEmail: "Invalid, please use email@domain.com format.",
              }}
              required
            />
          </div>
          <Button
            type="submit"
            bsStyle="primary"
            bsSize="xs"
            disabled={!this.state.canSubmit}
            className="pull-right ml-sm"
          >
            Add
          </Button>
          {this.props.showCancelButton && (
            <Button
              onClick={this.props.onCancelClick}
              bsStyle="default"
              bsSize="xs"
              className="pull-right"
            >
              Cancel
            </Button>
          )}
        </Formsy>
      </div>
    )
  }
}

EmailAdd.propTypes = propTypes
EmailAdd.defaultProps = defaultProps

export default connect(getState)(EmailAdd)
