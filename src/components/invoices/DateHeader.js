import React from "react"
import Panel from "react-bootstrap/lib/Panel"
import { format } from "../../utils/datetime"
import Icon from "react-fa/lib/Icon"

const DateHeader = ({ date, expanded }) => {
  return (
    <Panel.Body className="date-header-panel">
      <Icon
        name="expand"
        style={{ color: "#777777" }}
        className={expanded ? "fa-caret-down" : "fa-caret-right"}
      />{" "}
      <span className="date-header">{format(date, "MMMM DD, YYYY")}</span>
    </Panel.Body>
  )
}

export default DateHeader
