import {
  JOB_SELECTED,
  JOB_COMPLETE_CHECK_LOADING,
  JOB_COMPLETE_CHECK_RECEIVED,
  JOB_TOGGLE_COMPLETE_DETAILS,
  JOB_LOCKED_BY_SCHED_DATE,
  JOB_SCHEDULED_DATE_LIMITS_CHANGED,
  JOB_SCHEDULED_DATE_CHANGED,
  JOB_TOGGLE_ACTIVITY_STARTED,
} from "../constants/ActionTypes"

const initialState = {
  selected: null,
  completeIsLoading: false,
  completeCheckData: null,
  showCompleteWarning: false,
  lockedByScheduledDate: false,
  scheduledDateLimits: {},
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  let ScheduledDate = null
  let selected = null

  switch (type) {
    case JOB_COMPLETE_CHECK_LOADING:
      return {
        ...state,
        completeIsLoading: payload,
      }

    case JOB_SELECTED:
      return {
        ...state,
        selected: payload,
      }

    case JOB_COMPLETE_CHECK_RECEIVED:
      return {
        ...state,
        completeCheckData: payload,
      }

    case JOB_TOGGLE_COMPLETE_DETAILS:
      return {
        ...state,
        showCompleteWarning: payload,
      }

    case JOB_LOCKED_BY_SCHED_DATE:
      return {
        ...state,
        lockedByScheduledDate: payload,
      }

    case JOB_SCHEDULED_DATE_LIMITS_CHANGED:
      return {
        ...state,
        scheduledDateLimits: payload,
      }

    case JOB_SCHEDULED_DATE_CHANGED:
      ScheduledDate = new Date(payload)
      selected = Object.assign({}, state.selected, {
        ScheduledDate,
      })

      return {
        ...state,
        selected,
      }

    case JOB_TOGGLE_ACTIVITY_STARTED:
      selected = Object.assign({}, state.selected, {
        IsActivityStarted: payload,
      })

      return {
        ...state,
        selected,
      }

    default:
      return state
  }
}
