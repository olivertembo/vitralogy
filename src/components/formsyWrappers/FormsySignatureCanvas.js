import React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import SignatureCanvas from "react-signature-canvas"
import { withFormsy } from "formsy-react"
import ControlLabel from "./ControlLabel"
import ErrorMessages from "./ErrorMessages"

class FormsySignatureCanvas extends React.Component {
  onSignatureEnd = e => {
    const value = this.sigPad.getTrimmedCanvas()
    this.props.setValue(value)
  }

  render() {
    const layoutVertical = this.props.layout === "vertical"
    const showFeedback =
      this.props.isValid() === false && this.props.isPristine() === false

    const divClass = classNames(
      "form-group",
      { row: !layoutVertical },
      { "has-error": showFeedback },
      { "has-feedback": showFeedback },
    )

    const body = (
      <React.Fragment>
        <SignatureCanvas
          penColor="black"
          canvasProps={{ className: "formsy signature-canvas" }}
          onEnd={this.onSignatureEnd}
          ref={ref => {
            this.sigPad = ref
          }}
        />
        {showFeedback ? (
          <ErrorMessages messages={this.props.validationErrors} />
        ) : null}
      </React.Fragment>
    )

    return (
      <div className={divClass}>
        <ControlLabel
          required={this.props.required}
          name={this.props.name}
          label={this.props.label}
          layout={this.props.layout}
        />
        {layoutVertical ? body : <div className="col-sm-9">{body}</div>}
      </div>
    )
  }
}

FormsySignatureCanvas.propTyps = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  layout: PropTypes.oneOf[("horizontal", "vertical", "elementOnly")],
}

FormsySignatureCanvas.defaultProps = {
  layout: "horizontal",
  label: "",
}

export default withFormsy(FormsySignatureCanvas)
