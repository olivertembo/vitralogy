import React from "react"
import PropTypes from "prop-types"

const ErrorMessages = props => {
  if (!props.messages || props.messages.length === 0) {
    return null;
  }


  const messageNodes = Object.values(props.messages).map((message, key) => (
    // eslint-disable-next-line react/no-array-index-key
    <span key={key} className="help-block validation-message">
      {message}
    </span>
  ))
  return <div>{messageNodes}</div>
}

ErrorMessages.propTypes = {
  messages: PropTypes.object,
}

ErrorMessages.defaultProps = {
  messages: {},
}

export default ErrorMessages
