import {
  USER_ACCOUNT_LOGIN_HAS_ERRORED,
  USER_ACCOUNT_LOGIN_IS_LOADING,
  USER_ACCOUNT_ROLE_RECEIVED,
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
  USER_ACCOUNT_SELECTED,
} from "../constants/ActionTypes"

import {
  parseVitralogyUserAccountId,
  parseAccountId,
  parseName,
} from "../utils/jwtHelper"

// const token = localStorage.getItem("id_token")
const vasToken = localStorage.getItem("vas_token")
const expiresAt = JSON.parse(localStorage.getItem("expires_at"))
const tokenValid = new Date().getTime() < expiresAt

const initialState = {
  token: null,
  vasToken: null,
  hasError: false,
  isLoading: true,
  isLoggingIn: false,
  userAccounts: [],
  role: {},
  licenseAccepted: false,
  checkingLicenseAgreement: true,
  licenseAgreement: {},
  licenseChecked: false,
  userAccountId: tokenValid ? parseVitralogyUserAccountId(vasToken) : 0,
  selectedUserAccount: {},
  accountId: tokenValid ? parseAccountId(vasToken) : 0,
  displayName: tokenValid ? parseName(vasToken) : "",
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case USER_ACCOUNT_LOGIN_HAS_ERRORED:
    case USER_ACCOUNTS_HAS_ERRORED:
      return {
        ...state,
        hasError: payload,
      }

    case USER_ACCOUNTS_IS_LOADING:
      return {
        ...state,
        isLoading: payload,
      }

    case USER_ACCOUNT_LOGIN_IS_LOADING:
      return {
        ...state,
        isLoggingIn: payload,
      }

    case USER_ACCOUNTS_RECEIVED:
      return {
        ...state,
        userAccounts: payload,
      }

    case USER_ACCOUNT_ROLE_RECEIVED:
      return {
        ...state,
        role: payload,
      }

    case AUTH_TOKEN_RECEIVED:
      return {
        ...state,
        token: payload,
      }

    case VAS_TOKEN_RECEIVED:
      return {
        ...state,
        vasToken: payload,
        userAccountId: parseVitralogyUserAccountId(payload),
        accountId: parseAccountId(payload),
      }

    case USER_ACCOUNT_ID_RECEIVED:
      return {
        ...state,
        userAccountId: payload,
      }

    case LICENSE_AGREEMENT_CHECK_RECEIVED:
      return {
        ...state,
        licenseAccepted: payload,
      }

    case LICENSE_AGREEMENT_IS_CHECKING:
      return {
        ...state,
        checkingLicenseAgreement: payload,
      }

    case LICENSE_AGREEMENT_RECEIVED:
      return {
        ...state,
        licenseAgreement: payload,
      }

    case LICENSE_AGREEMENT_CHECKED:
      return {
        ...state,
        licenseChecked: payload,
      }

    case USER_ACCOUNT_SELECTED:
      return {
        ...state,
        selectedUserAccount: payload,
      }

    default:
      return state
  }
}
