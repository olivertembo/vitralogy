import React from "react"
import Tooltip from "react-bootstrap/lib/Tooltip"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import { isMobile } from "react-device-detect"

const NonMobileTooltip = ({ ...props }) => {
  const { id, text, placement, children } = props
  if (isMobile || !text) {
    return children
  }

  const ol = (
    <Tooltip id={id} placement="top">
      {text}
    </Tooltip>
  )

  return (
    <OverlayTrigger rootClose overlay={ol} placement={placement}>
      {children}
    </OverlayTrigger>
  )
}

NonMobileTooltip.defaultProps = {
  placement: "top",
  id: "non-mobile-tooltip",
}

export default NonMobileTooltip
