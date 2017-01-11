import request from "superagent"
import { camelizeKeys } from "humps"

import {
    CRITICAL_DATES_IS_LOADING, CRITICAL_DATES_ASSET_TYPES_SUCCESS,
    CRITICAL_DATES_COMPLIANCES_SUCCESS, CRITICAL_DATES_RESET,
    CRITICAL_DATES_FETCH_SCHEDULES_DONE
} from "../constants/ActionTypes"
import * as api from "../constants/api"

// const criticalDatesAssetTypesError = (payload) => ({ type: CRITICAL_DATES_ASSET_TYPES_ERROR, payload })
// const criticalDatesCompliancesError = (payload) => ({ type: CRITICAL_DATES_COMPLIANCES_ERROR, payload })
// const criticalDatesComplianceSaved = (payload) => ({ type: CRITICAL_DATES_COMPLIANCE_SAVED, payload })

const criticalDatesIsLoading = (payload) => ({ type: CRITICAL_DATES_IS_LOADING, payload })
const criticalDatesAssetTypesSuccess = (payload) => ({ type: CRITICAL_DATES_ASSET_TYPES_SUCCESS, payload })
const criticalDatesCompliancesSuccess = (payload) => ({ type: CRITICAL_DATES_COMPLIANCES_SUCCESS, payload })
const criticalDatesReset = (payload) => ({ type: CRITICAL_DATES_RESET, payload })

export function fetchSchedules(scheduleGroupIds) {
    return (dispatch, getState) => {
        const state = getState()

        const groupIds = scheduleGroupIds.filter(id => !state.criticalDates.scheduleGroup[id]
            || (state.criticalDates.scheduleGroup[id] && state.criticalDates.scheduleGroup[id].length === 0))

        if (groupIds && groupIds.length > 0) {
            request
                .post(`${api.CUSTOMER_API_ROOT}critical-dates/schedule/groups`)
                .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
                .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
                .send(groupIds)
                .then(
                    response => {
                        const json = camelizeKeys(response.body)

                        dispatch({ type: CRITICAL_DATES_FETCH_SCHEDULES_DONE, payload: { items: json, groupIds } })
                    },
                    () => dispatch(criticalDatesIsLoading(false)))
                .catch(() => dispatch(criticalDatesIsLoading(false)))
        }
    }
}

export function fetchCompliances(assetTypeId, siteId) {
    return (dispatch, getState) => {
        dispatch(criticalDatesIsLoading(true))

        const state = getState()

        request
            .get(`${api.CUSTOMER_API_ROOT}sites/${siteId}/asset-types/${assetTypeId}/compliances`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        const json = camelizeKeys(response.body)

                        dispatch(criticalDatesCompliancesSuccess({ items: json.items, assetTypeId }))
                    }

                    dispatch(criticalDatesIsLoading(false))
                },
                () => dispatch(criticalDatesIsLoading(false)))
            .catch(() => dispatch(criticalDatesIsLoading(false)))
    }
}

export function fetchData(siteId) {
    return (dispatch, getState) => {
        dispatch(criticalDatesIsLoading(true))
        const state = getState()

        request
            .get(`${api.CUSTOMER_API_ROOT}sites/${siteId}/asset-types`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        const json = camelizeKeys(response.body)

                        dispatch(criticalDatesAssetTypesSuccess(json.assetTypes))

                        if (json.assetTypes) {
                            json.assetTypes.forEach(a => dispatch(fetchCompliances(a.assetTypeId, siteId)))
                        }

                        dispatch(criticalDatesIsLoading(false))
                    }
                },
                err => dispatch(criticalDatesIsLoading(false)))
            .catch(err => dispatch(criticalDatesIsLoading(false)))
    }
}

export function resetCriticalDates() {
    return dispatch => dispatch(criticalDatesReset(null))
}

