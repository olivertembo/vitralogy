import React from "react"
import Panel from "react-bootstrap/lib/Panel"
import Icon from "react-fa/lib/Icon"

const SiteHeader = ({ name, address, expanded }) => {
  return (
    <Panel.Heading className="site-header">
      <Icon
        name="expand"
        className={expanded ? "fa-caret-down" : "fa-caret-right"}
      />{" "}
      <span>
        {name} - {address}
      </span>
    </Panel.Heading>
  )
}

export default SiteHeader
