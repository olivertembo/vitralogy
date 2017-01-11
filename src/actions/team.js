import request from "superagent"
import {
  TEAM_LOADING,
  TEAM_RECEIVED,
  TEAM_LIST_RECEIVED,
  TEAM_ERROR_OCCURRED,
  TEAM_IS_LOADING,
  TEAM_PEOPLE_ADDED,
  TEAM_PEOPLE_UPDATED,
  TEAM_TOAST_MESSAGE,
  TEAM_CONTACT_ADDED,
  TEAM_POSTING_USER_INFO,
  TEAM_CONTACT_REMOVED,
  TEAM_SITE_ASSIGNMENT_ADDED,
  TEAM_SITE_ASSIGNMENT_REMOVED,
  TEAM_MEMBER_SET_ACTIVE,
  TEAM_MEMBER_SET_ROLE,
  TEAM_MEMBER_SET_SETUP_EMAIL,
} from "../constants/ActionTypes"
import ToastHelper from "../utils/ToastHelper"
import * as api from "../constants/api"

export function teamIsLoading(payload) {
  return {
    type: TEAM_LOADING,
    payload,
  }
}

export function teamReceived(payload, payLoadList) {
  return {
    type: TEAM_RECEIVED,
    payload,
    payLoadList,
  }
}

function toastMessage(level, text) {
  return {
    type: TEAM_TOAST_MESSAGE,
    payload: {
      level,
      text,
      timestamp: new Date(),
    },
  }
}

function teamListReceived(payload) {
  return {
    type: TEAM_LIST_RECEIVED,
    payload,
  }
}

function errorOccurred(payload) {
  return {
    type: TEAM_ERROR_OCCURRED,
    payload,
  }
}

function toggleIsLoading(payload) {
  return {
    type: TEAM_IS_LOADING,
    payload,
  }
}

function peopleAdded(payload) {
  return {
    type: TEAM_PEOPLE_ADDED,
    payload,
  }
}

function peopleUpdated(payload) {
  return {
    type: TEAM_PEOPLE_UPDATED,
    payload,
  }
}

function setIsPosting(payload) {
  return {
    type: TEAM_POSTING_USER_INFO,
    payload,
  }
}

function contactAdded(payload) {
  return {
    type: TEAM_CONTACT_ADDED,
    payload,
  }
}

function contactRemoved(payload) {
  return {
    type: TEAM_CONTACT_REMOVED,
    payload,
  }
}

function siteAssignmentAdded(payload) {
  return {
    type: TEAM_SITE_ASSIGNMENT_ADDED,
    payload,
  }
}

function siteAssignmentRemoved(payload) {
  return {
    type: TEAM_SITE_ASSIGNMENT_REMOVED,
    payload,
  }
}

function toggleMemberActive(payload) {
  return {
    type: TEAM_MEMBER_SET_ACTIVE,
    payload,
  }
}

function setMemberRoleType(payload) {
  return {
    type: TEAM_MEMBER_SET_ROLE,
    payload,
  }
}

function setSetupEmail(payload) {
  return {
    type: TEAM_MEMBER_SET_SETUP_EMAIL,
    payload,
  }
}

export function addPeople(payload) {
  return (dispatch, getState) => {
    const { token, vasToken } = getState().userAccounts

    const {
      firstName,
      lastName,
      middleName,
      salutation,
      suffix,
      accountId,
    } = payload

    const url = api.TEAM_POST_PEOPLE
    console.log(`Posting new team member: ${url}`)

    return request("post", url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .send({ accountId })
      .send({ firstName })
      .send({ lastName })
      .send({ middleName })
      .send({ salutationId: salutation || null })
      .send({ suffixId: suffix || null })
      .then(response => {
        if (response.body.IsSuccess) {
          dispatch(peopleAdded(response.body))
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              `Team member added successfully.`,
            ),
          )
        } else {
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_ERROR,
              `Error adding team member: ${response.body.Msg}!`,
            ),
          )
        }
      })
      .catch(() => {
        dispatch(
          toastMessage(ToastHelper.LEVEL_ERROR, `Error adding team member!`),
        )
      })
  }
}

