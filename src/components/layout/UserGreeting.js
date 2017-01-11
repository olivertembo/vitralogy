import React, { Component } from "react"

class UserGreeting extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="user-greeting">
        <span>Welcome,</span>
        <h2>Name</h2>
      </div>
    )
  }
}

export default UserGreeting
