import moment from "moment"
import request from "superagent"
import {
  SUPPORT_JOB_FILTERS_CHANGED,
  SUPPORT_JOBS_IS_LOADING,
  SUPPORT_JOBS_RECEIVED,
  SUPPORT_JOBS_HAS_ERRORED,
  SUPPORT_FILTER_BUTTON_SELECTED,
  SUPPORT_JOB_PAGE_CHANGED,
  SUPPORT_JOBS_PAGE_IS_CHANGING,
} from "../constants/ActionTypes"
import * as api from "../constants/api"

export function pageIsChanging(payload) {
  return {
    type: SUPPORT_JOBS_PAGE_IS_CHANGING,
    payload,
  }
}

export function supportJobFiltersChanged(payload) {
  return {
    type: SUPPORT_JOB_FILTERS_CHANGED,
    payload,
  }
}

export function supportJobsIsLoading(payload) {
  return {
    type: SUPPORT_JOBS_IS_LOADING,
    payload,
  }
}

export function supportJobsHasErrored(payload) {
  return {
    type: SUPPORT_JOBS_HAS_ERRORED,
    payload,
  }
}

export function supportJobsReceived(payload) {
  return {
    type: SUPPORT_JOBS_RECEIVED,
    payload,
  }
}

export function filterButtonSelected(payload) {
  return {
    type: SUPPORT_FILTER_BUTTON_SELECTED,
    payload,
  }
}

export function supportJobPageChanged(payload) {
  return {
    type: SUPPORT_JOB_PAGE_CHANGED,
    payload,
  }
}

export function filterButtonChanged(id) {
  return dispatch => {
    dispatch(filterButtonSelected(id))
  }
}

export function updateSupportJobFilters(filters) {
  return dispatch => {
    dispatch(supportJobPageChanged(1)) // VENPORTAL-572
    dispatch(refreshSupportJobs(filters))
  }
}

export function resetSupportDateFilter() {
  return (dispatch, getState) => {
    const state = getState()

    const { filters } = state.support

    const newFilters = Object.assign({}, filters, {
      startDate: moment(new Date().setDate(new Date().getDate() - 9)),
      endDate: moment(new Date().setDate(new Date().getDate() + 9)),
    })

    dispatch(updateSupportJobFilters(newFilters))
  }
}

export function clearSupportJobFilters() {
  return (dispatch, getState) => {
    const state = getState()

    // TODO improve to keep current button but
    // reset date, customer, signed off and status

    const filters = Object.assign({}, state.support.filters, {
      isEtaOrSchedDate: true,
      startDate: moment(new Date().setDate(new Date().getDate() - 9)),
      endDate: moment(new Date().setDate(new Date().getDate() + 9)),
      dateFilterType: "range", // can be 'range' or 'between'
      rangeStart: "-9",
      rangeEnd: "9",

      byProjectNumber: "",
      byJobNumber: "",
      byJobType: "",
      isComplete: false,
      isCancelled: false,
      isLive: true,
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
      bySupportTypeId: [0, 1, 2, 3, 4, 5, 6],
    })

    dispatch(updateSupportJobFilters(filters))
    dispatch(filterButtonChanged(1))
  }
}

export function changeSupportJobPage(page) {
  return (dispatch, getState) => {
    const state = getState()

    const { filters } = state.support

    dispatch(pageIsChanging(true))
    dispatch(supportJobPageChanged(page))
    dispatch(refreshSupportJobs(filters))
  }
}

export function refreshSupportJobs(filters) {
  return (dispatch, getState) => {
    const state = getState()

    dispatch(supportJobsIsLoading(true))

    const { userAccounts } = state
    const {
      isEtaOrSchedDate,
      startDate,
      endDate,
      dateFilterType,
      rangeStart,
      rangeEnd,

      byProjectNumber,
      byJobNumber,
      byJobType,
      isComplete,
      isLive,
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
    const { pageNumber, pageSize } = state.support

    const url = `${api.CUSTOMER_JOBS}`

    let dtStart = moment(startDate).format()
    let dtEnd = moment(endDate).format()

    if (dateFilterType === undefined || dateFilterType === "range") {
      const start = rangeStart === undefined ? "-9" : rangeStart
      const end = rangeEnd === undefined ? "9" : rangeEnd

      dtStart = moment()
        .add(Number(start), "days")
        .format()
      dtEnd = moment()
        .add(Number(end), "days")
        .format()
    }

    // Job Status
    let statusId = null
    if (
      byStatusId !== undefined &&
      byStatusId !== null &&
      byStatusId.length > 0 &&
      isLive &&
      !isComplete &&
      !isCancelled &&
      byStatusId.indexOf(0) === -1
    ) {
      statusId = byStatusId
    }

    // Job Priority
    let priorityId = null
    if (
      byPriorityId !== undefined &&
      byPriorityId !== null &&
      byPriorityId.length > 0 &&
      byPriorityId.indexOf(0) === -1
    ) {
      priorityId = byPriorityId
    }

    // Vendor Progress
    let progressId = null
    if (
      byProgressId !== undefined &&
      byProgressId !== null &&
      byProgressId.length > 0 &&
      isLive &&
      !isComplete &&
      !isCancelled &&
      byProgressId.indexOf(0) === -1
    ) {
      progressId = byProgressId
    }

    // Support Types
    let supportTypeId = null
    if (
      bySupportTypeId !== undefined &&
      bySupportTypeId !== null &&
      bySupportTypeId.length > 0 &&
      bySupportTypeId.indexOf(0) === -1
    ) {
      supportTypeId = bySupportTypeId
    }

    const emptyPayload = {
      Jobs: [],
      TotalCount: 0,
      Count: 0,
      IsSuccess: true,
      Msg: null,
    }

    console.log(`Retrieving Support Jobs: ${url}`)
    request
      .post(url)
      .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
      .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
      .send({
        SearchParameters: {
          StartTime: dtStart,
          EndTime: dtEnd,
          IsEtaOrSchedDate: isEtaOrSchedDate,
          IsLive: isLive,
          IsCorrectiveAction: isCorrectiveAction,
          IsComplete: isComplete,
          IsCancelled: isCancelled,
          IsPendingDataEntryJobsOnly: isPendingDataEntry,
          ByJobNumber: byJobNumber,
          ByProjectNumber: byProjectNumber,
          ByAddress: byAddress,
          ByCity: byCity,
          ByZip: byZip,
          ByJobType: byJobType,
          ByVendor: byVendor,
          IsVendorLate:
            isLive && !isComplete && !isCancelled ? isVendorLate : null,
          IsJobLate: isLive && !isComplete && !isCancelled ? isJobLate : null,
          ByStatusId: statusId,
          ByPriorityId: priorityId,
          ByProgressId: progressId,
          IsSupportJobOnly: true,
          SupportTypeIDs: supportTypeId,
        },
        PageRequest: {
          PageSize: pageSize,
          PageNumber: pageNumber,
        },
      })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            dispatch(supportJobsHasErrored(false))
            dispatch(supportJobsReceived(response.body))
          } else {
            dispatch(supportJobsReceived(emptyPayload))
            dispatch(supportJobsHasErrored(true))
          }
        },
        () => {
          dispatch(supportJobsReceived(emptyPayload))
          dispatch(supportJobsHasErrored(true))
        },
      )
      .then(() => {
        dispatch(supportJobsIsLoading(false))
        dispatch(pageIsChanging(false))
      })

    dispatch(supportJobFiltersChanged(filters))
  }
}
