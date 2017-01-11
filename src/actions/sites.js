import request from "superagent"
import {
  SITE_SELECTED,
  SITE_IS_LOADING,
  SITE_ITEMS_RECEIVED,
  SITE_ITEMS_LOADING,
  SITE_DETAILS_LOADING,
  SITE_DETAILS_RECEIVED,
} from "../constants/ActionTypes"
import * as api from "../constants/api"

export function siteSelected(payload) {
  return {
    type: SITE_SELECTED,
    payload,
  }
}

export function siteIsLoading(payload) {
  return {
    type: SITE_IS_LOADING,
    payload,
  }
}

export function siteItemsReceived(payload) {
  return {
    type: SITE_ITEMS_RECEIVED,
    payload,
  }
}

export function siteItemsLoading(payload) {
  return {
    type: SITE_ITEMS_LOADING,
    payload,
  }
}

export function selectSite(site) {
  return dispatch => {
    dispatch(siteSelected(site))
  }
}

export function clearSiteItems() {
  return dispatch => {
    const empty = []
    dispatch(siteItemsReceived(empty))
  }
}

export function clearSiteDetails() {
  return dispatch => {
    const empty = {}
    dispatch(siteDetailsReceived(empty))
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
