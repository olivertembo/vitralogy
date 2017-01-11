import request from "superagent"
import moment from "moment"
import { refreshJobs } from "./jobFilters"
import {
  USER_PREFERENCES_RECEIVED,
  USER_PREFERENCES_IS_LOADING,
  USER_PREFERENCES_IS_POSTING,
  JOB_FILTERS_CHANGED,
} from "../constants/ActionTypes"
import * as api from "../constants/api"

require("../utils/UserPrefsHelper")

function defaultPrefsRequest(filters) {
  return [
    {
      type: "user",
      Key: api.USER_PREF_KEY_DEFAULTS_SET,
      Data: true,
      IsReadOnly: true,
    },
    {
      type: "user",
      Key: api.USER_PREF_KEY_SHOW_JOBS_BY_SITE_ASSIGNMENTS,
      Data: false,
      IsReadOnly: true,
    },
    {
      type: "user",
      Key: api.USER_PREF_KEY_JOB_DASHBOARD_FILTERS,
      Data: JSON.stringify(filters),
      IsReadOnly: true,
    },
  ]
}

function defaultPrefs(filters) {
  return {
    User: [
      {
        Key: api.USER_PREF_KEY_DEFAULTS_SET,
        Data: true,
        IsReadOnly: true,
      },
      {
        Key: api.USER_PREF_KEY_SHOW_JOBS_BY_SITE_ASSIGNMENTS,
        Data: false,
        IsReadOnly: true,
      },
      {
        Key: api.USER_PREF_KEY_JOB_DASHBOARD_FILTERS,
        Data: filters,
        IsReadOnly: true,
      },
    ],
  }
}

function formatPrefs(uid, prefsArray) {
  return {
    Preferences: prefsArray,
    UserAccountId: uid,
  }
}

function formatPref(uid, type, key, data, isreadonly) {
  return {
    Preferences: [
      {
        type,
        key,
        data,
        isreadonly,
      },
    ],
    UserAccountId: uid,
  }
}

function fillInMissingFiltersV16(filters) {
  console.log("Filling in new filter v1.6.0 properties...")
  if (!filters.hasOwnProperty("isEtaOrSchedDate")) {
    filters.isEtaOrSchedDate = true
  }

  if (!filters.hasOwnProperty("dateFilterType")) {
    filters.dateFilterType = "range"
  }

  if (!filters.hasOwnProperty("rangeStart")) {
    filters.rangeStart = "-7"
  }

  if (!filters.hasOwnProperty("rangeEnd")) {
    filters.rangeEnd = "-7"
  }

  if (!filters.hasOwnProperty("byProjectNumber")) {
    filters.byProjectNumber = ""
  }

  if (!filters.hasOwnProperty("byJobNumber")) {
    filters.byJobNumber = ""
  }

  if (!filters.hasOwnProperty("byJobType")) {
    filters.byJobType = ""
  }

  if (!filters.hasOwnProperty("isLive")) {
    filters.isLive = true
  }

  if (!filters.hasOwnProperty("byStatusId")) {
    filters.byStatusId = [0, 1, 2, 3]
  }

  if (!filters.hasOwnProperty("byPriorityId")) {
    filters.byPriorityId = [0, 1, 2]
  }

  if (!filters.hasOwnProperty("isCorrectiveAction")) {
    filters.isCorrectiveAction = null
  }

  if (!filters.hasOwnProperty("byAddress")) {
    filters.byAddress = ""
  }

  if (!filters.hasOwnProperty("byCity")) {
    filters.byCity = ""
  }

  if (!filters.hasOwnProperty("byZip")) {
    filters.byZip = ""
  }

  if (!filters.hasOwnProperty("byVendor")) {
    filters.byVendor = ""
  }

  if (!filters.hasOwnProperty("byProgressId")) {
    filters.byProgressId = [0, 1, 2, 3, 4, 5]
  }

  if (!filters.hasOwnProperty("isVendorLate")) {
    filters.isVendorLate = null
  }

  if (!filters.hasOwnProperty("isJobLate")) {
    filters.isJobLate = null
  }
}

export function setDefaultPreferences(filters) {
  return {
    type: USER_PREFERENCES_RECEIVED,
    payload: defaultPrefs(filters),
  }
}

export function userPreferencesReceived(payload) {
  return {
    type: USER_PREFERENCES_RECEIVED,
    payload,
  }
}

export function userPreferencesIsLoading(bool) {
  return {
    type: USER_PREFERENCES_IS_LOADING,
    payload: bool,
  }
}

export function userPreferencesIsPosting(bool) {
  return {
    type: USER_PREFERENCES_IS_POSTING,
    payload: bool,
  }
}

