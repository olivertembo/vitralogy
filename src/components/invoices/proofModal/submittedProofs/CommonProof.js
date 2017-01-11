import React from "react"
import Button from "react-bootstrap/lib/Button"
import { format } from "../../../../utils/datetime"

const CommonProof = ({
  proofItemId,
  validationStatus,
  uploadedOn,
  timeZone,
  uploadedBy,
  description,
  isDeleted,
  serial,
  children,
  comment,
  onDeleteProof,
  disabled,
}) => (
  <div className="submitted-proofs">
    <dl className="dl-horizontal">
      <dt>Uploaded by</dt>
      <dd>{uploadedBy}</dd>
      <dt>Uploaded on</dt>
      <dd>
        {format(uploadedOn, "MM/DD/YYYY hh:mm A")} {timeZone}
      </dd>
      <dt>Description</dt>
      <dd>{description}</dd>
      {children}
      <hr />
      <dt>Comment</dt>
      <dd>{comment}</dd>
    </dl>
    {isDeleted === false && disabled === false && (
      <Button
        bsStyle="danger"
        onClick={() => {
          onDeleteProof(proofItemId)
        }}
      >
        Delete
      </Button>
    )}
  </div>
)

export default CommonProof
