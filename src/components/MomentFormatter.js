import React from "react"
import PropTypes from "prop-types"
import { format } from "../utils/datetime"

const propTypes = {
  datetime: PropTypes.string.isRequired,
  formatter: PropTypes.string,
  timezone: PropTypes.string,
}

const defaultProps = {
  formatter: "MM/DD/YYYY h:mm A",
  timezone: null,
}

const MomentFormatter = props => {
  const { datetime, formatter, timezone } = props

  return (
    <span className="moment-formatter">
      {format(datetime, formatter)}
      {timezone ? ` ${timezone}` : null}
    </span>
  )
}

MomentFormatter.propTypes = propTypes
MomentFormatter.defaultProps = defaultProps

export default MomentFormatter
