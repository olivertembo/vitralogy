import React, {useState} from "react"
import PropTypes from "prop-types"
import Tooltip from "antd/lib/tooltip"
import Progress from "antd/lib/progress"
import Tag from "antd/lib/tag"
import Alert from "react-bootstrap/lib/Alert"
import Icon from "react-fa/lib/Icon"
import FroalaEditorView from "react-froala-wysiwyg/FroalaEditorView"

import * as api from "../../constants/api"
import EmptyStateContainer from "../../containers/EmptyStateContainer"
import { format } from "../../utils/datetime"

import { ReactComponent as ClockIcon } from "../../assets/icons/brand/sand-clock.svg"


const propTypes = {
  data: PropTypes.object.isRequired,
  details: PropTypes.object.isRequired,
}

const defaultProps = {
  data: {},
  details: {},
}

const ResourceGroupPanel = ({ ...props }) => {
  const { data, details } = props
  const [activeBox, setActiveBox] = useState(null)

  const handleBoxExpand = index => e => setActiveBox(index === activeBox ? null : index)

  const [groupFilter, setGroupFilter] = React.useState(
    api.ASSET_RESULT_FILTER.ALL,
  )
  const setFilter = filter => setGroupFilter(filter.key)

  const filterGroup = () => {
    let groups = data.assets
    switch (groupFilter) {
      case api.ASSET_RESULT_FILTER.PENDING:
        groups = groups.filter(r => r.Result === null)
        break
      case api.ASSET_RESULT_FILTER.PASSED:
        groups = groups.filter(r => r.Result === true)
        break
      case api.ASSET_RESULT_FILTER.FAILED:
        groups = groups.filter(r => r.Result === false)
        break
      case api.ASSET_RESULT_FILTER.ALL:
      default:
        groups = data.assets
    }

    return groups
  }

  const filterActive = filter => {
    return groupFilter === filter.key
  }

  const makeFormatter = item => {
    let formatter = `${item.Make} / ${item.Model}`
    return formatter
  }

  const statusFormatter = item => {
    let label = "Pending"
    let color = "#ffb000"

    if (item.Result !== null) {
      if (item.Result) {
        label = `${data.passLabel}`
        color = "#3dd598"
      } else {
        label = `${data.failLabel}`
        color = "#D9534F"
      }
    }

    const status = (
      <span>
        <Tooltip
          placement="right"
          title={`Last updated by ${item.LastUpdatedBy ||
            "Unknown"} on ${format(item.LastUpdatedOn, "MM/DD/YYYY hh:mm A")} ${
            details.SiteTimeZoneShortName
          }`}
        >
            <span className="text-status" style={{color: color}}>{label} Job Setup</span>
        </Tooltip>
      </span>
    )

    return status
  }

  const expandedRowFormatter = (item, index) => {
    let icon = "clock"

    if (item.Result !== null) {
      if (item.Result) {
        icon = "check-circle-o"
      } else {
        icon = "times-circle-o"
      }
    }

    let failures = `None specified`
    if (item.FailedItems && item.FailedItems.length > 0) {
      failures = item.FailedItems.map(failure => {
        return (
          <Tooltip
            key={failure.FailClassId}
            mouseEnterDelay={0.5}
            placement="right"
            title={` ${failure.FailClass} specified by ${
              failure.LastUpdatedBy
            } on ${format(failure.LastUpdatedOn, "MM/DD/YYYY hh:mm A")} ${
              details.SiteTimeZoneShortName
            }`}
          >
            <Tag color={"red"} key={failure.failure}>
              {failure.FailClass}
            </Tag>
          </Tooltip>
        )
      })
    }

    const formatter = (
      <li key={item.name}>
          <p class="flex-header">
            <button onClick={handleBoxExpand(index)} className={`control-box ${activeBox === index && 'active'}`}></button>
            <span>{item.Name}</span>
          </p>
          <p>
            <strong>{makeFormatter(item)}</strong>
            <span>Make/Model</span>
          </p>
          <p>
            <strong>{statusFormatter(item)}</strong>
            <span>Status</span>
          </p>

        {activeBox === index && <div>
          <p className="icon-container">
            <Tooltip
              placement="left"
              title={`Last updated by ${item.LastUpdatedBy ||
                "Unknown"} on ${format(
                item.LastUpdatedOn,
                "MM/DD/YYYY hh:mm A",
              )} ${details.SiteTimeZoneShortName}`}
            >
              {icon === 'clock'
                ? <ClockIcon />
                : <Icon
                  name={icon}
                  style={{
                    fontSize: 35,
                    paddingBottom: "10px",
                  }}
                  />
              }
            </Tooltip>
          </p>

          {item.FailedItems &&
            item.FailedItems.length > 0 &&
            item.Result !== null &&
            item.Result === false && (
                <p>
                  <b><stong>{failures}</stong></b>
                  <span>Failures</span>
                </p>
            )}
          <strong>
            <FroalaEditorView
              model={item.Comment || "No comment specified"}
            />
          </strong>
          <span>Comment</span>
        </div>}
      </li>
    )

    return formatter
  }

  const className = "resource-table"
  const { isLoadingResourceGroup, assets, passLabel, failLabel } = data
  const groups = filterGroup()
  const total = assets.length
  const pending = assets.filter(r => r.Result === null).length
  const passed = assets.filter(r => r.Result === true).length
  const failed = assets.filter(r => r.Result === false).length

  if (isLoadingResourceGroup) {
    return (
      <Alert bsStyle="info">
        <Icon spin name="spinner" /> Fetching resources...
      </Alert>
    )
  }

  if (total === 0) {
    return (
      <div className={className}>
        <EmptyStateContainer
          alertStyle="info"
          title={`No resources available in resource group`}
          message={`No resources currently in place!`}
        />
      </div>
    )
  }

  const filters = [
    {
      key: api.ASSET_RESULT_FILTER.ALL,
      toolTip: `Click to show all ${details.ResourceType}`,
      tag: ` ALL (${assets.length})`,
      icon: "cube",
      style: "default",
    },
    {
      key: api.ASSET_RESULT_FILTER.PENDING,
      toolTip: `Click to filter ${
        details.ResourceType
      } that have not been worked on`,
      tag: ` Pending (${pending})`,
      icon: "hourglass-start",
      style: "warning",
    },
    {
      key: api.ASSET_RESULT_FILTER.PASSED,
      toolTip: `Click to filter ${
        details.ResourceType
      } that do not require additional work`,
      tag: ` ${passLabel} (${passed})`,
      icon: "check-circle-o",
      style: "success",
    },
    {
      key: api.ASSET_RESULT_FILTER.FAILED,
      toolTip: `Click to filter ${
        details.ResourceType
      } that require a corrective action`,
      tag: ` ${failLabel} (${failed})`,
      icon: "times-circle-o",
      style: "danger",
    },
  ]

  const filterButtons = filters.map(item => {
    return (
      <Tooltip
        key={item.key}
        mouseEnterDelay={0.5}
        placement="top"
        title={item.toolTip}
      >
        <button
          onClick={() => setFilter(item)}
          active={filterActive(item)}
          className={'filter-button' + (filterActive(item) && ' active') }
        >
          {item.tag}
        </button>
      </Tooltip>
    )
  })

  return (
    <div className={className}>
      <div class="header-section">
        <div className="filter-buttons">{filterButtons}</div>
        <span className="progress-container">
          <Tooltip title={`${passed + failed} done / ${pending} to do`}>
            <Progress
              strokeColor="#108ee9"
              percent={Math.round(((passed + failed) / total) * 100)}
              status="active"
              size="small"
            />
          </Tooltip>
        </span>
      </div>

      <ul className="list-blocks expandable">
        {groups.map((record, index) => expandedRowFormatter(record, index))}
      </ul>

    </div>
  )
}

ResourceGroupPanel.propTypes = propTypes
ResourceGroupPanel.defaultProps = defaultProps

export default ResourceGroupPanel
