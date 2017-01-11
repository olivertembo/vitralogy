import React from "react"
import ModalPopup from "../layout/ModalPopup"

const JobTypeHelp = ({ show, onHide }) => {
  return (
    <ModalPopup
      show={show}
      title="Job Type Definitions"
      className="job-type-help"
      onHide={onHide}
    >
      <p>
        <strong>Active:</strong> Open and in progress jobs.
      </p>
      <p>
        <strong>Upcoming:</strong> Jobs that have not yet started.
      </p>
      <p>
        <strong>Completed:</strong> Jobs completed that are now closed.
      </p>
      <p>
        <strong>Canceled:</strong> Jobs that have been canceled and are no
        longer being handled.
      </p>
      <p>
        <strong>Pending Data Entry:</strong> Jobs completed by Vitralogy's
        support team on the subcontractor's behalf, but still require missing
        job data and sign off.
      </p>
    </ModalPopup>
  )
}

export default JobTypeHelp
