import {
    VENDORS_IS_LOADING, VENDORS_SUCCESS, VENDOR_DETAILS_IS_LOADING, VENDOR_DETAILS_SUCCESS, VENDOR_DETAILS_RESET
} from "../constants/ActionTypes"

const initialState = {
    isLoading: false,
    isLoadingConfigOptionVendorDetails: false,
    vendors: null,
    configOptionVendorDetails: null,
    totalCount: 0,
    selfPerformedVendor: null
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case VENDORS_IS_LOADING:
            return {
                ...state, isLoading: action.payload
            }
        case VENDORS_SUCCESS:
            return {
                ...state, vendors: action.payload.vendors, totalCount: action.payload.totalCount,
                selfPerformedVendor: action.payload.selfPerformedVendor
            }
        case VENDOR_DETAILS_IS_LOADING:
            return {
                ...state, isLoadingConfigOptionVendorDetails: action.payload
            }
        case VENDOR_DETAILS_SUCCESS:
            return {
                ...state, configOptionVendorDetails: action.payload
            }
        case VENDOR_DETAILS_RESET:
            return {
                ...state, configOptionVendorDetails: action.payload
            }

        default:
            return state;
    }
}