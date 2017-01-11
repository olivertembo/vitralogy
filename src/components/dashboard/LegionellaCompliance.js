import React from "react"
import PropTypes from "prop-types"
import moment from "moment"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
import Icon from "react-fa/lib/Icon"
import Tooltip from "antd/lib/tooltip"
import Card from "antd/lib/card"
import Drawer from "antd/lib/drawer"

import ProjectServicesWidget from "./widgets/ProjectServicesWidget"
import OpenJobsWidget from "./widgets/OpenJobsWidget"
import CorrectiveActionsWidget from "./widgets/CorrectiveActionsWidget"
import PerformanceWidget from "./widgets/PerformanceWidget"
import JobSummaryCardsWidget from "./widgets/JobSummaryCardsWidget"
import OverlayButton from "../layout/OverlayButton"
import ExpandedWidget from "./ExpandedWidget"
import CriticalDatesWidget from "./widgets/CriticalDatesWidget"

const propTypes = {
  config: PropTypes.object.isRequired,
}

const defaultProps = {
  config: {},
}

export default class LegionellaCompliance extends React.Component {
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
    const className = "legionalla-compliance"
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
    const serviceText = `List of all currently defined projects accessible to ${locationName} scheduled between ${schedRange}.`
    const openJobsText = `List of currently opened jobs (either active or upcoming) for ${locationName} scheduled between ${schedRange}.`
    const criticalDatesText = `Any critical dates defined for ${locationName}.`

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
            showSchedule={selectedWidget ? selectedWidget.showSchedule : false}
          />
        </Drawer>

        <Row>
          <JobSummaryCardsWidget config={config} />
        </Row>

        <Row>
          <Col md={12}>
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
                    {` Corrective Actions @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    }`}
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
                  text={`Click to expand Corrective Actions Panel`}
                  onClick={() =>
                    this.toggleFullScreen(true, {
                      panel: (
                        <CorrectiveActionsWidget
                          config={config}
                          autoHeightMax={800}
                        />
                      ),
                      name: "Corrective Actions",
                      icon: <Icon name="wrench" style={{ color: "silver" }} />,
                      description: correctiveActionText,
                      showSchedule: true,
                    })
                  }
                />
              }
            >
              <CorrectiveActionsWidget config={config} />
            </Card>
          </Col>
        </Row>
        <br />

        <Row>
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
                    }`}
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
                      showSchedule: false,
                    })
                  }
                />
              }
            >
              <CriticalDatesWidget config={config} />
            </Card>
          </Col>

          <Col md={6}>
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
                    {` Performance @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    }`}
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
                  text={`Click to expand Performance Panel`}
                  onClick={() =>
                    this.toggleFullScreen(true, {
                      panel: (
                        <PerformanceWidget
                          config={config}
                          autoHeightMax={800}
                        />
                      ),
                      name: "Performance",
                      icon: <Icon name="card" style={{ color: "red" }} />,
                      description: performanceText,
                      showSchedule: true,
                    })
                  }
                />
              }
            >
              <PerformanceWidget config={config} />
            </Card>
          </Col>
        </Row>
        <br />

        <Row>
          <Col md={6}>
            <Card
              size="small"
              style={{ minHeight: "399px" }}
              title={
                <Tooltip
                  placement="right"
                  title={serviceText}
                  mouseEnterDelay={0.5}
                >
                  <span>
                    <Icon name="handshake-o" style={{ color: "black" }} />
                    {` Service Based Projects @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    }`}
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
                  text={`Click to expand Service Based Projects Panel`}
                  onClick={() =>
                    this.toggleFullScreen(true, {
                      panel: (
                        <ProjectServicesWidget
                          config={config}
                          autoHeightMax={800}
                        />
                      ),
                      name: "Service Based Projects",
                      icon: (
                        <Icon name="handshake-o" style={{ color: "black" }} />
                      ),
                      description: serviceText,
                      showSchedule: true,
                    })
                  }
                />
              }
            >
              <ProjectServicesWidget config={config} />
            </Card>
          </Col>

          <Col md={6}>
            <Card
              size="small"
              style={{ minHeight: "399px" }}
              title={
                <Tooltip
                  placement="right"
                  title={openJobsText}
                  mouseEnterDelay={0.5}
                >
                  <span>
                    <Icon name="briefcase" style={{ color: "green" }} />
                    {` Open Jobs @ ${
                      config.activeNode.activeSite === undefined
                        ? ""
                        : config.activeNode.activeSite.label
                    }`}
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
                  text={`Click to expand Open Jobs Panel`}
                  onClick={() =>
                    this.toggleFullScreen(true, {
                      panel: (
                        <OpenJobsWidget config={config} autoHeightMax={800} />
                      ),
                      name: "Open Jobs",
                      icon: (
                        <Icon name="briefcase" style={{ color: "green" }} />
                      ),
                      description: openJobsText,
                      showSchedule: true,
                    })
                  }
                />
              }
            >
              <OpenJobsWidget config={config} />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

LegionellaCompliance.propTypes = propTypes
LegionellaCompliance.defaultProps = defaultProps
