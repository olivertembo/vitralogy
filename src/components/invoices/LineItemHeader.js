import React from "react"
import Panel from "react-bootstrap/lib/Panel"

const LineItemHeader = () => (
  <Panel.Body className="line-item-header">
    <div className="row">
      <div className="col-md-1">
        <strong>Line Item #</strong>
      </div>
      <div className="col-md-2">
        <strong>Service</strong>
      </div>
      <div className="col-md-1">
        <strong>Audit Status</strong>
      </div>
      <div className="col-md-2">
        <strong>Vendor</strong>
      </div>
      <div className="col-md-2">
        <strong>Proof Review</strong>
      </div>
      <div className="col-md-2">
        <strong>Info/Review</strong>
      </div>
      <div className="col-md-2">
        <strong>Proof Actions</strong>
      </div>
    </div>
  </Panel.Body>
)

export default LineItemHeader
