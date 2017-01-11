import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Icon from "react-fa/lib/Icon"
import Button from "react-bootstrap/lib/Button"
import { resetDateFilter, clearJobFilters } from "../actions/jobFilters"
import {
  resetSupportDateFilter,
  clearSupportJobFilters,
} from "../actions/support"

const propTypes = {
  clearJobFilters: PropTypes.func,
  resetDateFilter: PropTypes.func,

  clearSupportJobFilters: PropTypes.func,
  resetSupportDateFilter: PropTypes.func,
  supportJobs: PropTypes.bool,
}

const getActions = dispatch => {
  return {
    // regular jobs
    resetDateFilter: () => dispatch(resetDateFilter()),
    clearJobFilters: () => dispatch(clearJobFilters()),

    // support jobs
    resetSupportDateFilter: () => dispatch(resetSupportDateFilter()),
    clearSupportJobFilters: () => dispatch(clearSupportJobFilters()),
  }
}

class NoJobsContainer extends React.Component {
  render() {
    return (
      <div className="no-jobs-container">
        <i className="fa fa-frown-o fa-5x" />
        <h3>No {this.props.supportJobs ? "Support " : ""}Jobs!</h3>
        <p>Maybe check the applied filters?</p>
        <p className="meta">
          Set your&nbsp;
          <Button
            bsSize="small"
            onClick={() => {
              this.props.supportJobs
                ? this.props.resetSupportDateFilter()
                : this.props.resetDateFilter()
            }}
          >
            <Icon name="calendar" /> date range
          </Button>
          &nbsp;to a more active one or even&nbsp;
          <Button
            bsSize="small"
            onClick={() => {
              this.props.supportJobs
                ? this.props.clearSupportJobFilters()
                : this.props.clearJobFilters()
            }}
          >
            <Icon name="filter" /> clear all
          </Button>
          &nbsp;of them!
        </p>
      </div>
    )
  }
}

NoJobsContainer.propTypes = propTypes

export default connect(
  null,
  getActions,
)(NoJobsContainer)
