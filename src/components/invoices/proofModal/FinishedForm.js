import React from "react"
import Button from "react-bootstrap/lib/Button"

function FinishedForm({ onHide }) {
  const handleDoneClick = () => onHide(true)

  return (
    <div className="form-inline">
      <Button onClick={handleDoneClick}>Done</Button>
    </div>
  )
}

export default FinishedForm
