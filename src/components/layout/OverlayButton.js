import React, { Component } from "react"
import Button from "react-bootstrap/lib/Button"
import Glyphicon from "react-bootstrap/lib/Glyphicon"
import Tooltip from "antd/lib/tooltip"
import { isMobile } from "react-device-detect"

class OverlayButton extends Component {
  render() {
    var xs = this.props.disabled ? { pointerEvents: "none" } : {}

    const iconButton = (
      <Button
        bsClass={this.props.bsClass}
        bsSize={this.props.bsSize}
        bsStyle={this.props.bsStyle}
        style={xs}
        disabled={this.props.disabled}
        onClick={this.props.onClick}
      >
        {this.props.glyph && <Glyphicon glyph={this.props.glyph} />}
        {this.props.children}
      </Button>
    )

    // don't show tooltips on mobile, requires extra click
    // of the button
    if (isMobile) {
      return iconButton
    }

    return (
      <Tooltip
        mouseEnterDelay={0.5}
        placement={this.props.placement}
        title={this.props.text}
      >
        <div style={{ display: "inline-block", cursor: "not-allowed" }}>
          {iconButton}
        </div>
      </Tooltip>
    )
  }
}

OverlayButton.defaultProps = {
  placement: "top",
}

export default OverlayButton
