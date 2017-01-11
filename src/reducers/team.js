import {
  TEAM_LOADING,
  TEAM_RECEIVED,
  TEAM_LIST_RECEIVED,
  TEAM_CLEAR_ERRORS,
  TEAM_IS_LOADING,
  TEAM_ERROR_OCCURRED,
  TEAM_PEOPLE_ADDED,
  TEAM_PEOPLE_UPDATED,
  TEAM_TOAST_MESSAGE,
  TEAM_POSTING_USER_INFO,
  TEAM_CONTACT_ADDED,
  TEAM_CONTACT_REMOVED,
  TEAM_SITE_ASSIGNMENT_ADDED,
  TEAM_SITE_ASSIGNMENT_REMOVED,
  TEAM_MEMBER_SET_ACTIVE,
  TEAM_MEMBER_SET_ROLE,
  TEAM_MEMBER_SET_SETUP_EMAIL,
} from "../constants/ActionTypes"
import * as api from "../constants/api"
import ToastHelper from "../utils/ToastHelper"

const initialState = {
  entities: [],
  entitiesList: [],
  isLoading: false,

  items: [],
  hasErrored: false,
  errorMessage: null,
  toastMessage: null,
  isPosting: false,
}

export default function reducer(state = initialState, action) {
  const { type, payload, payLoadList } = action

  switch (type) {
    case TEAM_CLEAR_ERRORS:
      return {
        ...state,
        hasErrored: false,
        errorMessage: null,
      }

    case TEAM_IS_LOADING:
      return {
        ...state,
        isLoading: payload,
      }

    case TEAM_RECEIVED:
      return {
        ...state,
        entities: payload,
        entitiesList: payLoadList,
      }

    case TEAM_LOADING:
      return {
        ...state,
        isLoading: payload,
      }

    case TEAM_LIST_RECEIVED:
      return {
        ...state,
        items: payload,
        isLoading: false,
      }

    case TEAM_ERROR_OCCURRED:
      return {
        ...state,
        hasErrored: true,
        errorMessage: payload,
        isLoading: false,
        isPosting: false,
        toastMessage: {
          level: ToastHelper.LEVEL_ERROR,
          text: payload,
          timestamp: new Date(),
        },
      }

    case TEAM_PEOPLE_ADDED:
      let newItem = {
        UserAccountId: payload.UserAccountId,
        Name: `${payload.FirstName} ${payload.LastName}`,
        FirstName: payload.FirstName,
        MiddleName: payload.MiddleName,
        LastName: payload.LastName,
        SalutationId: payload.SalutationId,
        SuffixId: payload.SuffixId,
        Email: null,
        IsActive: payload.IsActive,
        IsRegistered: false,
        IsAdmin: payload.IsAdmin,
        SetupPhone: null,
        SetupEmail: null,
        UserPicture: "",
        RoleTypeId: payload.RoleTypeId,
      }

      let items = Object.assign([], state.items)
      items.push(newItem)

      return {
        ...state,
        items,
      }

    case TEAM_PEOPLE_UPDATED:
      let updatedItem = {
        UserAccountId: payload.userAccountId,
        Name: `${payload.firstName} ${payload.lastName}`,
        FirstName: payload.firstName,
        MiddleName: payload.middleName,
        LastName: payload.lastName,
        SalutationId: payload.salutation,
        SuffixId: payload.suffix,
        Email: payload.email,
        IsActive: payload.isActive,
        IsRegistered: payload.isRegistered,
        IsAdmin: payload.isAdmin,
        SetupPhone: payload.setupPhone,
        SetupEmail: payload.setupEmail,
        UserPicture: payload.userPicture,
        RoleTypeId: payload.roleTypeId,
      }

      // Set the new state object
      let users = Object.assign([], state.items)
      const index = users.findIndex(
        x => x.UserAccountId === updatedItem.UserAccountId,
      )
      users[index] = updatedItem

      return {
        ...state,
        items: users,
      }

    case TEAM_TOAST_MESSAGE:
      return {
        ...state,
        toastMessage: payload,
      }

    case TEAM_POSTING_USER_INFO:
      return {
        ...state,
        isPosting: payload,
      }

    case TEAM_CONTACT_ADDED:
    case TEAM_CONTACT_REMOVED:
    case TEAM_SITE_ASSIGNMENT_REMOVED:
    case TEAM_SITE_ASSIGNMENT_ADDED:
      return {
        ...state,
        isPosting: false,
      }

    case TEAM_MEMBER_SET_ACTIVE:
      const activeItems = Object.assign([], state.items)
      const activeIndex = activeItems.findIndex(
        x => x.UserAccountId === payload.userAccountId,
      )

      activeItems[activeIndex].IsActive = payload.isActive

      return {
        ...state,
        items: activeItems,
      }

    case TEAM_MEMBER_SET_ROLE:
      const { userAccountId, roleId } = payload
      const roleItems = Object.assign([], state.items)
      const roleIndex = roleItems.findIndex(
        x => x.UserAccountId === userAccountId,
      )

      let isAdmin = false
      isAdmin = roleId === api.ROLE_TYPE.CUSTOMER_ADMIN
      roleItems[roleIndex].RoleTypeId = roleId
      roleItems[roleIndex].IsAdmin = isAdmin

      return {
        ...state,
        items: roleItems,
      }

    case TEAM_MEMBER_SET_SETUP_EMAIL:
      const emailItems = Object.assign([], state.items)
      const emailIndex = emailItems.findIndex(
        x => x.UserAccountId === payload.userAccountId,
      )

      emailItems[emailIndex].SetupEmail = payload.setupEmail

      return {
        ...state,
        items: emailItems,
      }

    default:
      return state
  }
}
