import React from "react"
import Label from "react-bootstrap/lib/Label"
import { FMS_PROOF_STATUS } from "../../constants/api"
import TooltipIcon from "../layout/TooltipIcon"

const CustomerReviewLabel = ({ value, label, lineItemId }) => {
  let bsStyle = "warning"
  let icon = null
  let tooltip = null

  if (value === FMS_PROOF_STATUS.APPROVED) {
    bsStyle = "success"
    icon = "check-circle"
    tooltip = "Accepted"
  } else if (value === FMS_PROOF_STATUS.ADDITIONAL_PROOF_NEEDED) {
    bsStyle = "success"
    icon = "exclamation-circle"
    tooltip = "Additional Proof Needed"
  } else if (value === FMS_PROOF_STATUS.NOT_APPROVED) {
    bsStyle = "success"
    icon = "times-circle"
    tooltip = "Rejected"
  }

  const modifiedLabel = (
    <>
      Response Provided.{" "}
      <TooltipIcon
        name={icon}
        text={tooltip}
        id={`customer-status-tip-${lineItemId}`}
        placement="top"
      />
    </>
  )

  return (
    <Label bsStyle={bsStyle}>{label ? modifiedLabel : "Pending Review"}</Label>
  )
}

export default CustomerReviewLabel
