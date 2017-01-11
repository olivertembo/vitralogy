import React from "react"
import PropTypes from "prop-types"
import AccountRoles from "./AccountRoles"
// import TradeRoles from './TradeRoles'

const propTypes = {
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  pendingChanges: PropTypes.object.isRequired,
  onPendingChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
}

const defaultProps = {}

export default function ProfileRoles({
  auth,
  profile,
  isEditing,
  onPendingChange,
  pendingChanges,
}) {
  const props = {
    auth,
    profile,
    isEditing,
    onPendingChange,
    pendingChanges,
  }

  return (
    <section>
      {/*
      <div className="section-header">
        <h4>Account Roles</h4>
      </div>
      <AccountRoles {...props} />
      
      <div className="section-header section-header--with-add">
        <h4>Trade Roles</h4>
      </div>
      <TradeRoles {...props} />
      */}
    </section>
  )
}

ProfileRoles.propTypes = propTypes
ProfileRoles.defaultProps = defaultProps
