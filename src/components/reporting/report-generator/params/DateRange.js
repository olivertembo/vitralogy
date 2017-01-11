import React from "react"
import DateTime from "react-datetime"
import moment from "moment"
import {
  useFilterParamsDispatch,
  useFilterParamsState,
} from "../FilterParamsContext"

const BeginRange = ({ reportFilterParameterId, parentId }) => (
  <DateRange
    reportFilterParameterId={reportFilterParameterId}
    type="BeginRange"
    parentId={parentId}
  />
)

const EndRange = ({ reportFilterParameterId, parentId }) => (
  <DateRange
    reportFilterParameterId={reportFilterParameterId}
    type="EndRange"
    parentId={parentId}
  />
)

function DateRange({ type, parentId }) {
  const {
    BeginRange,
    EndRange,
    [parentId]: parentSatisfied,
  } = useFilterParamsState()
  const dispatch = useFilterParamsDispatch()
  const [date, setDate] = React.useState(null)

  React.useEffect(() => {
    if (type === "BeginRange" && BeginRange !== date && BeginRange === null) {
      setDate(null)
    }
  }, [BeginRange, date, type])

  React.useEffect(() => {
    if (type === "EndRange" && EndRange !== date && EndRange === null) {
      setDate(null)
    }
  }, [EndRange, date, type])

  function onSelectDate(date) {
    if (date instanceof moment) {
      setDate(date)
      dispatch({ type, payload: date.format("MM/DD/YYYY") })
    } else {
      // otherwise invalid date, should just be the string user put in
    }
  }

  const inputId = `reporting-${type}`
  let isValidDate = current => {
    if (EndRange !== null) {
      return current.isBefore(moment(EndRange))
    }

    return true
  }
  let label = "Begin Date"
  if (type === "EndRange") {
    label = "End Date"
    isValidDate = current => {
      return current.isAfter(moment(BeginRange))
    }
  }

  return (
    <div className="form-group row mb-sm">
      <label
        className="control-label col-sm-3"
        data-required={true}
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className="col-sm-3">
        <DateTime
          onChange={onSelectDate}
          timeFormat={false}
          value={date}
          inputProps={{ id: inputId, disabled: !parentSatisfied }}
          isValidDate={isValidDate}
          closeOnSelect={true}
        />
      </div>
    </div>
  )
}

export { BeginRange, EndRange }
