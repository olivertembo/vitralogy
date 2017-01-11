import React from "react"
import Alert from "react-bootstrap/lib/Alert"
import Icon from "react-fa/lib/Icon"

class BaseAsyncComponent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
    }
  }

  renderContent() {
    return <div />
  }

  render() {
    return (
      <div>
        <div className="loadingSpinner">
          {this.state.isLoading && (
            <Alert bsStyle="info">
              <Icon spin name="spinner" /> Loading...
            </Alert>
          )}
        </div>
        <div>{this.renderContent()}</div>
      </div>
    )
  }
}

export default BaseAsyncComponent
