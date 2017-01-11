import React from "react"
import PropTypes from "prop-types"
import Popover from "react-bootstrap/lib/Popover"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"

const propTypes = {
  name: PropTypes.string,
  shortName: PropTypes.string,
  siteShortName: PropTypes.string,
  description: PropTypes.string,
  siteDescription: PropTypes.string,
  placement: PropTypes.oneOf(["bottom", "right", "left", "top"]),
  children: PropTypes.node,
}

const defaultProps = {
  shortName: null,
  siteShortName: null,
  description: null,
  siteDescription: null,
  placement: "bottom",
  children: null,
  name: null,
}

const JobFriendlyName = props => {
  const {
    name,
    shortName,
    siteShortName,
    description,
    siteDescription,
    placement,
    children,
  } = props

  const friendlyName = siteShortName || shortName
  const title = <strong>{friendlyName}</strong>

  const popover = (
    <Popover id="popover-job-name" title={title}>
      {siteDescription ? <span className="meta">{siteDescription}</span> : null}
      {siteDescription ? <hr /> : null}
      <strong>
        {friendlyName !== shortName ? shortName : null}
        {friendlyName !== shortName ? <br /> : null}({name})
      </strong>
      <br />
      <span className="meta">{description}</span>
    </Popover>
  )

  return (
    <span className="job-friendly-name">
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement={placement}
        overlay={popover}
      >
        {/* for some reason OverlayTrigger needed 1 root child
        so added span */}
        <span>{children ? children : friendlyName || name}</span>
      </OverlayTrigger>
    </span>
  )
}

JobFriendlyName.propTypes = propTypes
JobFriendlyName.defaultProps = defaultProps

export default JobFriendlyName
