import request from "superagent"
import history from "../history"
import ReactGA from "react-ga"
import {
  USER_ACCOUNT_LOGIN_HAS_ERRORED,
  USER_ACCOUNT_LOGIN_IS_LOADING,
  USER_ACCOUNTS_HAS_ERRORED,
  USER_ACCOUNTS_IS_LOADING,
  USER_ACCOUNTS_RECEIVED,
  AUTH_TOKEN_RECEIVED,
  VAS_TOKEN_RECEIVED,
  LICENSE_AGREEMENT_CHECK_RECEIVED,
  LICENSE_AGREEMENT_IS_CHECKING,
  LICENSE_AGREEMENT_RECEIVED,
  LICENSE_AGREEMENT_CHECKED,
  USER_ACCOUNT_ID_RECEIVED,
  USER_PREFERENCES_RECEIVED,
  USER_ACCOUNT_SELECTED,
} from "../constants/ActionTypes"
import * as api from "../constants/api"

const STARTING_ROUTE = "/home"

export function userAccountsHasErrored(bool) {
  return {
    type: USER_ACCOUNTS_HAS_ERRORED,
    payload: bool,
  }
}

export function userAccountsIsLoading(bool) {
  return {
    type: USER_ACCOUNTS_IS_LOADING,
    payload: bool,
  }
}

export function userAccountsReceived(items) {
  return {
    type: USER_ACCOUNTS_RECEIVED,
    payload: items,
  }
}

export function userAccountLoginHasErrored(bool) {
  return {
    type: USER_ACCOUNT_LOGIN_HAS_ERRORED,
    payload: bool,
  }
}

export function authTokenReceived(token) {
  return {
    type: AUTH_TOKEN_RECEIVED,
    payload: token,
  }
}

export function vasTokenReceived(token) {
  return {
    type: VAS_TOKEN_RECEIVED,
    payload: token,
  }
}

export function licenseAgreementCheckReceived(bool) {
  return {
    type: LICENSE_AGREEMENT_CHECK_RECEIVED,
    payload: bool,
  }
}

export function licenseAgreementReceived(data) {
  return {
    type: LICENSE_AGREEMENT_RECEIVED,
    payload: data,
  }
}

export function checkingLicenseAgreement(bool) {
  return {
    type: LICENSE_AGREEMENT_IS_CHECKING,
    payload: bool,
  }
}

export function licenseAgreementChecked(bool) {
  return {
    type: LICENSE_AGREEMENT_CHECKED,
    payload: bool,
  }
}

export function userAccountIdReceived(id) {
  return {
    type: USER_ACCOUNT_ID_RECEIVED,
    payload: id,
  }
}

export function userPreferencesReceived(payload) {
  return {
    type: USER_PREFERENCES_RECEIVED,
    payload,
  }
}

export function userAccountSelected(payload) {
  return {
    type: USER_ACCOUNT_SELECTED,
    payload,
  }
}

export function userAccountRoleReceived(data, authService, accountName, name) {
  return dispatch => {
    if (data.IsSuccess === true) {
      // No roles found for this user
      if (data.Roles.length === 0) {
        dispatch(userAccountsHasErrored(true))
      } else {
        dispatch(vasTokenReceived(data.Token))
        authService.setVasToken(data.Token)
        authService.setRoles(data.Roles)
        authService.setProfile(accountName, name)

        history.push(STARTING_ROUTE)
      }
    } else {
      dispatch(userAccountLoginHasErrored(true))
    }
  }
}

export function userAccountLoginIsLoading(bool) {
  return {
    type: USER_ACCOUNT_LOGIN_IS_LOADING,
    payload: bool,
  }
}

export function userAccountLoginRequest(url, token, account, authService) {
  return dispatch => {
    dispatch(userAccountLoginIsLoading(true))
    dispatch(authTokenReceived(token))
    if (account.UserPreference !== null) {
      dispatch(userPreferencesReceived(JSON.parse(account.UserPreference)))
    }

    request
      .get(url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .query({ userAccountId: account.UserAccountId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          dispatch(userAccountLoginIsLoading(false))
          dispatch(
            userAccountRoleReceived(
              response.body,
              authService,
              account.AccountName,
              account.Name,
            ),
          )
          dispatch(userAccountSelected(account))
        },
        () => {
          dispatch(userAccountLoginHasErrored(true))
        },
      )
  }
}

export function userAccountsRequest(authService, autoLogin) {
  return (dispatch, getState) => {
    const token = authService.getToken()

    dispatch(userAccountsHasErrored(false))
    dispatch(userAccountsIsLoading(true))
    // dispatch(authTokenReceived(token))

    request
      .get(api.AUTH_USER_ACCOUNTS)
      .set(api.AUTH_HEADER_AUTH0, token)
      .query({ platformTag: api.PLATFORM_TAG_CUSTOMER })
      .query({ isIncludeSetup: false })
      .query({ isAutoLink: true })
      .query({ getTokenIfOneAccount: false })
      .query({ isIncludeUserPreference: true })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const accounts = response.body.UserAccounts
          if (accounts.length === 1 && autoLogin === true) {
            ReactGA.set({ userId: accounts[0].UserAccountId })
            dispatch(
              userAccountLoginRequest(
                api.AUTH_ROLES,
                token,
                accounts[0],
                authService,
              ),
            )
          } else {
            dispatch(userAccountsReceived(response.body.UserAccounts))
          }
        },
        () => {
          dispatch(userAccountsHasErrored(true))
        },
      )
      .then(() => {
        dispatch(userAccountsIsLoading(false))
      })
  }
}

export function licenseAgreementCheckRequest(authService) {
  return (dispatch, getState) => {
    const state = getState()
    const { token } = state.userAccounts

    dispatch(checkingLicenseAgreement(true))

    const url = `${api.LICENSE}/${api.LICENSE_CHECK_ENDPOINT}`

    request
      .get(url)
      .set(api.AUTH_HEADER_AUTH0, token)
      .query({ isReturnLicenseIfNotAgreed: true })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            dispatch(licenseAgreementChecked(true))
            const licenseAgreed = response.body.IsAgreed
            dispatch(licenseAgreementCheckReceived(licenseAgreed))

            if (licenseAgreed === true) {
              dispatch(userAccountsRequest(authService, true))
            } else {
              dispatch(licenseAgreementReceived(response.body.LicenseItem))
            }
          }
        },
        () => {
          // dispatch error
        },
      )

    dispatch(checkingLicenseAgreement(false))
  }
}

export function licenseAgreementAccepted() {
  return dispatch => {
    dispatch(licenseAgreementCheckReceived(true))
  }
}

export function logoutUser() {
  return dispatch => {
    dispatch(userAccountSelected({}))
    dispatch(authTokenReceived(null))
    dispatch(vasTokenReceived(null))
  }
}
