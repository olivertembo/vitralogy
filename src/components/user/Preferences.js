import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { userPreferencesRequest } from "../../actions/prefs"

const propTypes = {
  userPrefs: PropTypes.array.isRequired,
  userPreferencesRequest: PropTypes.func.isRequired,
}

const defaultProps = {}

const getState = state => {
  return {
    ...state.prefs,
  }
}

const getActions = dispatch => {
  return {
    userPreferencesRequest: () => dispatch(userPreferencesRequest()),
  }
}

class Preferences extends React.Component {
  componentDidMount() {
    this.props.userPreferencesRequest()
  }

  render() {
    const userPrefs = this.props.userPrefs.map(item => {
      return (
        <li key={item.Key}>
          {item.Key}: {JSON.stringify(item.Data)} (readonly:{" "}
          {item.IsReadOnly ? "true" : "false"})
        </li>
      )
    })

    return (
      <div className="preferences">
        <h1>User Preferences</h1>
        <ul>{userPrefs}</ul>
      </div>
    )
  }
}

Preferences.propTypes = propTypes
Preferences.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(Preferences)
