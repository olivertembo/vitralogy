import {
    CRITICAL_DATES_IS_LOADING, CRITICAL_DATES_ASSET_TYPES_SUCCESS, CRITICAL_DATES_FETCH_SCHEDULES_DONE,
    CRITICAL_DATES_COMPLIANCES_SUCCESS, CRITICAL_DATES_RESET, CRITICAL_DATES_UPDATE_ASSET_TYPE_STATUS
} from "../constants/ActionTypes"

const initialState = {
    isLoading: false,
    assetTypes: null,
    scheduleGroup: {}
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case CRITICAL_DATES_IS_LOADING:
            return {
                ...state, isLoading: action.payload
            }
        case CRITICAL_DATES_ASSET_TYPES_SUCCESS:
            return {
                ...state, assetTypes: action.payload
            }
        case CRITICAL_DATES_COMPLIANCES_SUCCESS:
            return {
                ...state,
                assetTypes: state.assetTypes.map(x =>
                    x.assetTypeId === action.payload.assetTypeId ?
                        { ...x, compliances: action.payload.items, isAnyChildChecked: action.payload.items.some(c => c.isChecked) } : x)
            }
        case CRITICAL_DATES_RESET:
            return {
                ...state, assetTypes: action.payload
            }
        case CRITICAL_DATES_UPDATE_ASSET_TYPE_STATUS:
            let assetType = state.assetTypes.find(a => a.assetTypeId === action.payload.assetTypeId)

            if (assetType) {
                let compliance = assetType.compliances.find(c => c.complianceClassId === action.payload.complianceId)

                if (compliance) {
                    compliance.isChecked = action.payload.isChecked
                }
            }
            return {
                ...state,
                assetTypes: state.assetTypes.map(x =>
                    x.assetTypeId === action.payload.assetTypeId ?
                        { ...x, isAnyChildChecked: x.compliances.some(c => c.isChecked) } : x)
            }
        case CRITICAL_DATES_FETCH_SCHEDULES_DONE: {
            let groups = {}

            action.payload.groupIds.forEach(g => {
                groups[g] = action.payload.items.filter(x => x.groupId === g).sort((a, b) => a.sequenceNumber - b.sequenceNumber)
            });

            return {
                ...state,
                scheduleGroup: {
                    ...state.scheduleGroup,
                    ...groups
                }
            }
        }

        default:
            return state;
    }
}