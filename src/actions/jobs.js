import moment from "moment"
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

export function jobSelected(payload) {
  return {
    type: JOB_SELECTED,
    payload,
  }
}

export function jobCompleteCheckLoading(payload) {
  return {
    type: JOB_COMPLETE_CHECK_LOADING,
    payload,
  }
}

export function jobCompleteCheckReceived(payload) {
  return {
    type: JOB_COMPLETE_CHECK_RECEIVED,
    payload,
  }
}

export function toggleCompleteJobDetails(payload) {
  return {
    type: JOB_TOGGLE_COMPLETE_DETAILS,
    payload,
  }
}

export function toggleJobActivityStarted(payload) {
  return {
    type: JOB_TOGGLE_ACTIVITY_STARTED,
    payload,
  }
}

export function selectJob(job) {
  return dispatch => {
    dispatch(jobSelected(job))
    dispatch(jobCompleteCheckReceived(null))
    dispatch(toggleCompleteJobDetails(false))
  }
}

export function toggleScheduledDateLock(payload) {
  return {
    type: JOB_LOCKED_BY_SCHED_DATE,
    payload,
  }
}

// eslint-disable-next-line no-extend-native
Array.prototype.findItemByResourceId = function findItemByResourceId(id) {
  const resource = this.find(x => x.Id === id)
  if (resource !== undefined) {
    return Object.assign({}, resource)
  }

  return null
}

// eslint-disable-next-line no-extend-native
Array.prototype.findItemByTestTypeId = function findItemByTestTypeId(id) {
  const testType = this.find(x => x.TestTypeId === id)
  if (testType !== undefined) {
    return Object.assign({}, testType)
  }

  return null
}

/*
function determineCompleteCheckProgress(originalReasons, newReasons) {
  // copy original state into new object
  console.log(
    "determineCompleteCheckProgress::originalReasons",
    originalReasons
  );
  const updateReasons = Object.assign([], originalReasons);

  const result = updateReasons.map(item => {
    // look for the same item in the new reasons object
    const updatedItem = newReasons.findItemByResourceId(item.Id);

    // item still exists, check against individual test types
    if (updatedItem !== null) {
      const ReasonByTestTypes = item.ReasonByTestTypes.map(subitem => {
        const updatedSubitem = updatedItem.ReasonByTestTypes.findItemByTestTypeId(
          subitem.TestTypeId
        );

        // didn't find it in the updated data, mark resolved
        let resolved = false;
        if (updatedSubitem === null) {
          resolved = true;
        }

        return Object.assign({}, subitem, {
          resolved
        });
      });

      return Object.assign({}, item, {
        ReasonByTestTypes
      });
    } else {
      console.log("determineCompleteCheckProgress::entire item is gone");
      // entire item is gone, all passed
      // mark all ReasonByTestTypes resolved
      const ReasonByTestTypes = item.ReasonByTestTypes.map(subitem => {
        return Object.assign({}, subitem, {
          resolved: true
        });
      });

      console.log(
        "determineCompleteCheckProgress::ReasonByTestTypes",
        ReasonByTestTypes
      );

      return Object.assign({}, item, {
        ReasonByTestTypes
      });
    }
  });

  // return new redux data
  return result;
}
*/

export function schedDateLimitsUpdated(limits, min, max) {
  return {
    type: JOB_SCHEDULED_DATE_LIMITS_CHANGED,
    payload: {
      limits,
      min,
      max,
    },
  }
}

export function checkScheduledDateRestriction() {
  return (dispatch, getState) => {
    const state = getState()
    const { ScheduledDate, IsActivityStarted } = state.jobs.selected
    const { min, max } = state.jobs.scheduledDateLimits

    let result = false

    if (IsActivityStarted) {
      result = false
    } else {
      // if sched date isn't set
      // or falls outside of the min and max times
      // should lock work order functions
      if (ScheduledDate === null) {
        result = true
      } else if (min !== null && max !== null) {
        const isBetween = moment().isBetween(min, max)

        if (isBetween === false) {
          result = true
        }
      }
    }

    dispatch(toggleScheduledDateLock(result))
  }
}

export function setScheduledDateRestriction(limits, min, max) {
  return dispatch => {
    dispatch(schedDateLimitsUpdated(limits, min, max))
    dispatch(checkScheduledDateRestriction())
  }
}

export function scheduleDateUpdated(payload) {
  return {
    type: JOB_SCHEDULED_DATE_CHANGED,
    payload,
  }
}

export function updateScheduleDate(newDate) {
  return (dispatch, getState) => {
    const state = getState()
    const { limits } = state.jobs.scheduledDateLimits

    const min = moment(newDate)
      .subtract(limits.Min, "m")
      .format("YYYY-MM-DD[T]HH:mm:ss.SSSZZ")
      .toString()
    const max = moment(newDate)
      .add(limits.Max, "m")
      .format("YYYY-MM-DD[T]HH:mm:ss.SSSZZ")
      .toString()

    dispatch(scheduleDateUpdated(newDate))
    dispatch(schedDateLimitsUpdated(limits, min, max))
    dispatch(checkScheduledDateRestriction())
  }
}
