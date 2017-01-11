import React from "react"

const ControlLabel = ({ layout, required, name, label }) => (
  <label
    className={`control-label${layout !== "vertical" ? " col-sm-3" : ""}`}
    data-required={required}
    htmlFor={name}
  >
    {label}
    {required && <span className="required-symbol"> *</span>}
  </label>
)

export default ControlLabel
