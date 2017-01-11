import React from "react"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import SweetAlert from "react-bootstrap-sweetalert"
import Tooltip from "antd/lib/tooltip"

import EmptyStateContainer from "../../containers/EmptyStateContainer"

export default class ContactList extends React.Component {
  state = {
    alert: null,
  }

  hideAlert = () => {
    this.setState({ alert: null })
  }

  showAlert = item => {
    const getAlert = () => (
      <SweetAlert
        title={`Remove ${item.TypeName} ${
          item.Email === undefined ? "Phone" : "Email"
        } Contact`}
        danger
        showCancel
        confirmBtnText="Yes Remove!"
        confirmBtnBsStyle="danger"
        cancelBtnBsStyle="default"
        onConfirm={() => {
          this.props.onRemoveItem(item)
          this.hideAlert()
        }}
        onCancel={() => this.hideAlert()}
      >
        Remove {item.Email || item.FullNumber} entry?
      </SweetAlert>
    )

    this.setState({ alert: getAlert() })
  }

  render() {
    if (this.props.details === null) {
      return (
        <div className="contact-list">
          <Icon spin size="2x" name="spinner" /> Loading...
        </div>
      )
    }

    const emailNodes = this.props.details.EmailAddresses.map(item => {
      return (
        <div className="profile-list__row" key={`email-${item.EmailAddressId}`}>
          <div className="profile-list__icon">
            <Icon name="envelope" />
          </div>
          <div className="profile-list__content">
            {item.Email}
            <span className="meta">{item.TypeName}</span>
          </div>
          <div className="profile-list__actions">
            <Tooltip
              trigger={["hover"]}
              title={
                this.props.disabled
                  ? "Insufficient permission for this action."
                  : "Remove email contact"
              }
              placement="topLeft"
              arrowPointAtCenter
            >
              <Button
                bsStyle="danger"
                bsSize="xsmall"
                onClick={() => this.showAlert(item)}
                disabled={this.props.disabled}
              >
                <Icon name="trash" />
              </Button>
            </Tooltip>
          </div>
        </div>
      )
    })

    const phoneNodes = this.props.details.PhoneNumbers.map(item => {
      return (
        <div className="profile-list__row" key={`phone-${item.PhoneNumberId}`}>
          <div className="profile-list__icon">
            <Icon name="phone" />
          </div>
          <div className="profile-list__content">
            {item.FullNumber}
            <span className="meta">{item.TypeName}</span>
          </div>
          <div className="profile-list__actions">
            <Tooltip
              trigger={["hover"]}
              title={
                this.props.disabled
                  ? "Insufficient permission for this action."
                  : "Remove phone contact"
              }
              placement="topLeft"
              arrowPointAtCenter
            >
              <Button
                bsStyle="danger"
                bsSize="xsmall"
                onClick={() => this.showAlert(item)}
                disabled={this.props.disabled}
              >
                <Icon name="trash" />
              </Button>
            </Tooltip>
          </div>
        </div>
      )
    })

    const msg = <div>No contact entries defined</div>
    let title = `No Contact Information!`

    return (
      <div className="contact-list">
        {this.state.alert}
        {emailNodes.length === 0 && phoneNodes.length === 0 && (
          <EmptyStateContainer alertStyle="info" title={title} message={msg} />
        )}
        {emailNodes}
        {phoneNodes}
      </div>
    )
  }
}