export function updatePeople(payload) {
  return (dispatch, getState) => {
    const { token, vasToken } = getState().userAccounts

    const {
      firstName,
      lastName,
      middleName,
      salutation,
      suffix,
      userAccountId,
    } = payload

    const url = api.TEAM_PEOPLE_UPDATE
    console.log(`Posting team member update: ${url}`)

    return request("post", url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .send({ userAccountId })
      .send({ firstName })
      .send({ lastName })
      .send({ middleName })
      .send({ salutationId: salutation || null })
      .send({ suffixId: suffix || null })
      .then(response => {
        if (response.body.IsSuccess) {
          dispatch(peopleUpdated(payload))
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              `Team member updated successfully.`,
            ),
          )
        } else {
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_ERROR,
              `Error updating team member: ${response.body.Msg}!`,
            ),
          )
        }
      })
      .catch(() => {
        dispatch(
          toastMessage(ToastHelper.LEVEL_ERROR, `Error updating team member!`),
        )
      })
  }
}

export function teamRequest(payload) {
  return (dispatch, getState) => {
    dispatch(toggleIsLoading(true))

    const { token, vasToken } = getState().userAccounts
    const { accountId } = payload

    const url = api.CUSTOMER_TEAM
    console.log(`Retrieving team: ${url}`)

    return request("get", url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .query({ accountId })
      .then(response => {
        if (response.body.IsSuccess) {
          dispatch(teamListReceived(response.body.TeamList))
        } else {
          dispatch(errorOccurred(response.body.Msg))
        }
      })
      .catch(() => {
        dispatch(errorOccurred("Unable to retrieve team info from server."))
      })
  }
}

export function postNewContactItem(payload) {
  return (dispatch, getState) => {
    dispatch(setIsPosting(true))

    const { token, vasToken } = getState().userAccounts
    const {
      userAccountId,
      contactTypeId,
      contactInput,
      contactOption,
    } = payload

    let url = api.EMAIL_NEW
    if (contactOption === "0") {
      url = `${url}?emailAddressTypeId=${contactTypeId}&email=${contactInput}`
    } else {
      url = api.PHONE_NEW
      url = `${url}?phoneNumberTypeId=${contactTypeId}&phone=${contactInput}`
    }

    return request("post", url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .query({ userAccountId })
      .then(response => {
        if (response.body.IsSuccess) {
          dispatch(contactAdded())
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              `Contact item added successfully.`,
            ),
          )

          return response.body
        }

        dispatch(errorOccurred(response.body.Msg))
      })
      .catch(() => {
        dispatch(errorOccurred("Error adding new contact item!"))
      })
  }
}

export function postRemoveContactItem(payload) {
  return (dispatch, getState) => {
    dispatch(setIsPosting(true))

    const { token, vasToken } = getState().userAccounts
    const { userAccountId } = payload

    let url = api.EMAIL_REMOVE
    if (payload.FullNumber === undefined) {
      url = `${url}?peopleEmailAddrId=${
        payload.PeopleEmailAddrId
      }&emailAddressId=${payload.EmailAddressId}`
    } else {
      url = api.PHONE_REMOVE
      url = `${url}?peoplePhoneNumberId=${
        payload.PeoplePhoneNumberId
      }&phoneNumberId=${payload.PhoneNumberId}`
    }

    return request("post", url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .query({ userAccountId })
      .then(response => {
        if (response.body.IsSuccess === true) {
          dispatch(contactRemoved())
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              "Contact item removed successfully.",
            ),
          )

          return response.body
        }

        dispatch(errorOccurred(response.body.Msg))
      })
      .catch(() => {
        dispatch(errorOccurred("Error removing contact item!"))
      })
  }
}

