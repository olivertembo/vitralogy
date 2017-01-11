import React from "react"
import FroalaEditor from 'react-froala-wysiwyg'
import { withFormsy } from "formsy-react"
import ErrorMessages from "./ErrorMessages"

class FormsyFroala extends React.Component {
  constructor(props) {
    super(props)

    // if props.editorConfig is undefined, set defaults
    this.editorConfig = props.editorConfig || {
      key: props.licenseKey || "",
      placeholderText: props.placeholder || "",
      heightMin: 250,
      heightMax: 250,
      charCharacterCount: true,
      toolbarButtons: [
        "undo",
        "redo",
        "|",
        "bold",
        "italic",
        "underline",
        "outdent",
        "indent",
        "clearFormatting",
      ],
      pluginsEnabled: [""],
      events: {
        "froalaEditor.blur": this.onBlur,
      },
    }
  }

  onModelChange = e => {
    this.props.setValue(e)
  }

  onBlur = (e, editor) => {
    this.props.setValue(e.target.value)
  }

  render() {
    /* todo, custom validation to strip html for text length */
    const showFeedback =
      this.props.isValid() === false && this.props.isPristine() === false

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
          <FroalaEditor
            config={this.editorConfig}
            model={this.props.getValue() || ""}
            onModelChange={this.onModelChange}
            tag="textarea"
          />
          {showFeedback ? (
            <ErrorMessages messages={this.props.validationErrors} />
          ) : null}
        </div>
      </div>
    )
  }
}

export default withFormsy(FormsyFroala)
