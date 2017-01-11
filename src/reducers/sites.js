import {
  SITE_SELECTED,
  SITE_IS_LOADING,
  SITE_ITEMS_RECEIVED,
  SITE_ITEMS_LOADING,
  SITE_DETAILS_LOADING,
  SITE_DETAILS_RECEIVED,
} from "../constants/ActionTypes"

const initialState = {
  selected: null,
  items: [],
  isLoading: false,
  itemsLoading: false,

  isLoadingDetails: false,
  selectedDetails: null,
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case SITE_IS_LOADING:
      return {
        ...state,
        isLoading: payload,
      }

    case SITE_SELECTED:
      return {
        ...state,
        selected: payload,
      }

    case SITE_ITEMS_RECEIVED:
      return {
        ...state,
        items: payload,
      }

    case SITE_ITEMS_LOADING:
      return {
        ...state,
        itemsLoading: payload,
      }

    case SITE_DETAILS_LOADING:
      return {
        ...state,
        isLoadingDetails: payload,
      }

    case SITE_DETAILS_RECEIVED:
      return {
        ...state,
        selectedDetails: payload,
      }

    default:
      return state
  }
}
