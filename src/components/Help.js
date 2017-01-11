import React from "react"
import * as api from "../constants/api"
export default class Help extends React.Component {
  render() {
    const versionInfo = api.APP_VERSION.split("-")
    return (
      <div className="help">
        Help Page
        <br />
        Version: {versionInfo[0]}
        <br />
        Build Number: {versionInfo[1]}
      </div>
    )
  }
}
