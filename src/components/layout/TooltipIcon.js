import React from "react"
import PropTypes from "prop-types"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"
import Icon from "react-fa/lib/Icon"

const propTypes = {
  text: PropTypes.string,
  name: PropTypes.string.isRequired,
  placement: PropTypes.oneOf(["left", "right", "top", "bottom"]),
  id: PropTypes.string,
  className: PropTypes.string,
}

const defaultProps = {
  text: null,
  placement: "left",
  id: "tooltip-icon",
  className: null,
}

const TooltipIcon = props => {
  const { className, name, text, placement } = props
  if (text === null) {
    return <Icon className={className} name={name} />
  }

  const tooltip = <Tooltip id="tooltip-icon">{text}</Tooltip>

  return (
    <OverlayTrigger placement={placement} overlay={tooltip}>
      <Icon className={className} name={name} />
    </OverlayTrigger>
  )
}

TooltipIcon.propTypes = propTypes
TooltipIcon.defaultProps = defaultProps

export default TooltipIcon
