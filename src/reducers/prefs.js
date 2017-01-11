import {
  USER_PREFERENCES_RECEIVED,
  USER_PREFERENCES_IS_LOADING,
  USER_PREFERENCES_IS_POSTING,
} from "../constants/ActionTypes"

const initialState = {
  userPrefs: [],
  webPrefs: [],
  mobilePrefs: [],
  isLoadingPrefs: false,
  isPostingPrefs: false,
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case USER_PREFERENCES_RECEIVED:
      return {
        ...state,
        userPrefs: payload.User,
        webPrefs: payload.Web,
        mobilePrefs: payload.Mobile,
      }

    case USER_PREFERENCES_IS_LOADING:
      return {
        ...state,
        isLoadingPrefs: payload,
      }

    case USER_PREFERENCES_IS_POSTING:
      return {
        ...state,
        isPostingPrefs: payload,
      }

    default:
      return state
  }
}
