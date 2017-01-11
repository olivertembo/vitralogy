import React from "react"
import PropTypes from "prop-types"
import Button from "react-bootstrap/lib/Button"
import { format } from "../../../../utils/datetime"
const propTypes = {}

const defaultProps = {}

export default class DataFormSubmissionList extends React.Component {
  render() {
    {
      /* Empty state */
    }
    if (this.props.submissions.length === 0) {
      return <div>No submitted forms yet.</div>
    }

    const submittedForms = this.props.submissions.map(item => {
      return (
        <li key={item.JobFormResultId}>
          <Button
            bsStyle="link"
            onClick={() => {
              this.props.onSubmissionSelected(item)
            }}
          >
            {item.TemplateName}
          </Button>
          <br /> {/* add timezone */}
          <span className="placeholder">
            {item.CreatedBy}, {format(item.CollectedOn, "l [at] LT")}
          </span>
        </li>
      )
    })

    return (
      <div className="data-form-submission-list">
        <ul>{submittedForms}</ul>
      </div>
    )
  }
}

DataFormSubmissionList.propTypes = propTypes
DataFormSubmissionList.defaultProps = defaultProps
