import React from "react"
import PropTypes from "prop-types"
import moment from "moment"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
//import Grid from "react-bootstrap/lib/Grid"
import Icon from "react-fa/lib/Icon"
import Tooltip from "antd/lib/tooltip"
import Card from "antd/lib/card"
import Drawer from "antd/lib/drawer"

//import OverlayButton from "../../layout/OverlayButton"
import ExpandedWidget from "./ExpandedWidget"

const propTypes = {
  config: PropTypes.object.isRequired,
}

const defaultProps = {
  config: {},
}

export default class MaintenanceRounds extends React.Component {
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
    const className = "maintenance-rounds"
    const { showFullScreenDrawer, selectedWidget } = this.state

    const { config } = this.props

    const locationName = `${
      config.activeNode.activeSite === undefined
        ? ""
        : config.activeNode.activeSite.label
    }`
    const schedRange = `${moment(config.startDate).format(
      "MM/DD/YYYY",
    )} - ${moment(config.endDate).format("MM/DD/YYYY")}`

    const correctiveActionText = `List of all active or completed corrective actions for ${locationName} scheduled between ${schedRange}.`
    const performanceText = `All jobs covered/completed by subcontractor workers for ${locationName} between ${schedRange}.`

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
          />
        </Drawer>

        <Row>
          <h1>TODO SUMMARY??</h1>
        </Row>

        <Row>
          <Col md={8}>
            <Card
              style={{ minHeight: "350px" }}
              size="small"
              title={
                <Tooltip
                  placement="right"
                  title={correctiveActionText}
                  mouseEnterDelay={0.5}
                >
                  <span>
                    <Icon name="wrench" style={{ color: "silver" }} />
                    {` TODO 1 @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    }`}
                  </span>
                </Tooltip>
              }
            >
              <h1>TODO 1</h1>
            </Card>
          </Col>

          <Col md={4}>
            <Card
              style={{ minHeight: "350px" }}
              size="small"
              title={
                <Tooltip
                  placement="right"
                  title={performanceText}
                  mouseEnterDelay={0.5}
                >
                  <span>
                    <Icon name="car" style={{ color: "red" }} />
                    {` TODO 2 @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    }`}
                  </span>
                </Tooltip>
              }
            >
              <h1>TODO 2</h1>
            </Card>
          </Col>
        </Row>
        <br />

        <Row>
          <Col md={12}>
            <Card
              style={{ minHeight: "450px" }}
              size="small"
              title={
                <Tooltip
                  placement="right"
                  title={correctiveActionText}
                  mouseEnterDelay={0.5}
                >
                  <span>
                    <Icon name="wrench" style={{ color: "silver" }} />
                    {` TODO 3 @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    }`}
                  </span>
                </Tooltip>
              }
            >
              <h1>TODO 3</h1>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

MaintenanceRounds.propTypes = propTypes
MaintenanceRounds.defaultProps = defaultProps
