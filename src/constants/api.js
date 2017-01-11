export const APP_VERSION = process.env.REACT_APP_VERSION
export const PLATFORM_NAME = process.env.REACT_APP_PLATFORM_NAME
export const PLATFORM_ENV = process.env.REACT_APP_PLATFORM_ENV
export const APP_PUSHER_KEY = process.env.REACT_APP_PUSHER_KEY
export const APP_PUSHER_CLUSTER = process.env.REACT_APP_PUSHER_CLUSTER
export const APP_GA_TRACKER = process.env.REACT_APP_GA_TRACKER

//AUTH_URL define in webpack.config.js
export const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID
export const AUTH_SERVICE_API_ROOT =
  process.env.REACT_APP_VIT_AUTH_SERVICE_API_ROOT
export const AUTH_USER_ACCOUNTS = AUTH_SERVICE_API_ROOT + "useraccounts"
export const AUTH_ROLES = AUTH_SERVICE_API_ROOT + "roles"

//VENDOR_URL define in webpack.config.js
export const VENDOR_API_ROOT = process.env.REACT_APP_VIT_VENDOR_API_ROOT
export const VENDOR_ROOT = `${VENDOR_API_ROOT}vendor/`
export const DOCUMENT_TYPES = VENDOR_ROOT + "documenttypes"
export const DATA_COLLECTION_FORMS_ENDPOINT = "datacollectionforms/"
export const DATA_COLLECTION_FORMS_GROUP_ENDPOINT = `${VENDOR_ROOT}${DATA_COLLECTION_FORMS_ENDPOINT}formgroups/`

//COMMON_URL define in webpack.config.js
export const COMMON_API_ROOT = process.env.REACT_APP_VIT_COMMON_API_ROOT
export const COMMON_US_STATES = COMMON_API_ROOT + "usstate"
export const COMMON_VENDOR_TRADE = COMMON_API_ROOT + "trade"
export const COMMON_DOCUMENT_CLASS = COMMON_API_ROOT + "documentclasstypes"
export const COMMENT_TYPES = COMMON_API_ROOT + "commenttypes"
export const COMMON_DATA_COLLECTION_FORMS_ENDPOINT = "datacollectionforms/"
export const COMMON_FORMS_TEMPLATES = `${COMMON_API_ROOT}${COMMON_DATA_COLLECTION_FORMS_ENDPOINT}formgroups/`
export const COMMON_DOCUMENT_MAPPINGS = `${COMMON_API_ROOT}getdocumentmappings`
export const COMMON_ACTIVITY_STEP_DOCUMENT_TYPES = `${COMMON_API_ROOT}getactivitystepdoctypes`
export const GEOCODE_ADDRESS = `${COMMON_API_ROOT}geocode`
export const COMMON_PEOPLE_PREFIXES = `${COMMON_API_ROOT}people/prefixes`
export const COMMON_PEOPLE_SUFFIXES = `${COMMON_API_ROOT}people/suffixes`

//CUSTOMER_URL define in webpack.config.js
export const CUSTOMER_API_ROOT = process.env.REACT_APP_VIT_CUSTOMER_API_ROOT
export const CUSTOMER_ADD_DOCUMENT = jobId =>
  `${CUSTOMER_API_ROOT}job/${jobId}/document`
