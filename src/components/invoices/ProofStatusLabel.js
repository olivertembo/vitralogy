import React from "react"
import Label from "react-bootstrap/lib/Label"
import { FMS_PROOF_STATUS } from "../../constants/api"

const ProofStatusLabel = ({ value, label, preferredValid }) => {
  let bsStyle = "warning"
  if (value === FMS_PROOF_STATUS.PROOF_PROVIDED_DONE) {
    bsStyle = "success"
  } else if (value === FMS_PROOF_STATUS.NO_PROOF_PROVIDED) {
    bsStyle = "danger"
  }
  return (
    <Label bsStyle={bsStyle}>
      {preferredValid &&
      (value === FMS_PROOF_STATUS.PROOF_PROVIDED_DONE ||
        value === FMS_PROOF_STATUS.PROOF_PROVIDED)
        ? "Preferred "
        : ""}
      {label || "Pending Proof."}
    </Label>
  )
}

export default ProofStatusLabel
