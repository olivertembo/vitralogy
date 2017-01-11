import React from "react"
import Icon from "react-fa/lib/Icon"

export default class Callback extends React.Component {
  componentDidMount() {
    // parse hash
    const hash = this.props.location.hash
      .split("&")
      .map(el => el.split("="))
      .reduce((pre, cur) => {
        pre[cur[0]] = cur[1]
        return pre
      }, {})

    this.props.auth.setToken(hash.id_token)
  }

  render() {
    return (
      <div className="data">
        <div className="loading">
          <Icon spin size="5x" name="spinner" />
          &nbsp;Authenticating...
        </div>
      </div>
    )
  }
}