export const CUSTOMER_API_WEB_ROOT = CUSTOMER_API_ROOT + "web/"
export const JOB_ROOT = `${CUSTOMER_API_WEB_ROOT}job/`
export const JOBS_ROOT = `${CUSTOMER_API_ROOT}jobs/`
export const CUSTOMER_JOBS = `${JOB_ROOT}all`
export const CUSTOMER_SET_JOB_ETA_DATE = `${JOB_ROOT}set-eta`
export const JOB_RESOURCE_GROUP = `${CUSTOMER_API_ROOT}job/resource-containers`
export const TEAM_ROOT = `${CUSTOMER_API_WEB_ROOT}team/`
export const CUSTOMER_TEAM = `${TEAM_ROOT}members`
export const TEAM_ROLE_VALUES = `${TEAM_ROOT}roles`
export const TEAM_NEW = `${TEAM_ROOT}new`
export const TEAM_POST_PEOPLE = `${TEAM_ROOT}people`
export const TEAM_PEOPLE_UPDATE = `${TEAM_ROOT}username`
export const TEAM_ROLE_UPDATE = `${TEAM_ROOT}role`
export const TEAM_REMOVE = `${TEAM_ROOT}remove`
export const TEAM_ACTIVATE = `${TEAM_ROOT}activate`
export const TEAM_SET_SETUP_EMAIL = `${TEAM_ROOT}auth-email`
export const USER_PROFILE = `${TEAM_ROOT}profile`
export const TEAM_INFO = `${TEAM_ROOT}info`
export const SITE_ROOT = `${CUSTOMER_API_WEB_ROOT}site/`
export const CUSTOMER_SITES = `${SITE_ROOT}all`
export const SITE_DETAILS = `${SITE_ROOT}details`
export const CONTACT_ROOT = CUSTOMER_API_WEB_ROOT + "contact/"
export const EMAIL_CONTACT_ROOT = CONTACT_ROOT + "email/"
export const EMAIL_TYPES = EMAIL_CONTACT_ROOT + "types"
export const EMAIL_NEW = EMAIL_CONTACT_ROOT + "new"
export const EMAIL_EDIT = EMAIL_CONTACT_ROOT + "edit"
export const EMAIL_REMOVE = EMAIL_CONTACT_ROOT + "delete"
export const PHONE_CONTACT_ROOT = CONTACT_ROOT + "phone/"
export const PHONE_NUMBER_TYPES = PHONE_CONTACT_ROOT + "types"
export const PHONE_NEW = PHONE_CONTACT_ROOT + "new"
export const PHONE_EDIT = PHONE_CONTACT_ROOT + "edit"
export const PHONE_REMOVE = PHONE_CONTACT_ROOT + "delete"
export const CONTACT_ROLES = CONTACT_ROOT + "roles"
export const ACCOUNT_CONTACT_ROOT = CONTACT_ROOT + "account/"
export const ACCOUNT_ROLE_NEW = ACCOUNT_CONTACT_ROOT + "new"
export const ACCOUNT_ROLE_EDIT = ACCOUNT_CONTACT_ROOT + "edit"
export const ACCOUNT_ROLE_REMOVE = ACCOUNT_CONTACT_ROOT + "delete"
export const SITE_CONTACT_ROOT = CONTACT_ROOT + "site/"
export const SITE_ROLE_NEW = SITE_CONTACT_ROOT + "new"
export const SITE_ROLE_EDIT = SITE_CONTACT_ROOT + "edit"
export const SITE_ROLE_REMOVE = SITE_CONTACT_ROOT + "delete"
export const COMMENTS_ENDPOINT = CUSTOMER_API_ROOT + "comment/"
export const COMMENT_NEW = COMMENTS_ENDPOINT + "add"
export const TIMELOG_ENDPOINT = CUSTOMER_API_ROOT + "timelog/"
export const FORMS_ENDPOINT = CUSTOMER_API_ROOT + "form/"
export const PHOTOS_ENDPOINT = CUSTOMER_API_ROOT + "photo/"
export const PHOTO_NEW = PHOTOS_ENDPOINT + "add"
export const DOCUMENTS_ENDPOINT = CUSTOMER_API_ROOT + "document/"
export const DOCUMENT_NEW = DOCUMENTS_ENDPOINT + "add"
export const JOB_CHECKLIST_ENDPOINT = "getchecklist"
export const CONCLUSION_ENDPOINT = CUSTOMER_API_ROOT + "conclusion/"
export const GET_CONCLUSION_TYPES = groupId =>
  `${CONCLUSION_ENDPOINT}ConclusionStatus/Groups/${groupId}`
export const FINALIZE_ENDPOINT = CUSTOMER_API_ROOT + "finalize/"
export const RESULT_ON_BEHALF_FINALIZE = jobId =>
  `${CUSTOMER_API_ROOT}pending-data/jobs/${jobId}/result-on-behalf-finalize`
