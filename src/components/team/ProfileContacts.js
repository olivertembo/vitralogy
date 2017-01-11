import React from "react"
import PropTypes from "prop-types"
import PhoneContacts from "./PhoneContacts"
import EmailContacts from "./EmailContacts"

const propTypes = {
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  pendingChanges: PropTypes.object.isRequired,
  onPendingChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
}

const defaultProps = {}

export default function ProfileContacts({
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
    <section className="contact">
      <div className="section-header">
        <h4>Contact Information</h4>
      </div>
      <PhoneContacts {...props} />
      <EmailContacts {...props} />
    </section>
  )
}

ProfileContacts.propTypes = propTypes
ProfileContacts.defaultProps = defaultProps
