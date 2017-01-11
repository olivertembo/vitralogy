import {
    ASSETS_BY_OPTION_IS_LOADING, ASSETS_BY_OPTION_RECEIVED, ASSETS_SAVE_OPTION_ASSET_DONE, UPDATE_ASSET_SCHEDULE,
    ASSETS_ASSET_LAST_PERFOMED_DATE_DONE, ASSETS_OPTION_LAST_PERFOMED_DATE_DONE, ASSETS_OPTION_CONTAINER_UPDATE,
    ASSETS_OPTION_ASSET_SETUP_IS_SAVING, ASSETS_OPTION_ASSET_SETUP_DONE, RESET_CONTAINER_STATUS, ASSETS_UPDATE_ASSET
} from "../constants/ActionTypes"

const initialState = {}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case ASSETS_BY_OPTION_IS_LOADING: {
            return { ...state, [action.payload.key]: { ...state[action.payload.key], ...action.payload } }
        }
        case ASSETS_BY_OPTION_RECEIVED:
            return { ...state, [action.payload.key]: { ...state[action.payload.key], ...action.payload } }
        case ASSETS_SAVE_OPTION_ASSET_DONE: {
            return {
                ...state,
                [action.payload.asset.key]: {
                    ...state[action.payload.asset.key],
                    assets: state[action.payload.asset.key].assets
                        .map(a => a.assetId === action.payload.asset.assetId ? { ...a, ...action.payload.asset } : a),
                    containerStatus: action.payload.containerStatus
                }
            }
        }
        case ASSETS_ASSET_LAST_PERFOMED_DATE_DONE: {
            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    assets: state[action.payload.key].assets
                        .map(a => a.assetId === action.payload.assetId ? { ...a, ...action.payload } : a)
                }
            }
        }
        case ASSETS_OPTION_LAST_PERFOMED_DATE_DONE: {
            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    assets: state[action.payload.key].assets.map(a =>
                        ({ ...a, lastTimePerformed: action.payload.lastPerformedDate }))
                }
            }
        }
        case ASSETS_OPTION_CONTAINER_UPDATE: {
            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    assets: state[action.payload.key].assets.map(a =>
                        ({ ...a, status: action.payload.status, statusId: action.payload.statusId }))
                }
            }
        }
        case ASSETS_OPTION_ASSET_SETUP_IS_SAVING: {
            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    assets: state[action.payload.key].assets.map(a => a.assetId === action.payload.assetId ?
                        { ...a, isSetupSaving: action.payload.isSetupSaving } : a)
                }
            }
        }
        case ASSETS_OPTION_ASSET_SETUP_DONE: {
            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    assets: state[action.payload.key].assets.map(a => {
                        let q = a.assetId === action.payload.assetId ?
                            { ...a, status: action.payload.status, statusId: action.payload.statusId } : a

                        return q
                    })
                }
            }
        }
        case RESET_CONTAINER_STATUS: {
            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    containerStatus: action.payload.containerStatus
                }
            }
        }
        case ASSETS_UPDATE_ASSET: {
            let asset = state[action.payload.key].assets.find(a => a.assetId === action.payload.asset.assetId)

            if (!asset) {
                state[action.payload.key].assets.push(action.payload.asset)
            }
            else {
                asset.name = action.payload.asset.name
            }

            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    assets: state[action.payload.key].assets
                }
            }
        }
        case UPDATE_ASSET_SCHEDULE: {
            return {
                ...state,
                [action.payload.key]: {
                    ...state[action.payload.key],
                    assets: state[action.payload.key].assets
                        .map(a => a.assetId === action.payload.assetId ? { ...a, ...action.payload } : a)
                }
            }
        }

        default:
            return state
    }
}