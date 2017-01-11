import React from "react"
import PropTypes from "prop-types"
import moment from "moment"

const propTypes = {
  result: PropTypes.object.isRequired,
  discrepancy: PropTypes.string.isRequired,
}

const ResultSummary = props => {
  const {
    resultName,
    resultForName,
    createdByName,
    datetime,
    comment,
  } = props.result
  const {
    discrepancy,
    isRecurrenceEvaluationRequired,
    recurrenceReferenceDate,
  } = props

  return (
    <div>
      <div className="row">
        <label className="control-label col-sm-4">Result</label>
        <div className="col-sm-8">{resultName}</div>
      </div>
      <div className="row">
        <label className="control-label col-sm-4">On Behalf Of</label>
        <div className="col-sm-8">{resultForName}</div>
      </div>
      <div className="row">
        <label className="control-label col-sm-4">Submitted By</label>
        <div className="col-sm-8">{createdByName}</div>
      </div>
      <div className="row">
        <label className="control-label col-sm-4">Date/Time</label>
        <div className="col-sm-8">
          {moment(
            isRecurrenceEvaluationRequired && recurrenceReferenceDate
              ? recurrenceReferenceDate
              : datetime,
          ).format("MM/DD/YYYY hh:mm A")}
        </div>
      </div>
      <div className="row">
        <label className="control-label col-sm-4">Comment</label>
        <div className="col-sm-8">{comment}</div>
      </div>
      {discrepancy !== null && (
        <div className="row">
          <label className="control-label col-sm-4">
            Reason for Correction
          </label>
          <div className="col-sm-8">{discrepancy}</div>
        </div>
      )}
    </div>
  )
}

ResultSummary.propTypes = propTypes

export default ResultSummary