export const SIGN_OFF_ON_BEHALF = jobId =>
  `${CUSTOMER_API_ROOT}pending-data/jobs/${jobId}/pending-data-finalize`
export const IS_FINALIAZBLE = jobId =>
  `${CUSTOMER_API_ROOT}finalize/jobs/${jobId}/isfinalizable`
export const JOB_CORRECTIVE_ACTION_ENDPOINT = "/corrective"
export const CUSTOMER_ENDPOINT = `${CUSTOMER_API_ROOT}customer/`
export const LICENSE = `${CUSTOMER_ENDPOINT}license`
export const CUSTOMER_DETAILS = `${CUSTOMER_ENDPOINT}details`
export const LICENSE_CHECK_ENDPOINT = "check-agree-latest"
export const LICENSE_AGREE_ENDPOINT = "agree"
export const USER_PREFERENCES = `${CUSTOMER_API_ROOT}user/preference`
export const JOB_FORM_TEMPLATES = "/forms/"
export const JOB_FORM_RESULT_ENDPOINT = "/formresults"
export const ACCOUNT_DOCUMENT_ROOT = `${CUSTOMER_API_ROOT}account`
export const ACCOUNT_DOCUMENTS = `${ACCOUNT_DOCUMENT_ROOT}/documents`
export const SITE_RESTRICTIONS3 = `${CUSTOMER_API_ROOT}site-restrictions3`
export const SITE_RESTRICTIONS = `${CUSTOMER_API_ROOT}site-restrictions`
export const USER_SITE_RESTRICTIONS = `${CUSTOMER_API_ROOT}site-restrictions/user`
export const JOB_REPORTS_ENDPOINT = `/reports`
export const DASHBOARD_WIDGETS_ROOT = `${CUSTOMER_API_ROOT}api/dashboard/widget/`
export const CUSTOMER_DASHBOARD_TREE = `${DASHBOARD_WIDGETS_ROOT}accounts/sites-summary`

export const OPEN_JOBS_DASHBOARD_WIDGET = `${DASHBOARD_WIDGETS_ROOT}openJobs`
export const SERVICE_PROJECTS_DASHBOARD_WIDGET = `${DASHBOARD_WIDGETS_ROOT}serviceProjects`
export const CORRECTIVE_ACTION_JOBS_DASHBOARD_WIDGET = `${DASHBOARD_WIDGETS_ROOT}correctiveActionJobs`
export const JOB_SUMMARY_DASHBOARD_WIDGET = `${DASHBOARD_WIDGETS_ROOT}jobsSummary`
export const VENDOR_PERFORMANCE_DASHBOARD_WIDGET = `${DASHBOARD_WIDGETS_ROOT}vendorPerformance`
export const CRITICAL_DATES_SITES_DASHBOARD_WIDGET = accountSiteId =>
  `${DASHBOARD_WIDGETS_ROOT}sites/${accountSiteId}/critical-dates`
export const CRITICAL_DATES_ASSETS_DASHBOARD_WIDGET = (
  accountSiteId,
  assetId,
) =>
  `${DASHBOARD_WIDGETS_ROOT}sites/${accountSiteId}/asset/${assetId}/critical-dates`
export const ASSET_DETAILS_DASHBOARD_WIDGET = assetId =>
  `${DASHBOARD_WIDGETS_ROOT}asset/${assetId}/details`
export const CRITICAL_DATES_DASHBOARD = (accountSiteId, month, year) =>
  `${DASHBOARD_WIDGETS_ROOT}critical-dates/${accountSiteId}/${year}/${month}`
export const CRITICAL_DATES_DOB_YEAR_TOTAL_DASHBOARD = (accountSiteId, year) =>
  `${DASHBOARD_WIDGETS_ROOT}critical-dates-dob-total-by-year/${accountSiteId}/${year}`
export const CRITICAL_DATES_DOB_YEAR_DASHBOARD_WIDGET = accountSiteId =>
  `${DASHBOARD_WIDGETS_ROOT}critical-dates-current-year/${accountSiteId}`
