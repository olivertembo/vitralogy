import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"

const InvoiceLoader = ({ msg }) => (
  <div className="invoice-loader">
    <div className="loading">
      <Icon spin size="5x" name="spinner" />
      <h1 className="mb-sm">Please Wait</h1>
      <p>{msg}</p>
    </div>
  </div>
)

InvoiceLoader.propTypes = {
  msg: PropTypes.string,
}
InvoiceLoader.defaultProps = {
  msg: "Loading...",
}

export default InvoiceLoader
