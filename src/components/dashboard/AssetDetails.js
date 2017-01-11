import React from "react"
import PropTypes from "prop-types"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
import Icon from "react-fa/lib/Icon"
import Tooltip from "antd/lib/tooltip"
import Card from "antd/lib/card"
import Drawer from "antd/lib/drawer"

import AssetInfoWidget from "./widgets/AssetInfoWidget"
import OverlayButton from "../layout/OverlayButton"
import ExpandedWidget from "./ExpandedWidget"
import CriticalDatesWidget from "./widgets/CriticalDatesWidget"

const propTypes = {
  config: PropTypes.object.isRequired,
}

const defaultProps = {
  config: {},
}

export default class AssetDetails extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showFullScreenDrawer: false,
      selectedWidget: null,
    }
  }

  toggleFullScreen = (show, selectedWidget) => {
    this.setState({
      showFullScreenDrawer: show,
      selectedWidget,
    })
  }

  render() {
    const className = "asset-details"
    const { showFullScreenDrawer, selectedWidget } = this.state

    const { config } = this.props

    const locationName = `${
      config.activeNode.activeSite === undefined
        ? ""
        : config.activeNode.activeSite.label
    }`

    const assetInfoText = (
      <span>
        {`Asset information for ${locationName} - `}
        <strong>{`${config.activeNode.label}`}</strong>
      </span>
    )
    const criticalDatesText = (
      <span>
        {`Any critical dates defined for ${locationName} - `}
        <strong>{`${config.activeNode.label}`}</strong>
      </span>
    )

    return (
      <div className={className}>
        <Drawer
          width={"77%"}
          placement="right"
          onClose={() => this.toggleFullScreen(false, null)}
          visible={showFullScreenDrawer}
          destroyOnClose={true}
        >
          <ExpandedWidget
            config={config}
            onClose={() => this.toggleFullScreen(false, null)}
            widget={selectedWidget}
            showSchedule={false}
          />
        </Drawer>

        <Row>
          <Col md={6}>
            <Card
              style={{ minHeight: "350px" }}
              size="small"
              title={
                <Tooltip
                  placement="right"
                  title={assetInfoText}
                  mouseEnterDelay={0.5}
                >
                  <span>
                    <Icon name="cube" style={{ color: "green" }} />
                    {` Asset Information @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    } - `}
                    <strong>{`${config.activeNode.label}`}</strong>
                  </span>
                </Tooltip>
              }
              extra={
                <OverlayButton
                  key={"expandBtn"}
                  className="btn-inline"
                  bsSize="xsmall"
                  bsStyle="link"
                  glyph="resize-full"
                  text={`Click to expand Asset Panel`}
                  onClick={() =>
                    this.toggleFullScreen(true, {
                      panel: (
                        <AssetInfoWidget config={config} autoHeightMax={800} />
                      ),
                      name: "Asset Information",
                      icon: <Icon name="cube" style={{ color: "green" }} />,
                      description: assetInfoText,
                    })
                  }
                />
              }
            >
              <AssetInfoWidget config={config} />
            </Card>
          </Col>

          <Col md={6}>
            <Card
              style={{ minHeight: "350px" }}
              size="small"
              title={
                <Tooltip
                  placement="right"
                  title={criticalDatesText}
                  mouseEnterDelay={0.5}
                >
                  <span>
                    <Icon name="calendar" style={{ color: "red" }} />
                    {` Critical Dates @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    } - `}
                    <strong>{`${config.activeNode.label}`}</strong>
                  </span>
                </Tooltip>
              }
              extra={
                <OverlayButton
                  key={"expandBtn"}
                  className="btn-inline"
                  bsSize="xsmall"
                  bsStyle="link"
                  glyph="resize-full"
                  text={`Click to expand Critical Dates Panel`}
                  onClick={() =>
                    this.toggleFullScreen(true, {
                      panel: (
                        <CriticalDatesWidget
                          config={config}
                          autoHeightMax={800}
                        />
                      ),
                      name: "Critical Dates",
                      icon: <Icon name="calendar" style={{ color: "red" }} />,
                      description: criticalDatesText,
                    })
                  }
                />
              }
            >
              <CriticalDatesWidget config={config} />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

AssetDetails.propTypes = propTypes
AssetDetails.defaultProps = defaultProps