export const CRITICAL_DATES_DOB_MONTH_DASHBOARD_WIDGET = accountSiteId =>
  `${DASHBOARD_WIDGETS_ROOT}critical-dates-dob-month/${accountSiteId}`
export const CRITICAL_DATES_DOB_LATE_DASHBOARD_WIDGET = accountSiteId =>
  `${DASHBOARD_WIDGETS_ROOT}critical-dates-dob-late/${accountSiteId}`


export const VIRTUAL_BINDER_ROOT = `${CUSTOMER_API_ROOT}customer/vbinders/`
export const VIRTUAL_BINDER_YEARS = `${VIRTUAL_BINDER_ROOT}years`
export const VIRTUAL_BINDER_CONTENT = `${VIRTUAL_BINDER_ROOT}content`
export const VIRTUAL_BINDER_SITE_RESOURCES = `${VIRTUAL_BINDER_ROOT}resources`
export const VIRTUAL_BINDER_TEMPLATE = `${VIRTUAL_BINDER_ROOT}templates`
export const VIRTUAL_BINDER_TEMPLATE_ENDPOINT = `${VIRTUAL_BINDER_ROOT}binderTemplate/`
export const VIRTUAL_BINDER_CLASSIFICATIONS = `classifications`

export const REPORTING_BASE = `${CUSTOMER_API_ROOT}reporting`
export const GET_REPORTS = `${REPORTING_BASE}/models`
export const GET_REPORT_PARAMS = reportModelId =>
  `${REPORTING_BASE}/filterParameters/${reportModelId}`
export const POST_REPORT_PARAM_METADATA = `${REPORTING_BASE}/filterParameterMetadata`
export const POST_GENERATE_REPORT = `${REPORTING_BASE}/generate`

export const SERVICE_AUDIT_ROOT = `${CUSTOMER_API_ROOT}service-audit`
export const GET_SNOW_INVOICES = `${SERVICE_AUDIT_ROOT}/snow/invoices`
export const GET_SITES_FOR_INVOICE = invoiceId =>
  `${GET_SNOW_INVOICES}/${invoiceId}/sites`
export const POST_CLOSE_INVOICE = invoiceId =>
  `${GET_SNOW_INVOICES}/${invoiceId}/status`
export const GET_DATES_FOR_SITE = (invoiceId, siteId) =>
  `${GET_SNOW_INVOICES}/${invoiceId}/sites/${siteId}/date`
export const GET_LINE_ITEMS_FOR_DATE = (invoiceId, siteId) =>
  `${GET_SNOW_INVOICES}/${invoiceId}/sites/${siteId}/date/line-items`
const BASE_SNOW_INVOICE_LINE_ITEM_URI = (invoiceId, lineItemId, endpoint) =>
  `${GET_SNOW_INVOICES}/${invoiceId}/line-items/${lineItemId}/${endpoint}`
export const GET_PROOF_REQS_FOR_LINE_ITEM = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "proofs")
export const SNOW_CERT_DOC_FOR_LINE_ITEM = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "certified-documents")
export const SNOW_GPS_LOC_FOR_LINE_ITEM = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "locations")
export const SNOW_SUPPORT_DOC_FOR_LINE_ITEM = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "support-documents")
export const SNOW_PHOTO_FOR_LINE_ITEM = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "photos")
export const SNOW_SIGNATURE_FOR_LINE_ITEM = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "signatures")
export const SNOW_COMMENTS_FOR_LINE_ITEM = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "comments")
export const SNOW_CERT_DOC_ITEM = (invoiceId, lineItemId, proofItemId) =>
  `${SNOW_CERT_DOC_FOR_LINE_ITEM(invoiceId, lineItemId)}/${proofItemId}`
export const SNOW_PROOF_STATUS = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "customer-status")
export const SNOW_TIMESTAMP_FOR_LINE_ITEM = (invoiceId, lineItemId) =>
  BASE_SNOW_INVOICE_LINE_ITEM_URI(invoiceId, lineItemId, "timestamps")
