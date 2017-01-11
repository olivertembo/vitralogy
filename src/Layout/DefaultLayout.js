import React from "react"
import { Route } from "react-router"
import Alert from "react-s-alert"

import TopNavigation from "./TopNavigation"
import Login from "../components/Login"
import Content from "./Content"
import * as api from "../constants/api"
import { withTracker } from "../components/analytics/withTracker"

const DefaultLayout = ({ component, auth: Auth, ...rest }) => {
  const Component = withTracker(component)

  return (
    <Route
      {...rest}
      render={matchProps => (
        <div className="DefaultLayout">
          <Alert stack={{ limit: 3 }} position="bottom-left" />
          <TopNavigation auth={Auth} />
          <Content>
            {Auth.isAuthenticated() ? (
              <Component auth={Auth} {...matchProps} />
            ) : (
              <Login auth={Auth} {...matchProps} />
            )}
          </Content>
          {api.PLATFORM_ENV !== null && api.PLATFORM_ENV !== "prod" && (
            <div className="environment-watermark">
              {api.PLATFORM_ENV.toUpperCase()}
            </div>
          )}
        </div>
      )}
    />
  )
}

export default DefaultLayout
