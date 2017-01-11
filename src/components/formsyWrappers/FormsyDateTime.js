import React from "react";
import { withFormsy } from "formsy-react";
import moment from "moment";
import DateTime from "react-datetime";
import ErrorMessages from "./ErrorMessages";

class FormsyDateTime extends React.Component {
  componentDidMount() {
    const { value } = this.props;
    if (value) {
      this.props.setValue(value);
    }
  }

  onChange = e => {
    if (moment.isMoment(e)) {
      this.props.setValue(e);
    }
  };

  onFocus = e => {
    const currentVal = this.props.getValue();
    if (!currentVal) {
      this.props.setValue(moment());
    }
  };

  render() {
    // const errorMessage = this.props.getErrorMessage()
    const showFeedback =
      this.props.isValid() === false && this.props.isPristine() === false;

    const { input } = this.props;

    const errorsArray = this.props.validationErrors;
    const singleError = this.props.validationError;
    let errors = null;
    if (errorsArray && errorsArray.length > 0) {
      errors = errorsArray;
    } else if (singleError) {
      const keyName = Object.keys(singleError)[0];
      errors = [singleError[keyName]];
    }

    return (
      <div
        className={`form-group row ${
          showFeedback ? "has-error has-feedback" : null
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
          <DateTime
            value={this.props.getValue()}
            input={input}
            onChange={this.onChange}
            onFocus={this.onFocus}
            closeOnSelect={this.props.closeOnSelect || false}
            isValidDate={this.props.isValidDate || true}
            timeFormat={
              this.props.timeFormat === undefined ? true : this.props.timeFormat
            }
            inputProps={this.props.inputProps}
          />
          {showFeedback ? <ErrorMessages messages={errors} /> : null}
        </div>
      </div>
    );
  }
}

export default withFormsy(FormsyDateTime);
