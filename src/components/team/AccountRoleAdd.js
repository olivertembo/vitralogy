import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Button from "react-bootstrap/lib/Button"
import Formsy, { addValidationRule } from "formsy-react"
import { Select } from "formsy-react-components"

addValidationRule("isNonZero", (values, value) => {
  if (value > 0) {
    return true
  }

  return false
})

const propTypes = {
  onRoleSubmit: PropTypes.func.isRequired,
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

class AccountRoleAdd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      canSubmit: false,
    }

    this.submitForm = this.submitForm.bind(this)
    this.enableSubmit = this.enableSubmit.bind(this)
    this.disableSubmit = this.disableSubmit.bind(this)
  }

  submitForm() {
    const data = this.myform.getModel()
    this.props.onRoleSubmit(data)
    this.myform.reset()
  }

  enableSubmit() {
    this.setState({ canSubmit: true })
  }

  disableSubmit() {
    this.setState({ canSubmit: false })
  }

  render() {
    const options = this.props.accountRoles.map(type => {
      return {
        value: type.ItemId,
        label: type.Value,
      }
    })

    options.unshift({ value: 0, label: "Select role..." })

    return (
      <div className="team-add">
        <Formsy
          onSubmit={this.submitForm}
          disabled={this.state.disabled}
          onValid={this.enableSubmit}
          onInvalid={this.disableSubmit}
          ref={input => {
            this.myform = input
          }}
        >
          <div className="col-sm-7">
            <Select
              name="roleTypeId"
              id="roleTypeId"
              value={this.state.roleTypeId}
              options={options}
              validations="isNonZero"
              required
            />
          </div>
          <div className="col-sm-5 pull-right">
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
                className="pull-right ml-sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </Formsy>
      </div>
    )
  }
}

AccountRoleAdd.propTypes = propTypes
AccountRoleAdd.defaultProps = defaultProps

export default connect(getState)(AccountRoleAdd)
