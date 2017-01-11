import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Button from "react-bootstrap/lib/Button"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import Select from "react-select"
import Icon from "react-fa/lib/Icon"

const propTypes = {
  profile: PropTypes.object.isRequired,
  onEditClick: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onSelectRole: PropTypes.func.isRequired,
  pendingChanges: PropTypes.object.isRequired,
}

const defaultProps = {}

const getState = state => {
  return {
    ...state.lookups,
  }
}

class MemberProfile extends React.Component {
  render() {
    let role = <div className="ra-position">{this.props.profile.RoleName}</div>
    if (this.props.isEditing === true) {
      const roleOptions = this.props.userAccountRoleTypes.map(type => {
        return {
          value: type.Id,
          label: type.Name,
        }
      })

      const displayValue =
        this.props.pendingChanges.userAccountRole !== null
          ? this.props.pendingChanges.userAccountRole
          : this.props.profile.Role

      let disabled = !this.props.isAdmin
      if (!disabled) {
        disabled = this.props.isSelf
      }

      role = (
        <Select
          name="select-role"
          placeholder="Select role..."
          clearable={false}
          options={roleOptions}
          onChange={this.props.onSelectRole}
          value={displayValue}
          disabled={disabled}
        />
      )
    }

    return (
      <section id="profile">
        <div className="row">
          <div className="col-lg-3 col-sm-2">
            <img
              src={this.props.profile.ProfilePictureUrl}
              className="ra-avatar img-responsive"
              alt=""
            />
          </div>

          <div className="col-lg-6 col-sm-2">
            <h2 className="ra-well-title">
              {this.props.profile.FirstName} {this.props.profile.LastName}
            </h2>
            {role}
          </div>

          <div className="col-lg-3 col-sm-2">
            {/* View only mode, show edit button */
            !this.props.isEditing && !this.props.readOnly && (
              <Button
                onClick={this.props.onEditClick}
                bsSize="small"
                className="pull-right"
                bsStyle="primary"
              >
                Edit
              </Button>
            )}

            {/* Edit mode is enabled, show save button, disable it if already saving */
            this.props.isEditing && (
              <ButtonToolbar>
                <Button
                  bsStyle="primary"
                  bsSize="sm"
                  className="pull-right ml-sm"
                  onClick={this.props.onSaveClick}
                  disabled={
                    this.props.isSaving || this.props.pendingChanges.count === 0
                  }
                >
                  {this.props.isSaving === true ? (
                    <span>
                      <Icon spin name="spinner" /> Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  bsSize="sm"
                  className="pull-right"
                  onClick={this.props.onCancelClick}
                  disabled={this.props.isSaving}
                >
                  Cancel
                </Button>
              </ButtonToolbar>
            )}
          </div>
        </div>
      </section>
    )
  }
}

MemberProfile.propTypes = propTypes
MemberProfile.defaultProps = defaultProps

export default connect(getState)(MemberProfile)
