import React from "react"
import { Switch, Route } from "react-router"
import { Router } from "react-router-dom"
import { Provider } from "react-redux"
import configureStore from "../store/configureStore"
import history from "../history"
import { withTracker } from "./analytics/withTracker"

import DefaultLayout from "../Layout/DefaultLayout"
import NotFound from "../NotFound"
import Callback from "../Callback/Callback"
import Auth from "../Auth/Auth"
import JobDashboard from "./jobs/JobDashboard"
import SupportDashboard from "./support/SupportDashboard"
import JobDetail from "./jobs/JobDetail"
import TeamDashboard from "./team/TeamDashboard"
import Login from "./Login"
import Logout from "./Logout"
import Preferences from "./user/Preferences"
import UserAccountList from "./UserAccountList"
import CustomerDetail from "./details/CustomerDetail"
import Help from "./Help"
import CustomerDashboard from "./dashboard/CustomerDashboard"
import Binder from "./binder"
import InvoiceList from "./invoices/InvoiceList"
import InvoiceDetail from "./invoices/InvoiceDetail"
import Cover from "./binder/Cover"
import CacheBuster from "../CacheBuster"
import Reporting from "./reporting"

const store = configureStore()
const auth = new Auth(store)

const handleAuthentication = ({ location }) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication()
  }
}

const App = () => (
  <CacheBuster>
    {({ loading, isLatestVersion, refreshCacheAndReload }) => {
      if (loading) return null
      if (!loading && !isLatestVersion) {
        refreshCacheAndReload()
      }

      return (
        <Provider store={store}>
          <Router history={history}>
            <Switch>
              <Route
                exact
                path="/"
                render={props => (
                  <DefaultLayout
                    component={CustomerDashboard}
                    auth={auth}
                    {...props}
                  />  
                )}
              />
              <DefaultLayout
                path="/account"
                switchDashboards={false}
                component={UserAccountList}
                auth={auth}
              />
              <DefaultLayout
                exact
                path="/jobs"
                component={JobDashboard}
                auth={auth}
              />
              <DefaultLayout
                exact
                path="/support"
                component={SupportDashboard}
                auth={auth}
              />
              <DefaultLayout
                path="/(jobs|support)/:jobId"
                component={JobDetail}
                auth={auth}
              />
              <DefaultLayout
                path="/invoices/:id"
                component={InvoiceDetail}
                auth={auth}
              />
              <DefaultLayout
                exact
                path="/invoices"
                component={InvoiceList}
                auth={auth}
              />

              <DefaultLayout
                path="/details"
                component={CustomerDetail}
                auth={auth}
              />
              <DefaultLayout
                path="/home"
                component={CustomerDashboard}
                auth={auth}
              />
              <DefaultLayout path="/logout" component={Logout} auth={auth} />
              <DefaultLayout
                path="/team"
                component={TeamDashboard}
                auth={auth}
              />
              <DefaultLayout path="/login" component={Login} auth={auth} />
              <DefaultLayout path="/help" component={Help} auth={auth} />
              <DefaultLayout
                path="details"
                component={CustomerDetail}
                auth={auth}
              />

              <DefaultLayout
                path="/user/preferences"
                component={Preferences}
                auth={auth}
              />

              <DefaultLayout
                exact
                path="/binder"
                component={Cover}
                auth={auth}
              />
              <DefaultLayout
                exact
                path="/reporting"
                component={Reporting}
                auth={auth}
              />
              <DefaultLayout
                path="/binder/:siteId/:templateId/:resourceId/:yearId"
                component={Binder}
                auth={auth}
              />

              <Route
                path="/callback"
                render={props => {
                  handleAuthentication(props)
                  return <Callback {...props} />
                }}
              />
              <Route component={withTracker(NotFound)} />
            </Switch>
          </Router>
        </Provider>
      )
    }}
  </CacheBuster>
)

export default App
