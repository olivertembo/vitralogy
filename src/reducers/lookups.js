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

const initialState = {
  commentTypes: [],
  documentTypes: [],
  emailTypes: [],
  phoneTypes: [],
  userAccountRoleTypes: [],
  accountRoles: [],
  salutations: [],
  suffixes: [],
  states: []
}

export default function reducer(state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case LOOKUPS_COMMENT_TYPES_RECEIVED:
      return {
        ...state,
        commentTypes: payload,
      }

    case LOOKUPS_DOC_CLASS_JOB_TIER_DOCUMENT:
      return {
        ...state,
        documentTypes: payload,
      }

    case LOOKUPS_CONTACT_EMAIL_TYPES:
      return {
        ...state,
        emailTypes: payload,
      }

    case LOOKUPS_CONTACT_PHONE_TYPES:
      return {
        ...state,
        phoneTypes: payload,
      }

    case LOOKUPS_USER_ACCOUNT_ROLE_TYPES:
      return {
        ...state,
        userAccountRoleTypes: payload,
      }

    case LOOKUPS_ACCOUNT_CONTACT_ROLES:
      return {
        ...state,
        accountRoles: payload,
      }

    case LOOKUPS_PEOPLE_PREFIXES:
      return {
        ...state,
        salutations: payload,
      }

    case LOOKUPS_PEOPLE_SUFFIXES:
      return {
        ...state,
        suffixes: payload,
      }

    case LOOKUPS_STATES:
      return {
        ...state,
        states: payload,
      }

    default:
      return state
  }
}