export const SNOW_GPS_ITEM = (invoiceId, lineItemId, proofItemId) =>
  `${SNOW_GPS_LOC_FOR_LINE_ITEM(invoiceId, lineItemId)}/${proofItemId}`
export const SNOW_SIGNATURE_ITEM = (invoiceId, lineItemId, proofItemId) =>
  `${SNOW_SIGNATURE_FOR_LINE_ITEM(invoiceId, lineItemId)}/${proofItemId}`
export const SNOW_SUPPORT_DOC_ITEM = (invoiceId, lineItemId, proofItemId) =>
  `${SNOW_SUPPORT_DOC_FOR_LINE_ITEM(invoiceId, lineItemId)}/${proofItemId}`
export const SNOW_PHOTO_ITEM = (invoiceId, lineItemId, proofItemId) =>
  `${SNOW_PHOTO_FOR_LINE_ITEM(invoiceId, lineItemId)}/${proofItemId}`
export const SNOW_TIMESTAMP_ITEM = (invoiceId, lineItemId, proofItemId) =>
  `${SNOW_TIMESTAMP_FOR_LINE_ITEM(invoiceId, lineItemId)}/${proofItemId}`
export const SNOW_INVOICE_STATUS_SUMMARY = invoiceId =>
  `${GET_SNOW_INVOICES}/${invoiceId}/line-items/status-summary`

export const JOB_SCOPE_ONLY = 1
export const JOB_SCOPE_VENDOR_JOB_TIER = 2
export const JOB_SCOPE_JOB_VENDOR = 3
export const JOB_SCOPE_ALL_TIERS = 4

export const COMMENT_TYPE_SYSTEM = 1
export const COMMENT_TYPE_VENDOR = 2
export const COMMENT_TYPE_CUSTOMER = 3
export const COMMENT_TYPE_ACCT_MGMT = 4

export const DOCUMENT_TYPE_SYSTEM = 1
export const DOCUMENT_TYPE_VENDOR = 2
export const DOCUMENT_TYPE_CUSTOMER = 3
export const DOCUMENT_TYPE_ACCT_MGMT = 4

export const PLATFORM_TYPE_SOURCING = 1
export const PLATFORM_TYPE_VENDOR = 2
export const PLATFORM_TYPE_CUSTOMER = 3
export const PLATFORM_TYPE_ACCT_MGMT = 4
export const PLATFORM_TYPE_CONCTACT_MGMT = 5

export const DOC_CLASS_VENDOR_PHOTO = 8 //TODO
export const DOC_CLASS_JOB_TIER_DOCUMENT = 1

export const PLATFORM_TAG_CUSTOMER = "Customer"

export const AUTH_HEADER_AUTH0 = "Authorization"
export const AUTH_HEADER_VITRALOGY = "X-Vitralogy-Authorize"

export const USER_PREF_TYPE_USER = "user"
export const USER_PREF_TYPE_WEB = "web"
export const USER_PREF_TYPE_MOBILE = "mobile"
export const USER_PREF_KEY_SHOW_JOBS_BY_SITE_ASSIGNMENTS =
  "SHOW_JOBS_BY_SITE_ASSIGNMENTS"
export const USER_PREF_KEY_JOB_DASHBOARD_FILTERS = "JOB_DASHBOARD_FILTERS"
export const USER_PREF_KEY_DEFAULTS_SET = "DEFAULTS_SET"

export const CheckListTypeEnum = {
  PREREQUISITE_ONLY: "PrerequisiteOnly",
  JOB_CHECKLIST_ONLY: "JobCheckListOnly",
  ALL: "All",
}

export const SourcingTierProgressEnum = {
  PENDING: 1,
  CHECKED_IN: 2,
  CHECKED_OUT: 3,
  SIGNED_OFF: 4,
}

export const STATUS_ITEM = {
  NEW: 1,
  IN_PROGRESS: 2,
  ON_HOLD: 3,
  COMPLETED: 4,
  CANCELED: 5,
}

export const JOB_PRIORITY_ITEM = {
  Normal: 1,
  Emergency: 2,
}

