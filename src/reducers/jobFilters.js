import moment from "moment"
import {
  JOB_FILTERS_CHANGED,
  JOBS_RECEIVED,
  JOBS_IS_LOADING,
  JOBS_HAS_ERRORED,
  FILTER_BUTTON_SELECTED,
  JOB_PAGE_CHANGED,
} from "../constants/ActionTypes"

const initialState = {
  activeFilterButton: 0,
  jobFilters: {
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
    case JOB_FILTERS_CHANGED:
      return {
        ...state,
        jobFilters: payload,
      }

    case JOBS_RECEIVED:
      return {
        ...state,
        jobs: payload,
      }

    case JOBS_IS_LOADING:
      return {
        ...state,
        jobsIsLoading: payload,
      }

    case JOBS_HAS_ERRORED:
      return {
        ...state,
        jobsHasErrored: payload,
      }

    case FILTER_BUTTON_SELECTED:
      return {
        ...state,
        activeFilterButton: payload,
      }

    case JOB_PAGE_CHANGED:
      return {
        ...state,
        pageNumber: payload,
      }

    default:
      return state
  }
}
