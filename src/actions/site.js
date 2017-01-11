import request from "superagent"
import {
  SITE_DETAILS_LOADING,
  SITE_DETAILS_RECEIVED,
} from "../constants/ActionTypes"
import * as api from "../constants/api"

export function clearSiteDetails() {
  return dispatch => {
    dispatch(siteDetailsReceived(null))
  }
}

export function setSiteDetails(details) {
  return dispatch => {
    dispatch(siteDetailsReceived(details))
  }
}

export function siteDetailsLoading(payload) {
  return {
    type: SITE_DETAILS_LOADING,
    payload,
  }
}

export function siteDetailsReceived(payload) {
  return {
    type: SITE_DETAILS_RECEIVED,
    payload,
  }
}

export function getSiteDetails(siteId) {
  return (dispatch, getState) => {
    const state = getState()

    dispatch(siteDetailsLoading(true))

    const { userAccounts } = state

    const url = api.SITE_DETAILS

    request
      .get(url)
      .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
      .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
      .query({ id: siteId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            const siteData = response.body.Details
            dispatch(siteDetailsReceived(siteData))
          }
        },
        () => {
          console.log("failed to get site details")
        },
      )
      .then(() => {
        dispatch(siteDetailsLoading(false))
      })
  }
}
