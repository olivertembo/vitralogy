import React from "react"
import PropTypes from "prop-types"
import { withFormsy } from "formsy-react"
import { Typeahead } from "react-bootstrap-typeahead"
import ErrorMessages from "./ErrorMessages"

import "react-bootstrap-typeahead/css/Typeahead.css"

const propTypes = {
  placeholder: PropTypes.string,
  multiple: PropTypes.bool,
  options: PropTypes.array.isRequired,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  getValue: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  getErrorMessage: PropTypes.func.isRequired,
  isValid: PropTypes.func.isRequired,
  isPristine: PropTypes.func.isRequired,
  validationErrors: PropTypes.object.isRequired,
}

const defaultProps = {
  placeholder: "",
  multiple: false,
  required: false,
  label: "",
}

class FormsyTypeahead extends React.Component {
  onChange = selected => {
    if (selected.length > 0) {
      this.props.setValue(selected)
    } else {
      this.props.setValue(undefined)
    }
  }

  render() {
    const showFeedback =
      this.props.isValid() === false && this.props.isPristine() === false

    const { options, multiple, placeholder } = this.props

    return (
      <div
        className={`form-group row${
          showFeedback ? " has-error has-feedback" : ""
        }`}
      >
        <label
          className="control-label col-sm-3"
          data-required={this.props.required}
          htmlFor={this.props.name}
        >
          {this.props.label}
          {this.props.required && <span className="required-symbol"> *</span>}
        </label>
        <div className="col-sm-9">
          <Typeahead
            placeholder={placeholder}
            multiple={multiple}
            onChange={this.onChange}
            options={options}
            selected={this.props.getValue() || []}
          />
          {showFeedback ? (
            <ErrorMessages messages={this.props.validationErrors} />
          ) : null}
        </div>
      </div>
    )
  }
}

FormsyTypeahead.propTypes = propTypes
FormsyTypeahead.defaultProps = defaultProps

export default withFormsy(FormsyTypeahead)
