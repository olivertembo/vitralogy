import React from "react"
import PropTypes from "prop-types"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import { withFormsy } from "formsy-react"
import { useDropzone } from "react-dropzone"
import ErrorMessages from "./ErrorMessages"

const propTypes = {
  multiple: PropTypes.bool,
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
  multiple: false,
  required: false,
  label: "",
  accept: "image/*",
}

const baseStyle = {
  // width: 460,
  height: 50,
  borderWidth: 1,
  borderColor: "#c8c8c8",
  borderStyle: "dashed",
}

const activeStyle = {
  borderStyle: "solid",
  borderColor: "#6c6",
  backgroundColor: "#eee",
}

const acceptStyle = {
  borderStyle: "solid",
  borderColor: "#00e676",
}

const rejectStyle = {
  borderStyle: "solid",
  borderColor: "#ff1744",
}

function FormsyDropzone({
  name,
  required,
  label,
  setValue,
  getValue,
  isValid,
  isPristine,
  validationErrors,
  accept,
}) {
  const onDrop = React.useCallback(files => {
    setValue(files)
  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open,
  } = useDropzone({ onDrop, accept })

  const style = React.useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject],
  )

  const rootProps = getRootProps({
    // disable click and keydown behavior for having browse button
    onClick: event => event.stopPropagation(),
    onKeyDown: event => {
      if (event.keyCode === 32 || event.keyCode === 13) {
        event.stopPropagation()
      }
    },
    style,
  })

  const showFeedback = isValid() === false && isPristine() === false
  const formsyValue = getValue() || []
  const fileItems = formsyValue.map(file => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ))

  return (
    <div
      className={`form-group row${
        showFeedback ? " has-error has-feedback" : ""
      }`}
    >
      <label
        className="control-label col-sm-3"
        data-required={required}
        htmlFor={name}
      >
        {label}
        {required && <span className="required-symbol"> *</span>}
      </label>
      <div className="col-sm-9">
        <section>
          <div {...rootProps}>
            <input {...getInputProps()} />
            <p className="mt-md text-center">
              <Icon name="cloud-upload" /> Drop files to attach, or{" "}
              <Button bsStyle="link" className="btn-anchor" onClick={open}>
                browse
              </Button>
              .
            </p>
          </div>
          <aside>
            <ul>{fileItems}</ul>
          </aside>
        </section>
      </div>
      {showFeedback ? <ErrorMessages messages={validationErrors} /> : null}
    </div>
  )
}

FormsyDropzone.propTypes = propTypes
FormsyDropzone.defaultProps = defaultProps

export default withFormsy(FormsyDropzone)