export const JOB_FILTERS = {
  ACTIVE: 1,
  UPCOMING: 2,
  COMPLETED: 3,
  CANCELED: 4,
  PENDING_DATA_ENTRY: 5,
}

export const FROALA_KEY = "5E5F4A5G4aG3C2C6A2C4D3D2D4D2I2tFOFSAGLUi1AVKd1SN=="

export const JOB_STATUS_TYPES = {
  0: "Any",
  1: "New",
  2: "In Progress",
  3: "On Hold",
}

export const JOB_PRIORITY_TYPES = {
  0: "Any",
  1: "Normal",
  2: "Emergency",
}

export const VENDOR_PROGRESS_TYPES = {
  0: "Any",
  1: "Pending",
  2: "Checked In",
  3: "Checked Out",
  4: "Signed Off",
  5: "In Progress",
}

export const SUPPORT_TYPES = {
  0: "Any",
  1: "General",
  2: "Quality Assurance",
  3: "Prospecting",
  4: "Contracted Bidding",
  5: "Report Generation",
  6: "Aggregated Report",
}

export const AccountScopeEnum = {
  ACCOUNT: 1,
  SITE: 2,
}

export const ROLE_TYPE = {
  CUSTOMER_ADMIN: 5,
  CUSTOMER_WORKER: 6,
}

export const JOB_REPORT_TYPE = {
  JOB_DETAILS: 1,
  JOB_HISTORY: 2,
  JOB_FORM_DETAILS: 3,
  JOB_FORM_HISTORY: 4,
  AGGREGATED_SUMMARY: 5,
  JOB_DETAILS_ON_BEHALF: 6,
  JOB_HISTORY_ON_BEHALF: 7,
}

export const FMS_PROOF_TYPES = {
  CERT_SNOW_TOTALS: 2,
  GPS_LOC: 3,
  BEFORE_PIC: 4,
  AFTER_PIC: 5,
  SITE_MGR_SIG: 6,
  OTHER_DOC: 8,
  TIMESTAMP: 7,
}

export const FMS_AUDIT_STATUS = {
  VALID: 7,
  INVALID: 8,
}

export const FMS_PROOF_STATUS = {
  NO_PROOF_PROVIDED: 10,
  PROOF_PROVIDED: 12,
  PROOF_PROVIDED_DONE: 13,
  APPROVED: 18,
  NOT_APPROVED: 19,
  ADDITIONAL_PROOF_NEEDED: 20,
}

export const FMS_WEATHER_PROVIDERS = [
  {
    ItemId: 1,
    Value: "NOAA",
    ListOrder: 1,
  },
  {
    ItemId: 2,
    Value: "True Weather",
    ListOrder: 2,
  },
  {
    ItemId: 3,
    Value: "Weather Command",
    ListOrder: 3,
  },
  {
    ItemId: 4,
    Value: "Weather Works",
    ListOrder: 4,
  },
]

export const FMS_INVOICE_STATUS = {
  PENDING_PROOF: 3,
  INTERNAL_REVIEW: 4,
  PENDING_CUSTOMER_REVIEW: 5,
  CUSTOMER_CONFIRMED: 6,
}

export const ASSET_RESULT_FILTER = {
  ALL: 0,
  PENDING: 1,
  PASSED: 2,
  FAILED: 3,
}

export const RESOURCE_SUPPORT_MODE = {
  NO_RESOURCE: 1,
  SINGLE_RESOURCE: 2,
  MULTI_RESOURCE: 3,
  CONTAINER: 4,
}

export const DASHBOARD_TYPES = {
  LEGIONELLA_COMPLIANCE: "1",
  MAINTENANCE_ROUNDS: "2",
  ASSET_DETAILS: "3",
  DOB_CALENDAR: "4",
  DOB_JOBS: "5",
  CRITICAL_DATES: "6",
  SMART_ROUNDS: '7'
}

export const DASHBOARD_TREE_NODE = {
  SITE: 1,
  ASSET_TYPE: 2,
  ASSET: 3,
  PORTFOLIO: 4
}

export const DOB_WIDGET_TYPE = {
  YEAR: 1,
  MONTH: 2,
  LATE: 3,
}
