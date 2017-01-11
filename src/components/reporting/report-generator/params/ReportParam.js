import React from "react"
import Select from "react-select"
import { parseAccountId } from "../../../../utils/jwtHelper"
import { useFilterParamsDispatch } from "../FilterParamsContext"
import { postReportParamsMetadata } from "../../../../utils/reporting-client"

const PLACEHOLDERS = {
  1: "account",
  2: "account site",
  8: "account sites",
  3: "site resource",
  9: "resource type",
  6: "master contract",
  7: "service contract",
}

function ReportParam({ reportFilterParameterId, paramName }) {
  const dispatch = useFilterParamsDispatch()
  const [options, setOptions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [selectedOption, setSelectedOption] = React.useState(null)
  // const requiresParent = options.every(x => x.parentId !== null)
  const requiresParent = false

  React.useEffect(() => {
    const token = window.localStorage.getItem("vas_token")
    const accountId = parseAccountId(token)

    async function getOptions() {
      const result = await postReportParamsMetadata({
        accountId,
        reportFilterParameterId,
      })

      setOptions(result)
      setLoading(false)
    }

    getOptions()
  }, [])

  function onSelectItem(option) {
    setSelectedOption(option)
    dispatch({ type: paramName, payload: option.value })
  }

  const metadataOptions = options.map(x => {
    return { label: x.name, value: x.id }
  })

  return (
    <div className="mb-sm">
      <Select
        name={`reportParams-${reportFilterParameterId}`}
        options={metadataOptions}
        onChange={onSelectItem}
        value={selectedOption}
        placeholder={
          loading
            ? "Loading..."
            : `Select ${PLACEHOLDERS[reportFilterParameterId]}...`
        }
        isLoading={loading}
        disabled={loading || requiresParent}
      />
    </div>
  )
}

export default ReportParam
