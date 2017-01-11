import { combineReducers } from "redux"
import { localeReducer as locale } from "react-localize-redux"

// Import all child reducers
import userAccounts from "./userAccounts"
import lookups from "./lookups"
import prefs from "./prefs"
import jobFilters from "./jobFilters"
import resources from "./resources"
import jobs from "./jobs"
import site from "./site"
import sites from "./sites"
import team from "./team"
import support from "./support"
import criticalDates from "./criticalDates"
import vendors from "./vendors"
import assets from "./assets"

export default combineReducers({
  userAccounts,
  lookups,
  prefs,
  jobFilters,
  resources,
  jobs,
  locale,
  site,
  sites,
  team,
  support,
  criticalDates,
  vendors,
  assets
})