export function userPreferencesUpdateJobDashboardFilters(filters) {
  const payload = Object.assign({}, filters, {
    startDate: moment(filters.startDate),
    endDate: moment(filters.endDate),
  })

  return {
    type: JOB_FILTERS_CHANGED,
    payload,
  }
}

export function userPreferencePost(prefs, uid) {
  return (dispatch, getState) => {
    const state = getState()

    dispatch(userPreferencesIsPosting(true))

    const { userAccounts } = state
    const userAccountId = uid === undefined ? userAccounts.userAccountId : uid

    const postData = formatPrefs(userAccountId, prefs)

    request
      .post(api.USER_PREFERENCES)
      .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
      .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
      .send(postData)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {
          console.log("failure to get user preferences")
        },
      )
      .then(() => {
        dispatch(userPreferencesIsPosting(false))
      })
  }
}

export function userPreferencePostSingle(type, key, data, isreadonly, uid) {
  return (dispatch, getState) => {
    const state = getState()

    dispatch(userPreferencesIsPosting(true))

    const { userAccounts } = state
    const userAccountId = uid === undefined ? userAccounts.userAccountId : uid

    const postData = formatPref(userAccountId, type, key, data, isreadonly)

    request
      .post(api.USER_PREFERENCES)
      .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
      .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
      .send(postData)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
          } else {
          }
        },
        () => {
          console.log("failure to get user preferences")
        },
      )
      .then(() => {
        dispatch(userPreferencesIsPosting(false))
      })
  }
}

export function userPreferencesRequest(userAccountId) {
  return (dispatch, getState) => {
    const state = getState()

    dispatch(userPreferencesIsLoading(true))

    const { userAccounts } = state

    request
      .get(api.USER_PREFERENCES)
      .set(api.AUTH_HEADER_AUTH0, userAccounts.token)
      .set(api.AUTH_HEADER_VITRALOGY, userAccounts.vasToken)
      .query({ userAccountId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const prefs = response.body.Preference
          if (prefs !== null) {
            if (prefs.User !== null) {
              const defaultsSet = prefs.User.getBoolPrefByKey(
                api.USER_PREF_KEY_DEFAULTS_SET,
                false,
              )
              if (defaultsSet === false) {
                const filters = state.jobFilters.jobFilters
                dispatch(setDefaultPreferences(filters))
                dispatch(
                  userPreferencePost(
                    defaultPrefsRequest(filters),
                    userAccountId,
                  ),
                )
              } else {
                dispatch(userPreferencesReceived(prefs))
                let filters = prefs.User.getJsonPrefByKey(
                  api.USER_PREF_KEY_JOB_DASHBOARD_FILTERS,
                  null,
                )

                // this case happens if user was on mvp-1.0.0, needs new filter keys
                if (filters === null) {
                  filters = state.jobFilters.jobFilters
                  dispatch(
                    userPreferencePost(
                      defaultPrefsRequest(filters),
                      userAccountId,
                    ),
                  )
                }

                const versionInfo = api.APP_VERSION.split("-")
                if (
                  versionInfo[0] === "1.6.0" &&
                  !filters.hasOwnProperty("isJobLate")
                ) {
                  //last property added just check 1
                  console.log(
                    "Current filter 1.6.0: " + JSON.stringify(filters),
                  )
                  fillInMissingFiltersV16(filters)
                  console.log("New filter 1.6.0: " + JSON.stringify(filters))
                  dispatch(
                    userPreferencePost(
                      defaultPrefsRequest(filters),
                      userAccountId,
                    ),
                  )
                }

                // Preference request came from job dashboard
                if (userAccountId === undefined) {
                  dispatch(refreshJobs(filters))
                }
              }
            } else {
              // Set default user prefs
              const filters = state.jobFilters.jobFilters
              dispatch(setDefaultPreferences(filters))
              dispatch(
                userPreferencePost(
                  defaultPrefsRequest(filters, false),
                  userAccountId,
                ),
              )

              // Preference request came from job dashboard
              if (userAccountId === undefined) {
                dispatch(refreshJobs(filters))
              }
            }
          } else {
            // no user prefs up in the db, need to set defaults
            const filters = state.jobFilters.jobFilters
            dispatch(setDefaultPreferences(filters))
            dispatch(
              userPreferencePost(defaultPrefsRequest(filters), userAccountId),
            )

            // Preference request came from job dashboard
            if (userAccountId === undefined) {
              dispatch(refreshJobs(filters))
            }
          }
        },
        () => {
          console.log("failure to get user preferences")
        },
      )
      .then(() => {
        dispatch(userPreferencesIsLoading(false))
      })
  }
}
