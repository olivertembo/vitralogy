import request from "superagent"
import { camelizeKeys } from "humps"

import {
    VENDORS_IS_LOADING, VENDOR_DETAILS_IS_LOADING,
    VENDORS_ERROR, VENDOR_DETAILS_SUCCESS,
    VENDORS_SUCCESS, VENDOR_DETAILS_RESET
} from "../constants/ActionTypes"
import * as api from "../constants/api"

export const vendorsIsLoading = (payload) => ({ type: VENDORS_IS_LOADING, payload })
export const vendorDetailsIsLoading = (payload) => ({ type: VENDOR_DETAILS_IS_LOADING, payload })
export const vendorDetailsSuccess = (payload) => ({ type: VENDOR_DETAILS_SUCCESS, payload })
export const vendorDetailsReset = (payload) => ({ type: VENDOR_DETAILS_RESET, payload })
export const vendorsSuccess = (payload) => ({ type: VENDORS_SUCCESS, payload })
export const vendorsError = (payload) => ({ type: VENDORS_ERROR, payload })

export function fetchVendors(vendorsDetails) {
    return (dispatch, getState) => {
        dispatch(vendorsIsLoading(true))

        const state = getState()

        request
            .post(`${api.CUSTOMER_API_ROOT}vendors`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .send({
                VendorNameFilter: vendorsDetails.filterByName,
                AddressFilter: vendorsDetails.addressFilter,
                PhoneFilter: vendorsDetails.phoneFilter,
                PageNumber: vendorsDetails.pageNumber,
                PageSize: vendorsDetails.pageSize
            })
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        dispatch(vendorsSuccess(camelizeKeys(response.body)))
                    }

                    dispatch(vendorsIsLoading(false))
                },
                () => dispatch(vendorsIsLoading(false))
            ).catch(() => dispatch(vendorsIsLoading(false)))
    }
}

export function fetchVendorDetails(id) {
    return (dispatch, getState) => {
        dispatch(vendorDetailsIsLoading(true))

        const state = getState()

        request
            .get(`${api.CUSTOMER_API_ROOT}vendors/${id}`)
            .set(api.AUTH_HEADER_AUTH0, state.userAccounts.token)
            .set(api.AUTH_HEADER_VITRALOGY, state.userAccounts.vasToken)
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        const json = camelizeKeys(response.body)

                        dispatch(vendorDetailsSuccess(json))
                    }

                    dispatch(vendorDetailsIsLoading(false))
                },
                () => dispatch(vendorDetailsIsLoading(false))
            ).catch(() => dispatch(vendorDetailsIsLoading(false)))
    }
}