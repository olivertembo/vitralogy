import React from "react"
import Select from "react-select"
import { parseAccountId } from "../../../../utils/jwtHelper"
import {
  useFilterParamsDispatch,
  useFilterParamsState,
} from "../FilterParamsContext"
import { postReportParamsMetadata } from "../../../../utils/reporting-client"

function AccountSiteIds({ reportFilterParameterId, name, parentId }) {
  const { [parentId]: parentSatisfied } = useFilterParamsState()
  const dispatch = useFilterParamsDispatch()
  const [options, setOptions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [selectedOption, setSelectedOption] = React.useState([])

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

  function onSelectItem(selectedOptions) {
    setSelectedOption(selectedOptions)
    let payload = null
    if (selectedOptions !== null) {
      const optionValues = selectedOptions.map(x => x.value)
      payload = optionValues.length > 0 ? optionValues : null
    }

    dispatch({
      type: name,
      payload,
    })
  }

  const metadataOptions = options.map(x => {
    return { label: x.name, value: x.id }
  })

  return (
    <div className="mb-sm">
      <Select
        name="accountSiteIds"
        options={metadataOptions}
        onChange={onSelectItem}
        value={selectedOption}
        placeholder={loading ? "Loading..." : `Select account site(s)...`}
        isLoading={loading}
        isDisabled={loading || !parentSatisfied}
        isMulti={true}
      />
    </div>
  )
}

export default AccountSiteIds
