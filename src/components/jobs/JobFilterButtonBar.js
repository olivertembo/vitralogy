import React from "react"
import { connect } from "react-redux"
import Button from "react-bootstrap/lib/Button"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import ButtonGroup from "react-bootstrap/lib/ButtonGroup"
import Icon from "react-fa/lib/Icon"
import Tooltip from "antd/lib/tooltip"

import JobTypeHelp from "./JobTypeHelp"
import * as api from "../../constants/api"
import { updateJobFilters, filterButtonChanged } from "../../actions/jobFilters"

const getState = state => {
  return {
    _jobs: { ...state.jobFilters },
  }
}

const getActions = dispatch => {
  return {
    updateJobFilters: filters => dispatch(updateJobFilters(filters)),
    filterButtonChanged: buttonId => dispatch(filterButtonChanged(buttonId)),
  }
}

class JobFilterButtonBar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filterType: null,
      showJobTypeHelp: false,
    }

    this.setFiltersByType = this.setFiltersByType.bind(this)
  }

  componentDidMount() {
    this.setButtonActive()
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      JSON.stringify(this.props.jobFilters) !==
      JSON.stringify(prevProps.jobFilters)
    ) {
      this.setButtonActive()
    }
  }

  showJobTypeHelp = () => {
    this.setState({ showJobTypeHelp: !this.state.showJobTypeHelp })
  }

  setFiltersByType(type) {
    const filters = Object.assign({}, this.props._jobs.jobFilters)

    if (type === api.JOB_FILTERS.ACTIVE) {
      // Active jobs
      filters.isLive = true
      filters.isComplete = false
      filters.isCancelled = false
      filters.isPendingDataEntry = null
    } else if (type === api.JOB_FILTERS.UPCOMING) {
      // Upcoming jobs
      filters.isLive = false
      filters.isComplete = false
      filters.isCancelled = false
      filters.isPendingDataEntry = null
    } else if (type === api.JOB_FILTERS.COMPLETED) {
      // Completed jobs
      filters.isLive = null
      filters.isComplete = true
      filters.isCancelled = false
      filters.isPendingDataEntry = null
    } else if (type === api.JOB_FILTERS.CANCELED) {
      // Canceled jobs
      filters.isLive = null
      filters.isComplete = false
      filters.isCancelled = true
      filters.isPendingDataEntry = null
    } else if (type === api.JOB_FILTERS.PENDING_DATA_ENTRY) {
      // Pending data entry jobs
      filters.isLive = true
      filters.isComplete = null
      filters.isCancelled = false
      filters.isPendingDataEntry = true
    }

    this.props.updateJobFilters(filters)
    this.props.filterButtonChanged(type)
  }

  setButtonActive() {
    let selectedButtonId = 0
    const {
      isLive,
      isComplete,
      isCancelled,
      isPendingDataEntry,
    } = this.props._jobs.jobFilters

    if (
      isLive === true &&
      isComplete === false &&
      isCancelled === false &&
      isPendingDataEntry === null
    ) {
      selectedButtonId = api.JOB_FILTERS.ACTIVE
    } else if (
      isLive === false &&
      isComplete === false &&
      isCancelled === false &&
      isPendingDataEntry === null
    ) {
      selectedButtonId = api.JOB_FILTERS.UPCOMING
    } else if (
      isLive === null &&
      isComplete === true &&
      isCancelled === false &&
      isPendingDataEntry === null
    ) {
      selectedButtonId = api.JOB_FILTERS.COMPLETED
    } else if (
      isLive === null &&
      isComplete === false &&
      isCancelled === true &&
      isPendingDataEntry === null
    ) {
      selectedButtonId = api.JOB_FILTERS.CANCELED
    } else if (
      isLive === true &&
      isCancelled === false &&
      isPendingDataEntry === true
    ) {
      selectedButtonId = api.JOB_FILTERS.PENDING_DATA_ENTRY
    }

    this.props.filterButtonChanged(selectedButtonId)
  }

  render() {
    const {
      activeFilterButton,
      jobsIsLoading,
      jobsPageIsChanging,
    } = this.props._jobs
    const { TotalCount } = this.props._jobs.jobs

    return (
      <div className="job-filter-button-bar">
        <ButtonToolbar>
          <ButtonGroup>
            <Tooltip
              placement="top"
              title={`Click to filter jobs that are open and in progress`}
            >
              <Button
                onClick={() => this.setFiltersByType(api.JOB_FILTERS.ACTIVE)}
                active={activeFilterButton === api.JOB_FILTERS.ACTIVE}
                disabled={jobsIsLoading}
              >
                <Icon name="briefcase" /> Active{" "}
                {(activeFilterButton === api.JOB_FILTERS.ACTIVE &&
                  !jobsIsLoading) ||
                (activeFilterButton === api.JOB_FILTERS.ACTIVE &&
                  jobsPageIsChanging)
                  ? `(${TotalCount})`
                  : null}
              </Button>
            </Tooltip>

            <Tooltip
              placement="bottom"
              title={`Click to filter jobs not yet started`}
            >
              <Button
                onClick={() => this.setFiltersByType(api.JOB_FILTERS.UPCOMING)}
                active={activeFilterButton === api.JOB_FILTERS.UPCOMING}
                disabled={jobsIsLoading}
              >
                <Icon name="calendar" /> Upcoming{" "}
                {(activeFilterButton === api.JOB_FILTERS.UPCOMING &&
                  !jobsIsLoading) ||
                (activeFilterButton === api.JOB_FILTERS.UPCOMING &&
                  jobsPageIsChanging)
                  ? `(${TotalCount})`
                  : null}
              </Button>
            </Tooltip>

            <Tooltip
              placement="top"
              title={`Click to filter jobs that are finished`}
            >
              <Button
                onClick={() => this.setFiltersByType(api.JOB_FILTERS.COMPLETED)}
                active={activeFilterButton === api.JOB_FILTERS.COMPLETED}
                disabled={jobsIsLoading}
              >
                <Icon name="check" /> Completed{" "}
                {(activeFilterButton === api.JOB_FILTERS.COMPLETED &&
                  !jobsIsLoading) ||
                (activeFilterButton === api.JOB_FILTERS.COMPLETED &&
                  jobsPageIsChanging)
                  ? `(${TotalCount})`
                  : null}
              </Button>
            </Tooltip>

            <Tooltip
              placement="bottom"
              title={`Click to filter jobs that have been rescinded`}
            >
              <Button
                onClick={() => this.setFiltersByType(api.JOB_FILTERS.CANCELED)}
                active={activeFilterButton === api.JOB_FILTERS.CANCELED}
                disabled={jobsIsLoading}
              >
                <Icon name="ban" /> Canceled{" "}
                {(activeFilterButton === api.JOB_FILTERS.CANCELED &&
                  !jobsIsLoading) ||
                (activeFilterButton === api.JOB_FILTERS.CANCELED &&
                  jobsPageIsChanging)
                  ? `(${TotalCount})`
                  : null}
              </Button>
            </Tooltip>

            <Tooltip
              placement="bottom"
              title={`Click to filter jobs that have been completed by Vitralogy Support on the subcontractor's behalf but are awaiting data entry and signoff`}
            >
              <Button
                onClick={() =>
                  this.setFiltersByType(api.JOB_FILTERS.PENDING_DATA_ENTRY)
                }
                active={
                  activeFilterButton === api.JOB_FILTERS.PENDING_DATA_ENTRY
                }
                disabled={jobsIsLoading}
              >
                <Icon name="hourglass-half" /> Pending Data Entry{" "}
                {(activeFilterButton === api.JOB_FILTERS.PENDING_DATA_ENTRY &&
                  !jobsIsLoading) ||
                (activeFilterButton === api.JOB_FILTERS.PENDING_DATA_ENTRY &&
                  jobsPageIsChanging)
                  ? `(${TotalCount})`
                  : null}
              </Button>
            </Tooltip>

            <Button bsStyle="link" onClick={this.showJobTypeHelp}>
              <span className="meta">Need help with these job types?</span>
            </Button>
          </ButtonGroup>
        </ButtonToolbar>

        {this.state.showJobTypeHelp && (
          <JobTypeHelp
            show={this.state.showJobTypeHelp}
            onHide={this.showJobTypeHelp}
          />
        )}
      </div>
    )
  }
}

export default connect(
  getState,
  getActions,
)(JobFilterButtonBar)
