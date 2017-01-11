import request from "superagent"
import {
  RESOURCE_SELECTED,
  RESOURCE_IS_LOADING,
  RESOURCE_ITEMS_RECEIVED,
  RESOURCE_ITEMS_LOADING,
  RESOURCE_CORRECTIVE_ACTIONS_LOADING,
  RESOURCE_CORRECTIVE_ACTIONS_RECEIVED,
  RESOURCE_CORRECTIVE_ACTION_DOCUMENTS_RECEIVED,
} from "../constants/ActionTypes"
import * as api from "../constants/api"

export function resourceSelected(payload) {
  return {
    type: RESOURCE_SELECTED,
    payload,
  }
}

export function resourceIsLoading(payload) {
  return {
    type: RESOURCE_IS_LOADING,
    payload,
  }
}

export function resourceItemsReceived(payload) {
  return {
    type: RESOURCE_ITEMS_RECEIVED,
    payload,
  }
}

export function resourceItemsLoading(payload) {
  return {
    type: RESOURCE_ITEMS_LOADING,
    payload,
  }
}

export function selectResource(resource) {
  return dispatch => {
    dispatch(resourceSelected(resource))
  }
}

export function clearResourceItems() {
  return dispatch => {
    const empty = []
    dispatch(resourceItemsReceived(empty))
  }
}

export function resourceCorrectiveActionsLoading(payload) {
  return {
    type: RESOURCE_CORRECTIVE_ACTIONS_LOADING,
    payload,
  }
}

export function resourceCorrectiveActionsReceived(payload) {
  return {
    type: RESOURCE_CORRECTIVE_ACTIONS_RECEIVED,
    payload,
  }
}

export function resourceCorrectiveActionDocumentsReceived(payload) {
  return {
    type: RESOURCE_CORRECTIVE_ACTION_DOCUMENTS_RECEIVED,
    payload,
  }
}

export function getResourceCorrectiveAction() {
  return (dispatch, getState) => {
    const state = getState()
    const { userAccounts, jobs, resources } = state

    if (
      jobs !== undefined &&
      jobs !== null &&
      jobs.selected !== null &&
      resources.selected !== null
    ) {
      dispatch(resourceCorrectiveActionsLoading(true))

      const currentSelectedResource = resources.selected.value
      const jobResourceId = currentSelectedResource.JobResourceId
      const jobId = jobs.selected.JobId
      const jobSourcingTierId = jobs.selected.ActiveTierId

      const url = `${api.JOBS_ROOT}${jobId}${
        api.JOB_CORRECTIVE_ACTION_ENDPOINT
      }`
      console.log(
        `Retrieving tier#${jobSourcingTierId} resource#${jobResourceId} corrective actions: ${url}...`,
      )

      request
        .get(url)
        .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
        .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
        .query({ jobResourceId: jobResourceId })
        .query({ jobSourcingTierId: jobSourcingTierId })
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            if (response.body.IsSuccess === true) {
              const actions = response.body.CorrectiveActions
              const documents = response.body.CorrectiveDocuments
              dispatch(resourceCorrectiveActionsReceived(actions))
              dispatch(resourceCorrectiveActionDocumentsReceived(documents))
            } else {
              console.log("failed to get corrective actions")
            }
          },
          () => {
            console.log("failed to get corrective actions")
          },
        )
        .then(() => {
          dispatch(resourceCorrectiveActionsLoading(false))
        })
    }
  }
}
