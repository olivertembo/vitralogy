import React from "react"
import Icon from "react-fa/lib/Icon"

const ProofLoader = ({ msg }) => (
  <div className="proof-loader">
    <div className="loading">
      <Icon spin size="5x" name="spinner" />
      <h1 className="mb-sm">Please Wait</h1>
      <p>{msg}</p>
    </div>
  </div>
)

ProofLoader.defaultProps = {
  msg: "Loading proof requirements...",
}

export default ProofLoader
