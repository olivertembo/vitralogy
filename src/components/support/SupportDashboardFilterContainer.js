import React from "react"
import { connect } from "react-redux"
import moment from "moment"

import SupportFilterButtonBar from "./SupportFilterButtonBar"
import FilterContainer from "../../containers/FilterContainer"
import SupportDashboardFilter from "./SupportDashboardFilter"
import * as api from "../../constants/api"
import { format } from "../../utils/datetime"

const getState = state => {
  return {
    ...state.support,
  }
}

class SupportDashboardFilterContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filtersApplied: null,
    }

    this.formatVendorProgress = this.formatVendorProgress.bind(this)
    this.formatJobStatus = this.formatJobStatus.bind(this)
    this.formatJobPriority = this.formatJobPriority.bind(this)
    this.formatSupportType = this.formatSupportType.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.formatFiltersApplied(nextProps.filters)
  }

  formatVendorProgress(byProgressId) {
    let progressFilter = ""

    if (byProgressId.indexOf(0) > -1) {
      progressFilter = api.VENDOR_PROGRESS_TYPES[byProgressId[0]]
    } else {
      const progressParams = byProgressId.map((progressId, index) => {
        return `${api.VENDOR_PROGRESS_TYPES[progressId]}`
      })

      progressFilter = progressParams
    }
    return progressFilter
  }

  formatSupportType(bySupportTypeId) {
    let supportFilter = ""

    if (bySupportTypeId.indexOf(0) > -1) {
      supportFilter = api.SUPPORT_TYPES[bySupportTypeId[0]]
    } else {
      const supportTypeParams = bySupportTypeId.map((supportTypeId, index) => {
        return `${api.SUPPORT_TYPES[supportTypeId]}`
      })

      supportFilter = supportTypeParams
    }
    return supportFilter
  }

  formatJobStatus(byStatusId) {
    let statusFilter = ""

    if (byStatusId.indexOf(0) > -1) {
      statusFilter = api.JOB_STATUS_TYPES[byStatusId[0]]
    } else {
      const statusParams = byStatusId.map((statusId, index) => {
        return `${api.JOB_STATUS_TYPES[statusId]}`
      })

      statusFilter = statusParams
    }
    return statusFilter
  }

  formatJobPriority(byPriorityId) {
    let priorityFilter = ""

    if (byPriorityId.indexOf(0) > -1) {
      priorityFilter = api.JOB_PRIORITY_TYPES[byPriorityId[0]]
    } else {
      const priorityParams = byPriorityId.map((priorityId, index) => {
        return `${api.JOB_PRIORITY_TYPES[priorityId]}`
      })

      priorityFilter = priorityParams
    }
    return priorityFilter
  }

  formatFiltersApplied(filters) {
    const {
      startDate,
      endDate,
      isEtaOrSchedDate,
      dateFilterType,
      rangeStart,
      rangeEnd,

      byProjectNumber,
      byJobNumber,
      byJobType,
      isLive,
      isComplete,
      isCancelled,
      byStatusId,
      byPriorityId,
      isCorrectiveAction,
      isJobLate,
      isPendingDataEntry,

      byAddress,
      byCity,
      byZip,

      byVendor,
      byProgressId,
      isVendorLate,
      bySupportTypeId,
    } = filters

    let dtStart = startDate
    let dtEnd = endDate
    if (dateFilterType === undefined || dateFilterType === "range") {
      const start = rangeStart === undefined ? "-14" : rangeStart
      const end = rangeEnd === undefined ? "14" : rangeEnd

      dtStart = moment()
        .add(Number(start), "days")
        .format()
      dtEnd = moment()
        .add(Number(end), "days")
        .format()
    }

    let filtersApplied = `${
      isEtaOrSchedDate ? "ETA" : "Scheduled"
    } date between ${format(dtStart, "MM/DD/YYYY")} and ${format(
      dtEnd,
      "MM/DD/YYYY",
    )}; `

    if (byAddress !== undefined && byAddress !== null && byAddress.length > 0)
      filtersApplied += `Site: ${byAddress}; `
    if (byCity !== undefined && byCity !== null && byCity.length > 0)
      filtersApplied += `City: ${byCity}; `
    if (byZip !== undefined && byZip !== null && byZip.length > 0)
      filtersApplied += `Zip: ${byZip}; `
    if (
      byProjectNumber !== undefined &&
      byProjectNumber !== null &&
      byProjectNumber.length > 0
    )
      filtersApplied += `Proj#: ${byProjectNumber}; `
    if (
      byJobNumber !== undefined &&
      byJobNumber !== null &&
      byJobNumber.length > 0
    )
      filtersApplied += `Job#: ${byJobNumber}; `
    if (byJobType !== undefined && byJobType !== null && byJobType.length > 0)
      filtersApplied += `Job Type: ${byJobType}; `
    if (isLive !== null) filtersApplied += `${isLive ? "Live" : "Pending"}; `
    if (isComplete !== null)
      filtersApplied += `${isComplete ? "Completed" : "Not Completed"}; `
    if (isCancelled !== null)
      filtersApplied += `${isCancelled ? "Canceled" : "Not Canceled"}; `
    if (isPendingDataEntry !== null)
      filtersApplied += `${
        isPendingDataEntry ? "Pending Data Entry" : "Not Pending Data Entry"
      }; `
    if (isCorrectiveAction !== null && isCorrectiveAction)
      filtersApplied += `Corrective Action Jobs; `
    if (
      byStatusId !== undefined &&
      byStatusId !== null &&
      byStatusId.length > 0 &&
      isLive &&
      !isComplete &&
      !isCancelled
    )
      filtersApplied += `Job Status [ ${this.formatJobStatus(
        filters.byStatusId,
      )} ]; `
    if (
      byPriorityId !== undefined &&
      byPriorityId !== null &&
      byPriorityId.length > 0
    )
      filtersApplied += `Job Priority [ ${this.formatJobPriority(
        filters.byPriorityId,
      )} ]; `
    if (isJobLate !== null && isJobLate) filtersApplied += `Late Jobs; `
    if (
      bySupportTypeId !== undefined &&
      bySupportTypeId !== null &&
      bySupportTypeId.length > 0
    )
      filtersApplied += `Support Type [ ${this.formatSupportType(
        filters.bySupportTypeId,
      )} ]; `
    if (byVendor !== undefined && byVendor !== null && byVendor.length > 0)
      filtersApplied += `Subcontractor: ${byVendor}; `
    if (isVendorLate !== null && isVendorLate)
      filtersApplied += `Missed Scheduled Date; `
    if (
      byProgressId !== undefined &&
      byProgressId !== null &&
      byProgressId.length > 0 &&
      isLive &&
      !isComplete &&
      !isCancelled
    )
      filtersApplied += `Support Progress [ ${this.formatVendorProgress(
        filters.byProgressId,
      )} ]; `
    if (filtersApplied.lastIndexOf("; ") === filtersApplied.length - 2)
      filtersApplied = filtersApplied.substr(0, filtersApplied.length - 2)

    this.setState({ filtersApplied })
  }

  render() {
    return (
      <div className="job-dashboard-filter-container">
        <SupportFilterButtonBar />
        <FilterContainer
          filtersApplied={this.state.filtersApplied}
          showFilterOverlay={this.props.showFilterOverlay}
          toggleFilterOverlay={this.props.toggleFilterOverlay}
        >
          <SupportDashboardFilter
            onFiltersApplied={filters => this.onFiltersApplied(filters)}
          />
        </FilterContainer>
      </div>
    )
  }
}

export default connect(getState)(SupportDashboardFilterContainer)