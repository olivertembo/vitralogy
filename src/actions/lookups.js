import request from "superagent"
import {
  LOOKUPS_COMMENT_TYPES_RECEIVED,
  LOOKUPS_DOC_CLASS_JOB_TIER_DOCUMENT,
  LOOKUPS_CONTACT_EMAIL_TYPES,
  LOOKUPS_CONTACT_PHONE_TYPES,
  LOOKUPS_USER_ACCOUNT_ROLE_TYPES,
  LOOKUPS_ACCOUNT_CONTACT_ROLES,
  LOOKUPS_PEOPLE_PREFIXES,
  LOOKUPS_PEOPLE_SUFFIXES,
  LOOKUPS_STATES
} from "../constants/ActionTypes"
import * as api from "../constants/api"

export function commentTypesReceived(payload) {
  return {
    type: LOOKUPS_COMMENT_TYPES_RECEIVED,
    payload,
  }
}

export function documentTypesReceived(payload) {
  return {
    type: LOOKUPS_DOC_CLASS_JOB_TIER_DOCUMENT,
    payload,
  }
}

export function phoneTypesReceieved(payload) {
  return {
    type: LOOKUPS_CONTACT_PHONE_TYPES,
    payload,
  }
}

export function emailTypesReceieved(payload) {
  return {
    type: LOOKUPS_CONTACT_EMAIL_TYPES,
    payload,
  }
}

export function userAccountRoleTypesReceived(payload) {
  return {
    type: LOOKUPS_USER_ACCOUNT_ROLE_TYPES,
    payload,
  }
}

export function accountRolesReceived(payload) {
  return {
    type: LOOKUPS_ACCOUNT_CONTACT_ROLES,
    payload,
  }
}

export function peoplePrefixesReceived(payload) {
  return {
    type: LOOKUPS_PEOPLE_PREFIXES,
    payload,
  }
}
export function peopleSuffixesReceived(payload) {
  return {
    type: LOOKUPS_PEOPLE_SUFFIXES,
    payload,
  }
}

export function commentTypesRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.commentTypes.length === 0) {
      const { userAccounts } = state

      request
        .get(api.COMMENT_TYPES)
        .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
        .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
        .query({ type: api.COMMENT_TYPE_CUSTOMER })
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            dispatch(commentTypesReceived(response.body))
          },
          () => {
            console.log("failure to get comment types")
          },
        )
    }
  }
}

// Currently only retrieves one class type, need to expand
// store to keep track of classes by class id, with the mappings
// associated to that class
export function documentClassesRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.documentTypes.length === 0) {
      const { userAccounts } = state

      request
        .get(api.COMMON_DOCUMENT_MAPPINGS)
        .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
        .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
        .query({ docClassEnumId: api.DOC_CLASS_JOB_TIER_DOCUMENT })
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            dispatch(documentTypesReceived(response.body))
          },
          () => {
            console.log("failure to get DOC_CLASS_JOB_TIER_DOCUMENT types")
          },
        )
    }
  }
}

export function emailTypesRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.emailTypes.length === 0) {
      const { userAccounts } = state

      request
        .get(api.EMAIL_TYPES)
        .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
        .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            dispatch(emailTypesReceieved(response.body))
          },
          () => {
            console.log("failure to get email types")
          },
        )
    }
  }
}

export function phoneTypesRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.phoneTypes.length === 0) {
      const { userAccounts } = state

      request
        .get(api.PHONE_NUMBER_TYPES)
        .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
        .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            dispatch(phoneTypesReceieved(response.body))
          },
          () => {
            console.log("failure to get phone types")
          },
        )
    }
  }
}

export function userAccountRoleTypesRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.userAccountRoleTypes.length === 0) {
      const { token, vasToken } = state.userAccounts

      request
        .get(api.TEAM_ROLE_VALUES)
        .set(api.AUTH_HEADER_AUTH0, token)
        .set(api.AUTH_HEADER_VITRALOGY, vasToken)
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            if (response.body.IsSuccess === true) {
              dispatch(userAccountRoleTypesReceived(response.body.Roles))
            } else {
              console.log("failure to get roles")
            }
          },
          () => {
            console.log("failure to get roles")
          },
        )
    }
  }
}

export function accountRolesRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.accountRoles.length === 0) {
      const { token, vasToken } = state.userAccounts

      request
        .get(api.CONTACT_ROLES)
        .set(api.AUTH_HEADER_AUTH0, token)
        .set(api.AUTH_HEADER_VITRALOGY, vasToken)
        .query({ roleType: "Account" })
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            dispatch(accountRolesReceived(response.body))
          },
          () => {
            console.log("failure to get account role types")
          },
        )
    }
  }
}

export function peoplePrefixRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.salutations.length === 0) {
      const { userAccounts } = state

      request
        .get(api.COMMON_PEOPLE_PREFIXES)
        .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
        .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            dispatch(peoplePrefixesReceived(response.body))
          },
          () => {
            console.log("failure to get people prefixes")
          },
        )
    }
  }
}

export function peopleSuffixRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.suffixes.length === 0) {
      const { userAccounts } = state

      request
        .get(api.COMMON_PEOPLE_SUFFIXES)
        .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
        .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            dispatch(peopleSuffixesReceived(response.body))
          },
          () => {
            console.log("failure to get people suffixes")
          },
        )
    }
  }
}

export function usStatesRequest() {
  return (dispatch, getState) => {
    const state = getState()

    if (state.lookups.states.length === 0) {
      const { userAccounts } = state

      request
        .get(api.COMMON_US_STATES)
        .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
        .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            dispatch({ type: LOOKUPS_STATES, payload: response.body.States })
          },
        )
    }
  }
}
