import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"

import { ReactComponent as RightArrowIcon } from "../../assets/icons/brand/arrow-right.svg"

const propTypes = {
  flags: PropTypes.object.isRequired,
  _resource: PropTypes.object.isRequired,
}

const defaultProps = {}

const getState = state => {
  return {
    _resource: { ...state.resources },
  }
}

class ResourceProgress extends React.Component {
  render() {
    const selected = this.props._resource.selected.value
    const checklistClass =
      selected.CheckListIAgreeCount === 0 ? "incomplete" : "complete"
    const dataFormsClass = selected.FormCount === 0 ? "" : "complete"
    const photosClass = selected.PhotoCount === 0 ? "" : "in-progress"
    const documentsClass = selected.DocumentCount === 0 ? "" : "in-progress"
    const correctiveActionClass =
      selected.CorrectiveActionCount === 0 ? "incomplete" : "complete"
    const conclusionClass =
      selected.ConclusionCount === 0 ? "incomplete" : "complete"

    return (
      <ul className="job-progress-bar">
        {/* Data forms and its separator */
        this.props.flags.IsCheckList && (
          <li className={checklistClass}>Checklist</li>
        )}
        {this.props.flags.IsCheckList && <RightArrowIcon  className="separator" />}
        {/* New job forms and its separator */
        this.props.flags.IsDataCollectionRequired && (
          <li className={dataFormsClass}>Forms ({selected.FormCount})</li>
        )}
        {this.props.flags.IsDataCollectionRequired && (
          <RightArrowIcon  className="separator" />
        )}

        <li className={photosClass}>Photos ({selected.PhotoCount})</li>
        <RightArrowIcon  className="separator" />
        <li className={documentsClass}>Documents ({selected.DocumentCount})</li>
        <RightArrowIcon  className="separator" />
        {/* Corrective action and its separator */
        this.props.flags.IsCorrectiveAction && (
          <li className={correctiveActionClass}>Corrective Action</li>
        )}
        {this.props.flags.IsCorrectiveAction && <RightArrowIcon  className="separator" />}
        <li className={conclusionClass}>Result</li>
      </ul>
    )
  }
}

ResourceProgress.propTypes = propTypes
ResourceProgress.defaultProps = defaultProps

export default connect(getState)(ResourceProgress)
