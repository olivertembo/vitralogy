import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import moment from "moment"
//import Icon from "react-fa/lib/Icon"
import Tooltip from "antd/lib/tooltip"
import List from "antd/lib/list"
import Button from "antd/lib/button"

import DOBJobsWidget from "./widgets/DOBJobsWidget"
import * as api from "../../constants/api"

const propTypes = {
  config: PropTypes.object.isRequired,
}

const defaultProps = {
  config: {},
}

const DOBJobs = props => {
    const className = "dob-jobs"
    const [filter, setFilter] = useState(api.DOB_WIDGET_TYPE.YEAR)

    const currentYear = moment().format("YYYY")
    const currentMonth = moment().format("MMMM")

    const { config } = props

    const locationName = `${
      config.activeNode.activeSite === undefined
        ? ""
        : config.activeNode.activeSite.label
    }`

    const currentDOBYearText = `Any critical dates defined for ${locationName} for the current year ${currentYear}.`
    const currentDOBMonthText = `Any critical dates defined for ${locationName} for the current month ${currentMonth} / ${currentYear}.`
    const lateDOBJobsText = `Any critical dates defined for ${locationName} that are late.`

const cards = [
  {
    title: `Critical Year ${currentYear}`,    
    toolTip: ` Critical Dates for the current year - ${currentYear} @ ${
            config.activeNode.activeSite === undefined
                ? ""
                : config.activeNode.activeSite.label
            }`,
    widgetType: api.DOB_WIDGET_TYPE.YEAR 
  },
  {
      title: `Critical Month - ${currentMonth} ${currentYear}`, 
      toolTip: ` Critical Dates for the current month - ${currentMonth} / ${currentYear} @ ${
          config.activeNode.activeSite === undefined
              ? ""
              : config.activeNode.activeSite.label
          }`,
      widgetType: api.DOB_WIDGET_TYPE.MONTH 
  },
  {
      title: `Late Critical Dates`,
      toolTip: ` Late Critical Dates @ ${
          config.activeNode.activeSite === undefined
              ? ""
              : config.activeNode.activeSite.label
          }`,
      widgetType: api.DOB_WIDGET_TYPE.LATE 
  },
]
    const onCriticalFilter = newFilter => {
        setFilter(newFilter)
    }

    return (
      <div className={className}>
            <List
                grid={{ column: 3 }}
                itemLayout="horizontal"
                pagination={false}
                dataSource={cards}
                renderItem={c => (
                    <List.Item key={c.widgetType}>
                        <Tooltip
                            placement="top"
                            title={c.toolTip}
                            mouseEnterDelay={0.5}
                        >
                            <Button                                
                                size="small"
                            type="default"
                                onClick={()=> onCriticalFilter(c.widgetType)}
                        >
                            {c.title}
                            </Button>
                        </Tooltip>
                    </List.Item>
                )}
            />

            <DOBJobsWidget
                config={config}
                widgetType={filter}
                autoHeightMax={205}
            />

      </div>
    )
}

DOBJobs.propTypes = propTypes
DOBJobs.defaultProps = defaultProps

export default DOBJobs