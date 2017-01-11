import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Alert from "react-bootstrap/lib/Alert"
import Button from "react-bootstrap/lib/Button"
import { Icon } from "react-fa"
import PhoneAdd from "./PhoneAdd"
import EmptyStateContainer from "../../containers/EmptyStateContainer"

const propTypes = {
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  pendingChanges: PropTypes.object.isRequired,
  onPendingChange: PropTypes.func.isRequired,
}

const getState = state => {
  return {
    ...state.lookups,
  }
}

class PhoneContacts extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      phoneNumbers: [],
      isLoading: false,
      alert: null,
      showAddEmail: false,
      row: null,
      isAdding: false,
    }

    this.handlePhoneSubmit = this.handlePhoneSubmit.bind(this)
    this.onAddClick = this.onAddClick.bind(this)
    this.onRemoveClick = this.onRemoveClick.bind(this)
    this.onAddCancelClick = this.onAddCancelClick.bind(this)
  }

  componentDidMount() {
    this.updateFromProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.profile !== undefined &&
      nextProps.profile.PhoneNumbers !== undefined
    ) {
      this.updateFromProps(nextProps)
    }
  }

  onAddClick() {
    this.setState({ isAdding: true })
  }

  onAddCancelClick() {
    this.setState({ isAdding: false })
  }

  onRemoveClick(index) {
    const phone = this.state.phoneNumbers[index]
    this.props.onPendingChange(phone, index)
  }

  handlePhoneSubmit(data) {
    const phoneType = this.props.phoneTypes.filter(
      i => i.ItemId === parseInt(data.phoneTypeId, 10),
    )
    const phone = {
      Type: data.phoneTypeId,
      FullNumber: data.phone,
      TypeName: phoneType[0].Value,
    }

    this.props.onPendingChange(phone)
    this.setState({ isAdding: false })
  }

  updateFromProps(props) {
    let isAdding = this.state.isAdding
    if (props.isEditing === false) {
      isAdding = false
    }

    this.setState({
      phoneNumbers: props.profile.PhoneNumbers,
      isAdding,
    })
  }

  render() {
    const props = {
      auth: this.props.auth,
      onPhoneSubmit: this.handlePhoneSubmit,
    }

    const phoneRows = this.state.phoneNumbers.map((item, index) => {
      return (
        <div className="profile-list__row" key={`phone-${item.PhoneNumberId}`}>
          <div className="profile-list__icon">{<Icon name="phone" />}</div>
          <div className="profile-list__content">
            {item.FullNumber}
            <span className="meta">{item.TypeName}</span>
          </div>
          <div className="profile-list__actions">
            {this.props.isEditing && (
              <Button
                bsStyle="danger"
                bsSize="xsmall"
                onClick={() => this.onRemoveClick(index)}
              >
                <Icon name="trash" />
              </Button>
            )}
          </div>
          {/* Show add button on last email entry */
          this.props.isEditing && index === this.state.phoneNumbers.length - 1 && (
            <Button bsStyle="primary" bsSize="xsmall" onClick={this.onAddClick}>
              <Icon name="plus" />
            </Button>
          )}
        </div>
      )
    })

    const pendingPhones = this.props.pendingChanges.phones.map(
      (item, index) => {
        const action = item.PhoneNumberId !== undefined ? "remove" : "add"
        const pendingItem = item
        pendingItem.action = action
        pendingItem.key = `pending-phone-${index}`
        return pendingItem
      },
    )

    return (
      <div className="phone-contacts">
        {this.state.isLoading && (
          <Alert bsStyle="info">
            <Icon spin name="spinner" /> Loading phone numbers...
          </Alert>
        )}

        <div className="profile-list">
          {this.state.phoneNumbers.length > 0 && phoneRows}
          {this.state.phoneNumbers.length === 0 &&
            this.props.isEditing === false && (
              <EmptyStateContainer
                alertStyle="info"
                title="No phone numbers assigned!"
              />
            )}
          {this.props.isEditing &&
            (this.state.isAdding || this.state.phoneNumbers.length === 0) && (
              <PhoneAdd
                {...props}
                onCancelClick={this.onAddCancelClick}
                showCancelButton={this.state.phoneNumbers.length > 0}
              />
            )}
        </div>

        {this.props.isEditing &&
          pendingPhones.length > 0 &&
          pendingPhones.map(item => {
            return (
              <div key={item.key}>
                <div
                  className={`profile-list__row ${
                    item.action === "add" ? "text-success" : "text-danger"
                  }`}
                >
                  <div className="profile-list__icon">
                    {item.action === "add" ? (
                      <Icon name="plus" />
                    ) : (
                      <Icon name="minus" />
                    )}
                  </div>
                  <div className="profile-list__content">
                    {item.FullNumber}
                    <span className="meta">{item.TypeName}</span>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    )
  }
}

PhoneContacts.propTypes = propTypes

export default connect(getState)(PhoneContacts)
