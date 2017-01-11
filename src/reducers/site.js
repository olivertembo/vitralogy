import {
  SITE_DETAILS_LOADING,
  SITE_DETAILS_RECEIVED,
} from "../constants/ActionTypes"

const initialState = {
  isLoadingDetails: false,
  details: {},
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case SITE_DETAILS_LOADING:
      return {
        ...state,
        isLoadingDetails: payload,
      }

    case SITE_DETAILS_RECEIVED:
      return {
        ...state,
        details: payload,
      }

    default:
      return state
  }
}
