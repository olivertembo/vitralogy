import moment from "moment"
import request from "superagent"
import { userPreferencePostSingle } from "./prefs"
import {
  JOB_FILTERS_CHANGED,
  JOBS_IS_LOADING,
  JOBS_RECEIVED,
  JOBS_HAS_ERRORED,
  FILTER_BUTTON_SELECTED,
  JOB_PAGE_CHANGED,
  JOBS_PAGE_IS_CHANGING,
} from "../constants/ActionTypes"
import * as api from "../constants/api"

require("../utils/UserPrefsHelper")

export function pageIsChanging(payload) {
  return {
    type: JOBS_PAGE_IS_CHANGING,
    payload,
  }
}

export function jobFiltersChanged(payload) {
  return {
    type: JOB_FILTERS_CHANGED,
    payload,
  }
}

export function jobsIsLoading(payload) {
  return {
    type: JOBS_IS_LOADING,
    payload,
  }
}

export function jobsHasErrored(payload) {
  return {
    type: JOBS_HAS_ERRORED,
    payload,
  }
}

export function jobsReceived(payload) {
  return {
    type: JOBS_RECEIVED,
    payload,
  }
}

export function filterButtonSelected(payload) {
  return {
    type: FILTER_BUTTON_SELECTED,
    payload,
  }
}

export function jobPageChanged(payload) {
  return {
    type: JOB_PAGE_CHANGED,
    payload,
  }
}

export function filterButtonChanged(id) {
  return dispatch => {
    dispatch(filterButtonSelected(id))
  }
}

export function updateJobFilters(filters) {
  return dispatch => {
    dispatch(jobPageChanged(1)) // VENPORTAL-572
    dispatch(refreshJobs(filters))
    dispatch(
      userPreferencePostSingle(
        "user",
        api.USER_PREF_KEY_JOB_DASHBOARD_FILTERS,
        JSON.stringify(filters),
        true,
      ),
    )
  }
}

export function resetDateFilter() {
  return (dispatch, getState) => {
    const state = getState()

    const { jobFilters } = state.jobFilters

    const filters = Object.assign({}, jobFilters, {
      startDate: moment(new Date().setDate(new Date().getDate() - 9)),
      endDate: moment(new Date().setDate(new Date().getDate() + 9)),
    })

    dispatch(updateJobFilters(filters))
  }
}

export function clearJobFilters() {
  return (dispatch, getState) => {
    const state = getState()

    // TODO improve to keep current button but
    // reset date, customer, signed off and status

    const filters = Object.assign({}, state.jobFilters.jobFilters, {
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
    })

    dispatch(updateJobFilters(filters))
    dispatch(filterButtonChanged(1))
  }
}

export function changeJobPage(page) {
  return (dispatch, getState) => {
    const state = getState()

    const { jobFilters } = state.jobFilters

    dispatch(pageIsChanging(true))
    dispatch(jobPageChanged(page))
    dispatch(refreshJobs(jobFilters))
  }
}

export function refreshJobs(filters) {
  return (dispatch, getState) => {
    const state = getState()

    dispatch(jobsIsLoading(true))

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
    } = filters
    const { pageNumber, pageSize } = state.jobFilters

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

    const emptyPayload = {
      Jobs: [],
      TotalCount: 0,
      Count: 0,
      IsSuccess: true,
      Msg: null,
    }

    console.log(`Retrieving Jobs: ${url}`)
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
          IsSupportJobOnly: false,
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
            dispatch(jobsHasErrored(false))
            dispatch(jobsReceived(response.body))
          } else {
            dispatch(jobsReceived(emptyPayload))
            dispatch(jobsHasErrored(true))
          }
        },
        () => {
          dispatch(jobsReceived(emptyPayload))
          dispatch(jobsHasErrored(true))
        },
      )
      .then(() => {
        dispatch(jobsIsLoading(false))
        dispatch(pageIsChanging(false))
      })

    dispatch(jobFiltersChanged(filters))
  }
}
