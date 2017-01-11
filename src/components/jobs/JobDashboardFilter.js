import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { SingleDatePicker } from "react-dates"
import moment from "moment"
import Icon from "react-fa/lib/Icon"
import Button from "react-bootstrap/lib/Button"
import Input from "antd/lib/input"
import Tooltip from "antd/lib/tooltip"
import DebounceInput from "react-debounce-input"

import * as api from "../../constants/api"
import FilterItemContainer from "../../containers/FilterItemContainer"
import { updateJobFilters, clearJobFilters } from "../../actions/jobFilters"

const InputGroup = Input.Group

const propTypes = {
  _jobs: PropTypes.object.isRequired,
  updateJobFilters: PropTypes.func.isRequired,
  clearJobFilters: PropTypes.func.isRequired,
}

const defaultProps = {}

const getState = state => {
  return {
    _jobs: { ...state.jobFilters },
  }
}

const getActions = dispatch => {
  return {
    updateJobFilters: filters => dispatch(updateJobFilters(filters)),
    clearJobFilters: () => dispatch(clearJobFilters()),
  }
}

class JobDashboardFilter extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      startFocusedInput: false,
      endFocusedInput: false,

      filters: {
        startDate: moment(new Date().setDate(new Date().getDate() - 9)),
        endDate: moment(new Date().setDate(new Date().getDate() + 9)),
        isEtaOrSchedDate: true,
        dateFilterType: "range", // can be 'range' or 'between'
        rangeStart: "-9",
        rangeEnd: "9",

        byProjectNumber: "",
        byJobNumber: "",
        byJobType: "",
        isLive: true,
        isComplete: false,
        isCancelled: false,
        byStatusId: [0, 1, 2, 3],
        byPriorityId: [0, 1, 2],
        isCorrectiveAction: null,
        isJobLate: null,
        isPendingDataEntry: null,

        byAddress: "",
        byCity: "",
        byZip: "",

        byVendor: "",
        byProgressId: [0, 1, 2, 3, 4, 5],
        isVendorLate: null,
      },
    }

    this.resetFilter = this.resetFilter.bind(this)
    this.onFiltersApplyClick = this.onFiltersApplyClick.bind(this)
    this.onFocusChange = this.onFocusChange.bind(this)
    this.onStartDateChange = this.onStartDateChange.bind(this)
    this.onEndDateChange = this.onEndDateChange.bind(this)
    this.onDateColumnFilter = this.onDateColumnFilter.bind(this)
    this.onFilterSiteChange = this.onFilterSiteChange.bind(this)
    this.onSaveSiteTerm = this.onSaveSiteTerm.bind(this)
    this.onFilterCityChange = this.onFilterCityChange.bind(this)
    this.onSaveCityTerm = this.onSaveCityTerm.bind(this)
    this.onFilterZipChange = this.onFilterZipChange.bind(this)
    this.onSaveZipTerm = this.onSaveZipTerm.bind(this)
    this.onFilterProjectNumChange = this.onFilterProjectNumChange.bind(this)
    this.onSaveProjectNumTerm = this.onSaveProjectNumTerm.bind(this)
    this.onFilterJobNumChange = this.onFilterJobNumChange.bind(this)
    this.onSaveJobNumTerm = this.onSaveJobNumTerm.bind(this)
    this.onFilterJobTypeChange = this.onFilterJobTypeChange.bind(this)
    this.onSaveJobTypeTerm = this.onSaveJobTypeTerm.bind(this)
    this.onFilterStatusChange = this.onFilterStatusChange.bind(this)
    this.onFilterPriorityChange = this.onFilterPriorityChange.bind(this)
    this.onFilterVendorChange = this.onFilterVendorChange.bind(this)
    this.onSaveVendorTerm = this.onSaveVendorTerm.bind(this)
    this.onFilterProgressChange = this.onFilterProgressChange.bind(this)
    this.onFilterCorrectiveChange = this.onFilterCorrectiveChange.bind(this)
    this.onFilterVendorLateChange = this.onFilterVendorLateChange.bind(this)
    this.onFilterJobLateChange = this.onFilterJobLateChange.bind(this)
  }

  componentDidMount() {
    const filters = Object.assign({}, this.props._jobs.jobFilters)
    this.setState({ filters })
  }

  onFiltersApplyClick() {
    this.props.onFiltersApplied(this.props._jobs.jobFilters)
  }

  resetFilter() {
    const filters = Object.assign({}, this.state.filters, {
      startDate: moment(new Date().setDate(new Date().getDate() - 9)),
      endDate: moment(new Date().setDate(new Date().getDate() + 9)),
      isEtaOrSchedDate: true,
      dateFilterType: "range", // can be 'range' or 'between'
      rangeStart: "-9",
      rangeEnd: "9",

      byProjectNumber: "",
      byJobNumber: "",
      byJobType: "",
      isLive: true,
      isComplete: false,
      isCancelled: false,
      byStatusId: [0, 1, 2, 3],
      byPriorityId: [0, 1, 2],
      isCorrectiveAction: null,
      isJobLate: null,
      isPendingDataEntry: null,

      byAddress: "",
      byCity: "",
      byZip: "",

      byVendor: "",
      byProgressId: [0, 1, 2, 3, 4, 5],
      isVendorLate: null,
    })
    this.setState({ filters })
    this.props.clearJobFilters()
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput })
  }

  onDateTypeChange(dateFilterType) {
    if (dateFilterType === this.props._jobs.jobFilters.dateFilterType) {
      return
    }

    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      dateFilterType,
    })
    if (dateFilterType === "range") {
      // also reset the between fields
      filters.startDate = moment(new Date().setDate(new Date().getDate() - 9))
      filters.endDate = moment(new Date().setDate(new Date().getDate() + 9))
    }

    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onRangeDaysChange(isStart, e) {
    const { rangeStart, rangeEnd } = this.props._jobs.jobFilters

    let start = rangeStart === undefined ? "-9" : rangeStart
    let end = rangeEnd === undefined ? "9" : rangeEnd

    const value = e.target.value
    if (isStart) {
      start = value
    } else {
      end = value
    }

    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      rangeStart: start,
      rangeEnd: end,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onStartDateChange(startDate) {
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      startDate,
    })
    this.setState({
      startFocusedInput: false,
      endFocusedInput: true,
      filters,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onEndDateChange(endDate) {
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      endDate,
    })
    this.setState({
      endFocusedInput: true,
      filters,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onDateColumnFilter(type) {
    const isEtaOrSchedDate = type.target.value === "eta"
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      isEtaOrSchedDate,
    })

    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onFilterCorrectiveChange(checkbox) {
    const checked = checkbox.target.checked

    // if checked is true add
    // if checked is false remove from request
    var correctiveFilter = this.props._jobs.jobFilters.isCorrectiveAction
    if (checked) {
      correctiveFilter = true
    } else {
      correctiveFilter = null
    }

    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      isCorrectiveAction: correctiveFilter,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onFilterJobLateChange(checkbox) {
    const checked = checkbox.target.checked

    // if checked is true add
    // if checked is false remove from request
    var jobLateFilter = this.props._jobs.jobFilters.isJobLate
    if (checked) {
      jobLateFilter = true
    } else {
      jobLateFilter = null
    }

    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      isJobLate: jobLateFilter,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onFilterProgressChange(checkbox) {
    const progress = checkbox.target.value
    const checked = checkbox.target.checked

    // if checked is true add to array
    // if checked is false remove from array
    // if progress is all empty array
    var progressFilter = Object.assign(
      [],
      this.props._jobs.jobFilters.byProgressId,
    )
    if (progress === "any") {
      if (checked) {
        progressFilter = [0, 1, 2, 3, 4, 5]
      } else {
        progressFilter.splice(0, progressFilter.length)
      }
    } else {
      const intProgress = parseInt(progress, 10)
      if (checked) {
        progressFilter.push(intProgress)
      } else {
        const item = progressFilter.indexOf(intProgress)
        progressFilter.splice(item, 1)
      }
    }

    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byProgressId: progressFilter,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onFilterVendorLateChange(checkbox) {
    const checked = checkbox.target.checked

    // if checked is true add
    // if checked is false remove from request
    var vendorLateFilter = this.props._jobs.jobFilters.isVendorLate
    if (checked) {
      vendorLateFilter = true
    } else {
      vendorLateFilter = null
    }

    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      isVendorLate: vendorLateFilter,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onSaveSiteTerm = e => {
    const byAddress = e.target.value
    const filters = Object.assign({}, this.state.filters, {
      byAddress,
    })
    this.setState({ filters })
  }

  onFilterSiteChange(text) {
    const byAddress = text.target.value.trim()
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byAddress,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onSaveCityTerm = e => {
    const byCity = e.target.value
    const filters = Object.assign({}, this.state.filters, {
      byCity,
    })
    this.setState({ filters })
  }

  onFilterCityChange(text) {
    const byCity = text.target.value.trim()
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byCity,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onSaveZipTerm = e => {
    const byZip = e.target.value
    const filters = Object.assign({}, this.state.filters, {
      byZip,
    })
    this.setState({ filters })
  }

  onFilterZipChange(text) {
    const byZip = text.target.value.trim()
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byZip,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onSaveProjectNumTerm = e => {
    const byProjectNumber = e.target.value
    const filters = Object.assign({}, this.state.filters, {
      byProjectNumber,
    })
    this.setState({ filters })
  }

  onFilterProjectNumChange(text) {
    const byProjectNumber = text.target.value.trim()
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byProjectNumber,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onSaveJobNumTerm = e => {
    const byJobNumber = e.target.value
    const filters = Object.assign({}, this.state.filters, {
      byJobNumber,
    })
    this.setState({ filters })
  }

  onFilterJobNumChange(text) {
    const byJobNumber = text.target.value.trim()
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byJobNumber,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onSaveJobTypeTerm = e => {
    const byJobType = e.target.value
    const filters = Object.assign({}, this.state.filters, {
      byJobType,
    })
    this.setState({ filters })
  }

  onFilterJobTypeChange(text) {
    const byJobType = text.target.value.trim()
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byJobType,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onFilterStatusChange(checkbox) {
    const status = checkbox.target.value
    const checked = checkbox.target.checked

    // if checked is true add to array
    // if checked is false remove from array
    // if status is all empty array
    var statusFilter = Object.assign([], this.props._jobs.jobFilters.byStatusId)
    if (status === "any") {
      if (checked) {
        statusFilter = [0, 1, 2, 3]
      } else {
        statusFilter.splice(0, statusFilter.length)
      }
    } else {
      const intStatus = parseInt(status, 10)
      if (checked) {
        statusFilter.push(intStatus)
      } else {
        const item = statusFilter.indexOf(intStatus)
        statusFilter.splice(item, 1)
      }
    }

    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byStatusId: statusFilter,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onFilterPriorityChange(checkbox) {
    const priority = checkbox.target.value
    const checked = checkbox.target.checked

    // if checked is true add to array
    // if checked is false remove from array
    // if status is all empty array
    var priorityFilter = Object.assign(
      [],
      this.props._jobs.jobFilters.byPriorityId,
    )
    if (priority === "any") {
      if (checked) {
        priorityFilter = [0, 1, 2]
      } else {
        priorityFilter.splice(0, priorityFilter.length)
      }
    } else {
      const intPriority = parseInt(priority, 10)
      if (checked) {
        priorityFilter.push(intPriority)
      } else {
        const item = priorityFilter.indexOf(intPriority)
        priorityFilter.splice(item, 1)
      }
    }

    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byPriorityId: priorityFilter,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  onSaveVendorTerm = e => {
    const byVendor = e.target.value
    const filters = Object.assign({}, this.state.filters, {
      byVendor,
    })
    this.setState({ filters })
  }

  onFilterVendorChange(text) {
    const byVendor = text.target.value.trim()
    const filters = Object.assign({}, this.props._jobs.jobFilters, {
      byVendor,
    })
    this.setState({ filters })
    this.props.updateJobFilters(filters)
  }

  render() {
    const {
      startDate,
      endDate,
      isEtaOrSchedDate,
      rangeStart,
      rangeEnd,

      byProjectNumber,
      byJobNumber,
      byJobType,
      byStatusId,
      byPriorityId,

      byAddress,
      byCity,
      byZip,

      byVendor,
      byProgressId,
      isCorrectiveAction,
      isJobLate,
      isVendorLate,
    } = this.state.filters

    let { dateFilterType } = this.props._jobs.jobFilters
    if (dateFilterType === undefined) {
      dateFilterType = "range"
    }
    const statusDisabled =
      this.props._jobs.activeFilterButton !== api.JOB_FILTERS.ACTIVE

    return (
      <div className="job-dashboard-filter">
        <div className="row">
          <div className="col-sm-12">
            <h4 className="filter-title">
              Filters <span>({this.props._jobs.jobs.TotalCount} results)</span>:{" "}
            </h4>
          </div>
        </div>
        <div className="row">
          <FilterItemContainer title="ETA/Scheduled Date" colSize="col-sm-2">
            <form>
              <div className="radio">
                <label htmlFor="date_filter_eta">
                  <input
                    id="date_filter_eta"
                    name="date_filter"
                    type="radio"
                    value="eta"
                    onChange={val => this.onDateColumnFilter(val)}
                    checked={isEtaOrSchedDate === true}
                  />
                  Customer ETA Date
                </label>
              </div>
              <div className="radio">
                <label htmlFor="date_filter_sched">
                  <input
                    id="date_filter_sched"
                    name="date_filter"
                    type="radio"
                    value="sched"
                    onChange={val => this.onDateColumnFilter(val)}
                    checked={isEtaOrSchedDate === false}
                  />
                  Scheduled Date
                </label>
              </div>
            </form>
          </FilterItemContainer>

          <FilterItemContainer
            title={isEtaOrSchedDate ? "ETA Date Range" : "Schedule Date Range"}
            colSize="col-sm-4"
          >
            <form>
              <div className="radio">
                <label htmlFor="in-range">
                  <input
                    id="in-range"
                    name="date_filter"
                    type="radio"
                    onChange={() => this.onDateTypeChange("range")}
                    checked={dateFilterType === "range"}
                  />
                  In range:
                  <span className="form-inline in-range">
                    <DebounceInput
                      className="form-control input-xs text-right"
                      type="number"
                      id="range_days_start"
                      name="range_days_start"
                      value={rangeStart === undefined ? "-9" : rangeStart}
                      debounceTimeout={1000}
                      onChange={val => this.onRangeDaysChange(true, val)}
                      onFocus={() => this.onDateTypeChange("range")}
                    />
                    days to
                    <DebounceInput
                      className="form-control input-xs text-right"
                      type="number"
                      id="range_days_end"
                      name="range_days_end"
                      value={rangeEnd === undefined ? "9" : rangeEnd}
                      debounceTimeout={1000}
                      onChange={val => this.onRangeDaysChange(false, val)}
                      onFocus={() => this.onDateTypeChange("range")}
                    />
                    days
                  </span>
                </label>
              </div>
              <div className="radio">
                <label htmlFor="date-between">
                  <input
                    id="date-between"
                    name="date_filter"
                    type="radio"
                    onChange={() => this.onDateTypeChange("between")}
                    checked={dateFilterType === "between"}
                  />
                  Between:
                  <span className="form-inline in-range">
                    <SingleDatePicker
                      onDateChange={this.onStartDateChange}
                      onFocusChange={() => {
                        this.onDateTypeChange("between")
                        this.setState({
                          startFocusedInput: !this.state.startFocusedInput,
                          endFocusedInput: false,
                        })
                      }}
                      date={moment(startDate)}
                      numberOfMonths={1}
                      isOutsideRange={() => false}
                      focused={this.state.startFocusedInput}
                    />
                    and
                    <SingleDatePicker
                      onDateChange={this.onEndDateChange}
                      onFocusChange={() => {
                        this.onDateTypeChange("between")

                        this.setState({
                          endFocusedInput: !this.state.endFocusedInput,
                          startFocusedInput: false,
                        })
                      }}
                      date={moment(endDate)}
                      numberOfMonths={1}
                      isOutsideRange={() => false}
                      focused={this.state.endFocusedInput}
                    />
                    days
                  </span>
                </label>
              </div>
            </form>
          </FilterItemContainer>

          <FilterItemContainer title="Address" colSize="col-sm-2">
            <InputGroup compact>
              <Tooltip
                trigger={["hover"]}
                title="Search by site, hit enter to begin search..."
                placement="topLeft"
                arrowPointAtCenter
              >
                <Input
                  id="filter_site"
                  placeholder="Address"
                  prefix={
                    <Icon
                      name="map-marker"
                      style={{ color: "rgba(0,0,0,.25)" }}
                    />
                  }
                  value={byAddress}
                  onChange={this.onSaveSiteTerm}
                  onPressEnter={this.onFilterSiteChange}
                />
              </Tooltip>
            </InputGroup>
          </FilterItemContainer>

          <FilterItemContainer title="City" colSize="col-sm-1">
            <InputGroup compact>
              <Tooltip
                trigger={["hover"]}
                title="Search by city, hit enter to begin search..."
                placement="topLeft"
                arrowPointAtCenter
              >
                <Input
                  id="filter_city"
                  placeholder="City"
                  prefix={
                    <Icon name="home" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  value={byCity}
                  onChange={this.onSaveCityTerm}
                  onPressEnter={this.onFilterCityChange}
                />
              </Tooltip>
            </InputGroup>
          </FilterItemContainer>

          <FilterItemContainer title="Zip" colSize="col-sm-1">
            <InputGroup compact>
              <Tooltip
                trigger={["hover"]}
                title="Search by zip, hit enter to begin search..."
                placement="topLeft"
                arrowPointAtCenter
              >
                <Input
                  id="filter_zip"
                  placeholder="Zip"
                  prefix={
                    <Icon name="key" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  value={byZip}
                  onChange={this.onSaveZipTerm}
                  onPressEnter={this.onFilterZipChange}
                />
              </Tooltip>
            </InputGroup>
          </FilterItemContainer>
        </div>

        <div className="row">
          <FilterItemContainer title="Project Number" colSize="col-sm-2">
            <InputGroup compact>
              <Tooltip
                trigger={["hover"]}
                title="Search by project #, hit enter to begin search..."
                placement="topLeft"
                arrowPointAtCenter
              >
                <Input
                  id="filter_projnum"
                  placeholder="Project #"
                  prefix={
                    <Icon name="book" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  value={byProjectNumber}
                  onChange={this.onSaveProjectNumTerm}
                  onPressEnter={this.onFilterProjectNumChange}
                />
              </Tooltip>
            </InputGroup>
          </FilterItemContainer>

          <FilterItemContainer title="Job Number" colSize="col-sm-2">
            <InputGroup compact>
              <Tooltip
                trigger={["hover"]}
                title="Search by job #, hit enter to begin search..."
                placement="topLeft"
                arrowPointAtCenter
              >
                <Input
                  id="filter_jobnum"
                  placeholder="Job #"
                  prefix={
                    <Icon
                      name="briefcase"
                      style={{ color: "rgba(0,0,0,.25)" }}
                    />
                  }
                  value={byJobNumber}
                  onChange={this.onSaveJobNumTerm}
                  onPressEnter={this.onFilterJobNumChange}
                />
              </Tooltip>
            </InputGroup>
          </FilterItemContainer>

          <FilterItemContainer title="Job Type" colSize="col-sm-2">
            <InputGroup compact>
              <Tooltip
                trigger={["hover"]}
                title="Search by job #, hit enter to begin search..."
                placement="topLeft"
                arrowPointAtCenter
              >
                <Input
                  id="filter_jobtype"
                  placeholder="Job Type"
                  prefix={
                    <Icon name="wrench" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  value={byJobType}
                  onChange={this.onSaveJobTypeTerm}
                  onPressEnter={this.onFilterJobTypeChange}
                />
              </Tooltip>
            </InputGroup>
          </FilterItemContainer>

          {this.props._jobs.activeFilterButton === api.JOB_FILTERS.ACTIVE && (
            <FilterItemContainer
              title="Job Status (Active Jobs ONLY)"
              colSize="col-sm-2"
            >
              <form>
                <div className="checkbox">
                  <label htmlFor="filter_status_any">
                    <input
                      id="filter_status_any"
                      name="status_filter"
                      type="checkbox"
                      value="any"
                      onChange={val => this.onFilterStatusChange(val)}
                      checked={byStatusId.indexOf(0) > -1}
                      disabled={statusDisabled}
                    />
                    Any
                  </label>
                </div>
                <div className="checkbox">
                  <label htmlFor="filter_status_new">
                    <input
                      id="filter_status_new"
                      name="status_filter"
                      type="checkbox"
                      value={1}
                      onChange={val => this.onFilterStatusChange(val)}
                      checked={byStatusId.indexOf(1) > -1}
                      disabled={statusDisabled || byStatusId.indexOf(0) > -1}
                    />
                    New
                  </label>
                </div>
                <div className="checkbox">
                  <label htmlFor="filter_status_in_progress">
                    <input
                      id="filter_status_in_progress"
                      name="status_filter"
                      type="checkbox"
                      value={2}
                      onChange={val => this.onFilterStatusChange(val)}
                      checked={byStatusId.indexOf(2) > -1}
                      disabled={statusDisabled || byStatusId.indexOf(0) > -1}
                    />
                    In Progress
                  </label>
                </div>
                <div className="checkbox">
                  <label htmlFor="filter_status_on_hold">
                    <input
                      id="filter_status_on_hold"
                      name="status_filter"
                      type="checkbox"
                      value={3}
                      onChange={val => this.onFilterStatusChange(val)}
                      checked={byStatusId.indexOf(3) > -1}
                      disabled={statusDisabled || byStatusId.indexOf(0) > -1}
                    />
                    On Hold
                  </label>
                </div>
              </form>
            </FilterItemContainer>
          )}

          <FilterItemContainer
            title="Corrective Action Jobs"
            colSize="col-sm-2"
          >
            <form>
              <div className="checkbox">
                <label htmlFor="filter_corrective">
                  <input
                    id="filter_corrective"
                    name="status_corrective"
                    type="checkbox"
                    value="any"
                    onChange={val => this.onFilterCorrectiveChange(val)}
                    checked={isCorrectiveAction}
                    disabled={false}
                  />
                  Only
                </label>
              </div>
            </form>
          </FilterItemContainer>

          <FilterItemContainer title="Job Priority" colSize="col-sm-1">
            <form>
              <div className="checkbox">
                <label htmlFor="filter_priority_any">
                  <input
                    id="filter_priority_any"
                    name="priority_filter"
                    type="checkbox"
                    value="any"
                    onChange={val => this.onFilterPriorityChange(val)}
                    checked={byPriorityId.indexOf(0) > -1}
                    disabled={false}
                  />
                  Any
                </label>
              </div>
              <div className="checkbox">
                <label htmlFor="filter_priority_normal">
                  <input
                    id="filter_priority_normal"
                    name="priority_filter"
                    type="checkbox"
                    value={1}
                    onChange={val => this.onFilterPriorityChange(val)}
                    checked={byPriorityId.indexOf(1) > -1}
                    disabled={byPriorityId.indexOf(0) > -1}
                  />
                  Normal
                </label>
              </div>
              <div className="checkbox">
                <label htmlFor="filter_priority_emergency">
                  <input
                    id="filter_priority_emergency"
                    name="priority_filter"
                    type="checkbox"
                    value={2}
                    onChange={val => this.onFilterPriorityChange(val)}
                    checked={byPriorityId.indexOf(2) > -1}
                    disabled={byPriorityId.indexOf(0) > -1}
                  />
                  Emergency
                </label>
              </div>
            </form>
          </FilterItemContainer>

          {this.props._jobs.activeFilterButton === api.JOB_FILTERS.ACTIVE && (
            <FilterItemContainer title="Late Jobs (ETA)" colSize="col-sm-1">
              <form>
                <div className="checkbox">
                  <label htmlFor="filter_job_late">
                    <input
                      id="filter_job_late"
                      name="filter_job_late"
                      type="checkbox"
                      value="any"
                      onChange={val => this.onFilterJobLateChange(val)}
                      checked={isJobLate}
                      disabled={false}
                    />
                    Only
                  </label>
                </div>
              </form>
            </FilterItemContainer>
          )}
        </div>

        <div className="row">
          <FilterItemContainer title="Subcontractor" colSize="col-sm-2">
            <InputGroup compact>
              <Tooltip
                trigger={["hover"]}
                title="Search by subcontractor, hit enter to begin search..."
                placement="topLeft"
                arrowPointAtCenter
              >
                <Input
                  id="filter_vendor"
                  placeholder="Subcontractor"
                  prefix={
                    <Icon name="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  value={byVendor}
                  onChange={this.onSaveVendorTerm}
                  onPressEnter={this.onFilterVendorChange}
                />
              </Tooltip>
            </InputGroup>
          </FilterItemContainer>

          {this.props._jobs.activeFilterButton === api.JOB_FILTERS.ACTIVE && (
            <span>
              <FilterItemContainer
                title="Subcontractor Progress"
                colSize="col-sm-2"
              >
                <form>
                  <div className="checkbox">
                    <label htmlFor="filter_progress_any">
                      <input
                        id="filter_progress_any"
                        name="progress_filter"
                        type="checkbox"
                        value="any"
                        onChange={val => this.onFilterProgressChange(val)}
                        checked={byProgressId.indexOf(0) > -1}
                        disabled={statusDisabled}
                      />
                      Any
                    </label>
                  </div>
                  <div className="checkbox">
                    <label htmlFor="filter_progress_pending">
                      <input
                        id="filter_progress_pending"
                        name="progress_filter"
                        type="checkbox"
                        value={1}
                        onChange={val => this.onFilterProgressChange(val)}
                        checked={byProgressId.indexOf(1) > -1}
                        disabled={
                          statusDisabled || byProgressId.indexOf(0) > -1
                        }
                      />
                      Pending
                    </label>
                  </div>
                  <div className="checkbox">
                    <label htmlFor="filter_progress_in_progress">
                      <input
                        id="filter_progress_in_progress"
                        name="progress_filter"
                        type="checkbox"
                        value={5}
                        onChange={val => this.onFilterProgressChange(val)}
                        checked={byProgressId.indexOf(5) > -1}
                        disabled={
                          statusDisabled || byProgressId.indexOf(0) > -1
                        }
                      />
                      In Progress
                    </label>
                  </div>
                  <div className="checkbox">
                    <label htmlFor="filter_progress_checked_in">
                      <input
                        id="filter_progress_checked_in"
                        name="progress_filter"
                        type="checkbox"
                        value={2}
                        onChange={val => this.onFilterProgressChange(val)}
                        checked={byProgressId.indexOf(2) > -1}
                        disabled={
                          statusDisabled || byProgressId.indexOf(0) > -1
                        }
                      />
                      Checked In
                    </label>
                  </div>
                  <div className="checkbox">
                    <label htmlFor="filter_progress_checked_out">
                      <input
                        id="filter_progress_checked_out"
                        name="progress_filter"
                        type="checkbox"
                        value={3}
                        onChange={val => this.onFilterProgressChange(val)}
                        checked={byProgressId.indexOf(3) > -1}
                        disabled={
                          statusDisabled || byProgressId.indexOf(0) > -1
                        }
                      />
                      Checked Out
                    </label>
                  </div>
                  <div className="checkbox">
                    <label htmlFor="filter_progress_sign_off">
                      <input
                        id="filter_progress_sign_off"
                        name="progress_filter"
                        type="checkbox"
                        value={4}
                        onChange={val => this.onFilterProgressChange(val)}
                        checked={byProgressId.indexOf(4) > -1}
                        disabled={
                          statusDisabled || byProgressId.indexOf(0) > -1
                        }
                      />
                      Signed Off
                    </label>
                  </div>
                </form>
              </FilterItemContainer>

              <FilterItemContainer
                title="Late Subcontractors (Scheduled Date)"
                colSize="col-sm-2"
              >
                <form>
                  <div className="checkbox">
                    <label htmlFor="filter_vendor_late">
                      <input
                        id="filter_vendor_late"
                        name="filter_vendor_late"
                        type="checkbox"
                        value="any"
                        onChange={val => this.onFilterVendorLateChange(val)}
                        checked={isVendorLate}
                        disabled={false}
                      />
                      Only
                    </label>
                  </div>
                </form>
              </FilterItemContainer>
            </span>
          )}
        </div>
        <div className="row">
          <div className="col-sm-12">
            <Tooltip
              trigger={["hover"]}
              title="Clear all filters"
              placement="topLeft"
              arrowPointAtCenter
            >
              <Button
                bsStyle="danger"
                className="pull-right"
                onClick={() => this.resetFilter()}
              >
                <Icon name="refresh" /> Reset
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }
}

JobDashboardFilter.propTypes = propTypes
JobDashboardFilter.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(JobDashboardFilter)
