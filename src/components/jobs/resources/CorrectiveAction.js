import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
import Icon from "react-fa/lib/Icon"
import Alert from "react-bootstrap/lib/Alert"

import EmptyStateContainer from "../../../containers/EmptyStateContainer"
import { format } from "../../../utils/datetime"

require("../../../../node_modules/react-datetime/css/react-datetime.css")

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

class CorrectiveAction extends React.Component {
  render() {
    if (this.props._resource.isLoadingCorrectiveActions === true) {
      return (
        <Alert bsStyle="info">
          <Icon spin name="spinner" />
          &nbsp; Fetching corrective actions...
        </Alert>
      )
    }

    const className = "resource-corrective-actions"
    const emptyTitle = "No resource action!"
    const emptyMesg =
      "Subcontractor has not uploaded a corrective action for this resource at this time."
    const data = this.props._resource.correctiveActions[0]

    if (data === undefined || data === null) {
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

    return (
      <div className="corrective-action">
        <Row>
          <Col sm={12}>
            <p>
              <strong>Performed By:&nbsp;</strong>
              {data.PerformedBy !== null
                ? data.PerformedBy
                : data.ExternalVendor}
            </p>
            <p>
              <strong>Performed On:&nbsp;</strong>
              {format(data.PerformedOn, "l LT")}&nbsp;
              {data.SiteTimeZoneShortName}
            </p>
            <p>
              <strong>Supporting Documents:&nbsp;</strong>
              {data.IsDocumentRequired === true ? "Required" : "Not required"}
            </p>
            <p>
              <strong>Comment:&nbsp;</strong>
              {data.Comment}
            </p>
            <p className="small meta">
              Completed by&nbsp;
              <strong>{data.UpdatedBy}</strong>&nbsp; on{" "}
              {format(data.ClientCollectedOn, "l LT")}&nbsp;
              {data.SiteTimeZoneShortName}
            </p>
          </Col>
        </Row>
      </div>
    )
  }
}

CorrectiveAction.propTypes = propTypes
CorrectiveAction.defaultProps = defaultProps

export default connect(getState)(CorrectiveAction)
