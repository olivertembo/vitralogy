import React from "react"
import PropTypes from "prop-types"
import { Icon } from "react-fa"
import Alert from "react-bootstrap/lib/Alert"

const propTypes = {
  alertStyle: PropTypes.oneOf([
    "warning",
    "danger",
    "info",
    "success",
    "primary",
  ]),
  iconName: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  title: PropTypes.string.isRequired,
}

const defaultProps = {
  alertStyle: "warning",
  iconName: "",
  message: "",
}

export default function EmptyStateContainer({
  alertStyle,
  iconName,
  title,
  message,
}) {
  let formattedTitle = <h4>{title}</h4>
  if (iconName.length > 0) {
    formattedTitle = (
      <h4>
        <Icon name={iconName} /> {title}
      </h4>
    )
  }

  return (
    <Alert bsStyle={alertStyle}>
      {formattedTitle}
      {message}
    </Alert>
  )
}

EmptyStateContainer.propTypes = propTypes
EmptyStateContainer.defaultProps = defaultProps
