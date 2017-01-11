import {
  RESOURCE_SELECTED,
  RESOURCE_IS_LOADING,
  RESOURCE_ITEMS_RECEIVED,
  RESOURCE_ITEMS_LOADING,
  RESOURCE_CORRECTIVE_ACTIONS_LOADING,
  RESOURCE_CORRECTIVE_ACTIONS_RECEIVED,
  RESOURCE_CORRECTIVE_ACTION_DOCUMENTS_RECEIVED,
} from "../constants/ActionTypes"

const initialState = {
  selected: null,
  items: [],
  isLoading: false,
  itemsLoading: false,
  isLoadingCorrectiveActions: false,
  correctiveActions: [],
  correctiveDocuments: [],
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case RESOURCE_IS_LOADING:
      return {
        ...state,
        isLoading: payload,
      }

    case RESOURCE_SELECTED:
      return {
        ...state,
        selected: payload,
      }

    case RESOURCE_ITEMS_RECEIVED:
      return {
        ...state,
        items: payload,
      }

    case RESOURCE_ITEMS_LOADING:
      return {
        ...state,
        itemsLoading: payload,
      }

    case RESOURCE_CORRECTIVE_ACTIONS_LOADING:
      return {
        ...state,
        isLoadingCorrectiveActions: payload,
      }

    case RESOURCE_CORRECTIVE_ACTIONS_RECEIVED:
      return {
        ...state,
        correctiveActions: payload,
      }

    case RESOURCE_CORRECTIVE_ACTION_DOCUMENTS_RECEIVED:
      return {
        ...state,
        correctiveDocuments: payload,
      }

    default:
      return state
  }
}
