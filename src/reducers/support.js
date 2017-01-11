import moment from "moment"
import {
  SUPPORT_JOB_FILTERS_CHANGED,
  SUPPORT_JOBS_RECEIVED,
  SUPPORT_JOBS_IS_LOADING,
  SUPPORT_JOBS_HAS_ERRORED,
  SUPPORT_FILTER_BUTTON_SELECTED,
  SUPPORT_JOB_PAGE_CHANGED,
} from "../constants/ActionTypes"

const initialState = {
  activeFilterButton: 0,
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
    bySupportTypeId: [0, 1, 2, 3, 4, 5],
  },
  jobs: {
    TotalCount: 0,
    Jobs: [],
  },
  jobsIsLoading: false,
  jobsHasErrored: false,
  pageNumber: 1,
  pageSize: 15,
  jobsPageIsChanging: false,
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case SUPPORT_JOB_FILTERS_CHANGED:
      return {
        ...state,
        filters: payload,
      }

    case SUPPORT_JOBS_RECEIVED:
      return {
        ...state,
        jobs: payload,
      }

    case SUPPORT_JOBS_IS_LOADING:
      return {
        ...state,
        jobsIsLoading: payload,
      }

    case SUPPORT_JOBS_HAS_ERRORED:
      return {
        ...state,
        jobsHasErrored: payload,
      }

    case SUPPORT_FILTER_BUTTON_SELECTED:
      return {
        ...state,
        activeFilterButton: payload,
      }

    case SUPPORT_JOB_PAGE_CHANGED:
      return {
        ...state,
        pageNumber: payload,
      }

    default:
      return state
  }
}