export function postAddSiteAssignment(payload) {
  return (dispatch, getState) => {
    dispatch(setIsPosting(true))

    const { token, vasToken } = getState().userAccounts
    const { userAccountId, AccountSiteId } = payload

    return request("post", api.SITE_RESTRICTIONS)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .query({ accountSiteId: AccountSiteId })
      .query({ userAccountId })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }

        if (response.body.IsSuccess) {
          dispatch(siteAssignmentAdded())
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              `Site assignment added successfully.`,
            ),
          )

          return response.body
        }

        dispatch(errorOccurred(response.body.Msg))
      })
      .catch(() => {
        dispatch(errorOccurred("Error adding site assignments!"))
      })
  }
}

export function postRemoveSiteAssignment(payload) {
  return (dispatch, getState) => {
    dispatch(setIsPosting(true))

    const { token, vasToken } = getState().userAccounts
    const { restrictionId } = payload

    return request("delete", api.SITE_RESTRICTIONS)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .query({ restrictionId })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }

        if (response.body.IsSuccess) {
          dispatch(siteAssignmentRemoved())
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              `Site assignment removed successfully.`,
            ),
          )

          return response.body
        }

        dispatch(errorOccurred(response.body.Msg))
      })
      .catch(() => {
        dispatch(errorOccurred("Error removing site assignment!"))
      })
  }
}

export function postUserIsActive(payload) {
  return (dispatch, getState) => {
    const { token, vasToken } = getState().userAccounts
    const { userAccountId, isActive } = payload

    const url = isActive ? api.TEAM_ACTIVATE : api.TEAM_REMOVE
    //console.log(`Posting Active/Inactive: ${url}`)

    return request("get", url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .query({ userAccountId })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }

        if (response.body.IsSuccess) {
          dispatch(toggleMemberActive(payload))
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              `Account set ${isActive ? "active" : "inactive"} successfully.`,
            ),
          )

          return response.body
        }

        dispatch(errorOccurred(response.body.Msg))
      })
      .catch(() => {
        dispatch(errorOccurred("Error setting account active flag!"))
      })
  }
}

export function postUserRoleType(payload) {
  return (dispatch, getState) => {
    const { token, vasToken } = getState().userAccounts
    const { userAccountId, isAdmin } = payload

    const url = api.TEAM_ROLE_UPDATE
    const roleId = isAdmin
      ? api.ROLE_TYPE.CUSTOMER_ADMIN
      : api.ROLE_TYPE.CUSTOMER_WORKER
    console.log(`Posting Role: ${url}`)

    return request("post", url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .query({ userAccountId })
      .query({ roleId })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }

        if (response.body.IsSuccess) {
          payload.roleId = roleId
          dispatch(setMemberRoleType(payload))
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              "Account role set successfully.",
            ),
          )

          return response.body
        }

        dispatch(errorOccurred(response.body.Msg))
      })
      .catch(() => {
        dispatch(errorOccurred("Error setting account role!"))
      })
  }
}

export function postUserSetupEmail(payload) {
  return (dispatch, getState) => {
    const { token, vasToken } = getState().userAccounts
    const { userAccountId, setupEmail } = payload

    const url = api.TEAM_SET_SETUP_EMAIL
    console.log(`Posting Auth Email: ${url}`)

    return request("post", url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .set(api.AUTH_HEADER_VITRALOGY, vasToken)
      .query({ userAccountId })
      .query({ setupEmail })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }

        if (response.body.IsSuccess) {
          dispatch(setSetupEmail(payload))
          dispatch(
            toastMessage(
              ToastHelper.LEVEL_SUCCESS,
              `Auth email set successfully.`,
            ),
          )

          return response.body
        }

        dispatch(errorOccurred(response.body.Msg))
      })
      .catch(() => {
        dispatch(errorOccurred(`Error setting setup email for account!`))
      })
  }
}
