import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"

import OverlayButton from "../../layout/OverlayButton"
import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import { format } from "../../../utils/datetime"

const propTypes = {
  _resource: PropTypes.object.isRequired,
}

const defaultProps = {}

const getState = state => {
  return {
    _resource: {
      ...state.resources,
    },
  }
}

class CorrectiveActionDocuments extends React.Component {
  render() {
    if (this.props._resource.isLoadingCorrectiveActions === true) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />
          &nbsp;Fetching corrective documents...
        </Alert>
      )
    }

    const className = "resource-corrective-action-documents"
    const emptyTitle = "No resource action documents!"
    const emptyMesg =
      "Subcontractor has not uploaded corrective action documents for this resource at this time."
    const data = this.props._resource.correctiveDocuments

    if (data === undefined || data.length === 0) {
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={emptyTitle}
            message={emptyMesg}
          />
        </div>
      )
    }

    const submittedDocuments = this.props._resource.correctiveDocuments.map(
      item => {
        return (
          <li key={item.JobSourcingTierCorrectiveDocumentId}>
            <OverlayButton
              bsStyle={"link"}
              glyph={item.IsPhoto ? "picture" : "file"}
              disabled={false}
              text={item.FileName}
              onClick={() =>
                this.props.auth.downloadFile(item.Url, item.FileName)
              }
            >
              &nbsp;
              {item.FileName}
            </OverlayButton>
            <span className="placeholder">
              {item.CreatedBy}, {format(item.PerformedOn, "l [at] LT")}&nbsp;
              {item.SiteTimeZoneShortName}
            </span>
          </li>
        )
      },
    )

    return (
      <div className={className}>
        <ul className="list-unstyled">{submittedDocuments}</ul>
      </div>
    )
  }
}

CorrectiveActionDocuments.propTypes = propTypes
CorrectiveActionDocuments.defaultProps = defaultProps

export default connect(getState)(CorrectiveActionDocuments)
