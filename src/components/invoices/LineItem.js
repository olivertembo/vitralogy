import React from "react"
import Panel from "react-bootstrap/lib/Panel"
import Label from "react-bootstrap/lib/Label"
import SplitButton from "react-bootstrap/lib/SplitButton"
import MenuItem from "react-bootstrap/lib/MenuItem"
import Icon from "react-fa/lib/Icon"
import ProofStatusLabel from "./ProofStatusLabel"
import CustomerReviewLabel from "./CustomerReviewLabel"
import { FMS_AUDIT_STATUS, FMS_PROOF_STATUS } from "../../constants/api"

const LineItem = ({
  item,
  indexes,
  onActionClick,
  onCommentsClick,
  disabled,
}) => {
  const {
    lineItemNumber,
    service,
    auditStatus,
    auditStatusId,
    proofStatus,
    proofStatusId,
    commentCount,
    finalStatus,
    finalStatusId,
    customerStatusId,
    customerStatus,
    lineItemId,
    isPreferredRequirementSatisfied: preferredValid,
  } = item
  const hasComments = commentCount > 0

  const approvedDisabled =
    disabled || customerStatusId === FMS_PROOF_STATUS.APPROVED
  const notApprovedDisabled =
    disabled || customerStatusId === FMS_PROOF_STATUS.NOT_APPROVED
  const additionalDisabled =
    disabled || customerStatusId === FMS_PROOF_STATUS.ADDITIONAL_PROOF_NEEDED

  const selectActions = (
    <SplitButton
      id="action-dropdown"
      title={"View proof"}
      bsSize="xsmall"
      value="1"
      onClick={e => {
        onActionClick(indexes, -1)
      }}
    >
      <MenuItem
        value="2"
        onClick={() => {
          if (!approvedDisabled) {
            onActionClick(indexes, FMS_PROOF_STATUS.APPROVED)
          }
        }}
        disabled={approvedDisabled}
      >
        Approve
      </MenuItem>
      <MenuItem
        value="2"
        onClick={() => {
          if (!notApprovedDisabled) {
            onActionClick(indexes, FMS_PROOF_STATUS.NOT_APPROVED)
          }
        }}
        disabled={notApprovedDisabled}
      >
        Reject
      </MenuItem>
      <MenuItem
        value="2"
        onClick={() => {
          if (!additionalDisabled) {
            onActionClick(indexes, FMS_PROOF_STATUS.ADDITIONAL_PROOF_NEEDED)
          }
        }}
        disabled={additionalDisabled}
      >
        Request Additional Proof
      </MenuItem>
    </SplitButton>
  )

  return (
    <Panel.Body className="line-item">
      <div className="row">
        {/* line item number */}
        <div className="col-md-1">{lineItemNumber}</div>
        {/* service row */}
        <div className="col-md-2">{service}</div>
        {/* status of the audit */}
        <div className="col-md-1">
          <Label
            bsStyle={
              auditStatusId === FMS_AUDIT_STATUS.VALID ? "success" : "danger"
            }
          >
            {auditStatus}
          </Label>
        </div>
        {/* proof / status of customer combination, plus comment thread */}

        <div className="col-md-2">
          {auditStatusId !== FMS_AUDIT_STATUS.VALID && (
            <ProofStatusLabel
              value={proofStatusId}
              label={proofStatus}
              preferredValid={preferredValid}
            />
          )}
        </div>
        <div className="col-md-2">
          <Label
            bsStyle={
              finalStatusId === 15
                ? "success"
                : finalStatusId === 16
                ? "danger"
                : "warning"
            }
          >
            {finalStatus}
          </Label>
        </div>
        <div className="col-md-2">
          {auditStatusId !== FMS_AUDIT_STATUS.VALID && (
            <>
              <CustomerReviewLabel
                value={customerStatusId}
                label={customerStatus}
                lineItemId={lineItemId}
              />{" "}
              <Icon
                name="comments"
                className={hasComments ? "icon-info" : ""}
                onClick={() => {
                  onCommentsClick(indexes)
                }}
              />
            </>
          )}
        </div>
        {/* dropdown for actions */}
        {auditStatusId !== FMS_AUDIT_STATUS.VALID && (
          <div className="col-md-2">{selectActions}</div>
        )}
      </div>
    </Panel.Body>
  )
}

export default LineItem
