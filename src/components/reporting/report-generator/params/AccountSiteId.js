import React from "react"
import Select from "react-select"
import { parseAccountId } from "../../../../utils/jwtHelper"
import {
  useFilterParamsDispatch,
  useFilterParamsState,
} from "../FilterParamsContext"
import { postReportParamsMetadata } from "../../../../utils/reporting-client"

function AccountSiteId({ reportFilterParameterId, name, parentId }) {
  const { [parentId]: parentSatisfied } = useFilterParamsState()
  const dispatch = useFilterParamsDispatch()
  const [options, setOptions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [selectedOption, setSelectedOption] = React.useState(null)

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

    if (parentSatisfied) {
      getOptions()
    }
  }, [reportFilterParameterId, parentSatisfied])

  function onSelectItem(option) {
    setSelectedOption(option)
    dispatch({ type: name, payload: option.value })
  }

  const metadataOptions = options.map(x => {
    return { label: x.name, value: x.id }
  })

  return (
    <div className="mb-sm">
      <Select
        name="accountSiteId"
        options={metadataOptions}
        onChange={onSelectItem}
        value={selectedOption}
        placeholder={loading ? "Loading..." : `Select account site...`}
        isLoading={loading}
        isDisabled={loading || !parentSatisfied}
      />
    </div>
  )
}

export default AccountSiteId
