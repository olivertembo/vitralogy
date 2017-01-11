import React from "react"
import PropTypes from "prop-types"
import Tooltip from "antd/lib/tooltip"
import PageHeader from "antd/lib/page-header"
import Typography from "antd/lib/typography"
import Icon from "react-fa/lib/Icon"
import moment from "moment"

import OverlayButton from "../layout/OverlayButton"

const { Paragraph } = Typography

const propTypes = {
  config: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  widget: PropTypes.object,
  showSchedule: PropTypes.bool,
}

const defaultProps = {
  config: {},
  widget: {},
  showSchedule: true,
}

const ExpandedWidget = ({ ...props }) => {
  const { config, onClose, widget, showSchedule } = props

  if (!widget) {
    return <div />
  }

  const schedRange = `${moment(config.startDate).format(
    "MM/DD/YYYY",
  )} - ${moment(config.endDate).format("MM/DD/YYYY")}`

  return (
    <div className="expanded-widget">
      <br /> <br />
      <PageHeader
        onBack={onClose}
        backIcon={
          <Tooltip placement="top" title="Click to close expanded widget view">
            <Icon name="arrow-left" />
          </Tooltip>
        }
        title={`${widget.name}`}
        subTitle={<span>{`@ ${config.activeNode.activeSite.label}`}</span>}
        extra={[
          <span key={1}>
            {showSchedule && (
              <span>
                <Icon name="calendar-check-o" style={{ color: "blue" }} />
                {` ${schedRange} `}
                <OverlayButton
                  key={"closeBtn"}
                  className="btn-inline"
                  bsSize="xsmall"
                  bsStyle="link"
                  glyph="remove"
                  text="Click to close expanded widget view"
                  onClick={onClose}
                />
              </span>
            )}
          </span>,
        ]}
      >
        <span>
          <Paragraph>{widget.description}</Paragraph>

          {widget.panel}
        </span>
      </PageHeader>
    </div>
  )
}

ExpandedWidget.propTypes = propTypes
ExpandedWidget.defaultProps = defaultProps

export default ExpandedWidget
