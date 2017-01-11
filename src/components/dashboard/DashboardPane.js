import React from "react"
import PropTypes from "prop-types"
import DatePicker from "antd/lib/date-picker"
import Select from "antd/lib/select"
import Result from "antd/lib/result"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"

import LegionellaCompliance from "./LegionellaCompliance"
import DOBJobs from "./DOBJobs"
import MaintenanceRounds from "./MaintenanceRounds"
import AssetDetails from "./AssetDetails"
import DOBCalendar from "./DOBCalendar"
import CriticalDates from "./CriticalDates"
import FormNormalizedDataViewer from "./FormNormalizedDataViewer";
import * as api from "../../constants/api"

import {ReactComponent as SiteIcon} from "../../assets/icons/brand/site.svg";

const Option = Select.Option

const propTypes = {
  config: PropTypes.object.isRequired,
  onFiltersApplied: PropTypes.func.isRequired,
}

const defaultProps = {
  config: {},
}

const DashboardPane = ({ ...props }) => {
  const {
    config,
    onFiltersApplied,
    dashboardTypes,
    dashboardTypesLoading,
    largeview
  } = props

  const onDashboardSelect = value => {    
    const activeNode = Object.assign({}, config.activeNode, {
      dashboardSelected: value,
    })

    const newconfig = Object.assign({}, config, {
      activeNode,
    })

    onFiltersApplied(newconfig)
  }

  const disabledStartDate = startValue => {
    const { endDate } = config
    if (!startValue || !endDate) {
      return false
    }
    return startValue.valueOf() > endDate.valueOf()
  }

  const disabledEndDate = endValue => {
    const { startDate } = config
    if (!endValue || !startDate) {
      return false
    }
    return endValue.valueOf() <= startDate.valueOf()
  }

  const onDateChange = (field, value) => {
    const newconfig = Object.assign({}, config, {
      [field]: value,
    })

    onFiltersApplied(newconfig)
  }

  const onStartChange = value => {
    onDateChange("startDate", value)
  }

  const onEndChange = value => {
    onDateChange("endDate", value)
  }

  const className = "sidebar-layout__content-wrapper container-fluid"

  if (config.activeNode.type !== api.DASHBOARD_TREE_NODE.PORTFOLIO && config.activeNode.activeSite === undefined) {
    return (
      <div className="dashboard-pane empty">
        <div className="message">
          <Result
            status="404"
            title="Select a Node"
            subTitle="Please select on the left pane to see a dashboard."
          />
        </div>
      </div>
    )
  }

  if (config.activeNode.type !== api.DASHBOARD_TREE_NODE.PORTFOLIO && config.activeNode.dashboardsAvailable.length === 0) {
    return (
      <div className="dashboard-pane empty">
        <div className="message">
          <Result
            status="404"
            title="No Dashboards Available"
            subTitle={`No dashboards currently available for ${
              config.activeNode.label
            }.`}
          />
        </div>
      </div>
    )
  }

  const typeOptions = dashboardTypes
    .filter(t => config.activeNode.dashboardsAvailable.includes(t.Id))
    .map(item => <Option key={item.Id}>{item.Name}</Option>)

  const hideDateFilter =    
    config.activeNode.type === api.DASHBOARD_TREE_NODE.ASSET ||
    config.activeNode.dashboardSelected !== api.DASHBOARD_TYPES.LEGIONELLA_COMPLIANCE 
  
  const getSiteHeaderActiveSection = () => 
    <><SiteIcon className="active-selection__icon"/>
    <span className="active-selection__group">
      <span title={config.activeNode.activeSite.label} className="active-selection__site">{config.activeNode.activeSite.label}</span>
      {
        config.activeNode.type === api.DASHBOARD_TREE_NODE.ASSET && 
          <span title={config.activeNode.label} className="active-selection__asset">{config.activeNode.label}</span>
        
      }
    </span> </>;
  const getPortfolioHeaderActiveSection = () =>
    <>
      <span className="active-selection__group">
        <span title={config.activeNode.label} className="active-selection__site">{config.activeNode.label}</span>
      </span>
    </>;

  const headerActiveSection = (config.activeNode && config.activeNode.type === api.DASHBOARD_TREE_NODE.PORTFOLIO) ?
    getPortfolioHeaderActiveSection() : getSiteHeaderActiveSection();
  return (
    <div className={className}>
      <Row className="dashboard-pane__header">
        <Col sm={hideDateFilter ? 8 : 4} className="dashboard-pane__header-section">          
          <span className="active-selection">
            {headerActiveSection}
          </span>
         
        </Col>

        {!hideDateFilter && (
          <Col sm={4} className="dashboard-pane__header-section">
            <div className="two-lines">
              
              <DatePicker
                disabledDate={disabledStartDate}
                allowClear={false}
                value={config.startDate}
                format="MM/DD/YYYY"
                placeholder="Start Range"
                onChange={onStartChange}
              />
              <span className="two-lines__label">Start Date</span>
            </div>
            <div className="two-lines">              
              <DatePicker
                disabledDate={disabledEndDate}
                allowClear={false}
                format="MM/DD/YYYY"
                value={config.endDate}
                placeholder="End Range"
                onChange={onEndChange}
              />
              <span className="two-lines__label">End Date</span>
            </div>
          </Col>
          
        )}
        <Col sm={4} className="dashboard-pane__header-section">
          <Select className="dashboard-type-selector"           
            onChange={onDashboardSelect}
            value={config.activeNode.dashboardSelected}
            disabled={dashboardTypesLoading || typeOptions.length === 1}>{typeOptions}</Select>
        </Col>
      </Row>

      <br />

      {config.activeNode.dashboardSelected ===
        api.DASHBOARD_TYPES.LEGIONELLA_COMPLIANCE && (
        <LegionellaCompliance config={config} />
      )}

      {config.activeNode.dashboardSelected ===
        api.DASHBOARD_TYPES.DOB_CALENDAR && <DOBCalendar config={config} />}

      {config.activeNode.dashboardSelected === api.DASHBOARD_TYPES.DOB_JOBS && (
        <DOBJobs config={config} />
      )}

      {config.activeNode.dashboardSelected ===
        api.DASHBOARD_TYPES.MAINTENANCE_ROUNDS && (
        <MaintenanceRounds config={config} />
      )}

      {config.activeNode.dashboardSelected ===
        api.DASHBOARD_TYPES.ASSET_DETAILS && <AssetDetails config={config} />}

      {config.activeNode.dashboardSelected ===
        api.DASHBOARD_TYPES.CRITICAL_DATES && <CriticalDates config={config} />}

      {config.activeNode.dashboardSelected ===
        api.DASHBOARD_TYPES.SMART_ROUNDS && <FormNormalizedDataViewer config={config} largeview={largeview}/>}
    </div>
  )
}

DashboardPane.propTypes = propTypes
DashboardPane.defaultProps = defaultProps

export default DashboardPane
