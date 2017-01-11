import request from "superagent"
import { camelizeKeys } from "humps"

import {
    ASSETS_BY_OPTION_IS_LOADING, ASSETS_SAVE_OPTION_ASSET_DONE, ASSETS_OPTION_LAST_PERFOMED_DATE_DONE,
    ASSETS_BY_OPTION_RECEIVED, ASSETS_ASSET_LAST_PERFOMED_DATE_DONE, ASSETS_OPTION_CONTAINER_UPDATE,
    ASSETS_OPTION_ASSET_SETUP_IS_SAVING, ASSETS_OPTION_ASSET_SETUP_DONE, RESET_CONTAINER_STATUS, UPDATE_ASSET_SCHEDULE
} from "../constants/ActionTypes"
import * as api from "../constants/api"

const assetsOptionIsLoading = payload => ({ type: ASSETS_BY_OPTION_IS_LOADING, payload })
const assetsByOptionReceived = payload => ({ type: ASSETS_BY_OPTION_RECEIVED, payload })
const assetsSaveOptionAssetDone = payload => ({ type: ASSETS_SAVE_OPTION_ASSET_DONE, payload })
const assetsSaveOptionAssetLastPerformedDateDone = payload => ({ type: ASSETS_ASSET_LAST_PERFOMED_DATE_DONE, payload })
const assetsSaveOptionLastPerformedDateDone = payload => ({ type: ASSETS_OPTION_LAST_PERFOMED_DATE_DONE, payload })
const assetOptionSetupSaving = payload => ({ type: ASSETS_OPTION_ASSET_SETUP_IS_SAVING, payload })
const saveOptionAssetSetupDone = payload => ({ type: ASSETS_OPTION_ASSET_SETUP_DONE, payload })

export const updateContainerAssets = payload => ({ type: ASSETS_OPTION_CONTAINER_UPDATE, payload })

export function fetchAssetsByOption(option) {
    return (dispatch, getState) => {
        const state = getState()

        dispatch(assetsOptionIsLoading({ ...option, isLoading: true }))

        request
            .get(`${api.CUSTOMER_API_ROOT}sites/${option.siteId}/asset-types/${option.assetTypeId}/compliances/${option.complianceId}/options/${option.optionId}/assets`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        const json = camelizeKeys(response.body)

                        dispatch(assetsByOptionReceived({ ...option, assets: json.assets }))
                    }

                    dispatch(assetsOptionIsLoading({ ...option, isLoading: false }))
                },
                err => dispatch(assetsOptionIsLoading({ ...option, isLoading: false })))
            .catch(err => dispatch(assetsOptionIsLoading({ ...option, isLoading: false })))
    }
}

export function saveOptionAsset(params) {
    return (dispatch, getState) => {
        const state = getState()
        const { assetId, isChecked, ...option } = params

        dispatch(assetsOptionIsLoading({ ...option, isLoading: true }))

        request
            .post(`${api.CUSTOMER_API_ROOT}sites/${option.siteId}/asset-types/${option.assetTypeId}/compliances/${option.complianceId}/options/${option.optionId}/assets/${assetId}?isChecked=${isChecked}`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        const asset = {
                            ...option, assetId, colorId: response.body.ColorId,
                            status: response.body.Status, isChecked: response.body.IsChecked,
                            statusId: response.body.StatusId, lastDate: response.body.LastDate,
                            isLastProcessInProgress: response.body.IsLastProcessInProgress,
                            customerComplianceOptionAssetId: response.body.CustomerComplianceOptionAssetId
                        }

                        const containerStatus = { optionStatus: response.body.OptionStatus, optionStatusId: response.body.OptionStatusId }

                        dispatch(assetsSaveOptionAssetDone({ asset: asset, containerStatus: containerStatus }))
                    }

                    dispatch(assetsOptionIsLoading({ ...option, isLoading: false }))
                },
                err => dispatch(assetsOptionIsLoading({ ...option, isLoading: false })))
            .catch(err => dispatch(assetsOptionIsLoading({ ...option, isLoading: false })))
    }
}

export function saveOptionAssetChanges(params) {
    return (dispatch, getState) => {
        const state = getState()
        const { assetId, lastDate, isLastProcessInProgress, ...option } = params

        dispatch(assetsOptionIsLoading({ ...option, isLoading: true }))

        request
            .post(`${api.CUSTOMER_API_ROOT}sites/${option.siteId}/asset-types/${option.assetTypeId}/compliances/${option.complianceId}/options/${option.optionId}/assets/${assetId}`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .send({
                LastDate: lastDate,
                IsLastProcessInProgress: isLastProcessInProgress
            })
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        dispatch(assetsSaveOptionAssetLastPerformedDateDone({
                            ...option, assetId,
                            lastDate, isLastProcessInProgress,
                            status: response.body.Status,
                            statusId: response.body.StatusId
                        }))
                    }

                    dispatch(assetsOptionIsLoading({ ...option, isLoading: false }))
                },
                err => dispatch(assetsOptionIsLoading({ ...option, isLoading: false })))
            .catch(err => dispatch(assetsOptionIsLoading({ ...option, isLoading: false })))
    }
}

export function saveOptionAssetSetup(params) {
    return (dispatch, getState) => {
        const state = getState()
        const { isSetupDone, ...option } = params

        dispatch(assetOptionSetupSaving({ ...option, isSetupSaving: true }))

        request
            .post(`${api.CUSTOMER_API_ROOT}sites/${option.siteId}/asset-types/${option.assetTypeId}/compliances/${option.complianceId}/options/${option.optionId}/assets/${option.assetId}/status`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .send({
                IsSetUpDone: isSetupDone
            })
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        dispatch(saveOptionAssetSetupDone({ ...option, status: response.body.Status, statusId: response.body.StatusId }))
                    }

                    dispatch(assetOptionSetupSaving({ ...option, isSetupSaving: false }))
                },
                err => dispatch(assetOptionSetupSaving({ ...option, isSetupSaving: false })))
            .catch(err => dispatch(assetOptionSetupSaving({ ...option, isSetupSaving: false })))
    }
}

export function saveOptionLastPerformedDate(params) {
    return dispatch => {
        dispatch(assetsSaveOptionLastPerformedDateDone({ ...params }))
    }
}

export function resetContainerStatus(key, data) {
    return (dispatch, getState) => {
        const state = getState()
        if (state.assets && state.assets[key] && state.assets[key].containerStatus) {
            dispatch({ type: RESET_CONTAINER_STATUS, payload: { key: key, containerStatus: data } })
        }
    }
}

export function updateAssetSchedule(option) {
    return (dispatch, getState) => {
        const state = getState()

        dispatch(assetsOptionIsLoading({ ...option, isLoading: true }))

        request
            .post(`${api.CUSTOMER_API_ROOT}critical-dates/schedule/asset/${option.customerComplianceOptionAssetId}/sequence/${option.scheduleSequenceId}`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .then(
                response => {
                    if (response.body.StatusId) {
                        dispatch({
                            type: UPDATE_ASSET_SCHEDULE,
                            payload: {
                                ...option,
                                status: response.body.Status,
                                statusId: response.body.StatusId
                            }
                        })
                    }

                    dispatch(assetsOptionIsLoading({ ...option, isLoading: false }))
                },
                err => dispatch(assetsOptionIsLoading({ ...option, isLoading: false })))
            .catch(err => dispatch(assetsOptionIsLoading({ ...option, isLoading: false })))
    }
}