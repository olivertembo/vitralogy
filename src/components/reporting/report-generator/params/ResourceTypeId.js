import React from "react"
import Select from "react-select"
import { parseAccountId } from "../../../../utils/jwtHelper"
import {
  useFilterParamsDispatch,
  useFilterParamsState,
} from "../FilterParamsContext"
import { postReportParamsMetadata } from "../../../../utils/reporting-client"

function ResourceTypeId({ reportFilterParameterId, name, parentId }) {
  const [selectedOption, setSelectedOption] = React.useState(null)
  const dispatch = useFilterParamsDispatch()
  const {
    AccountSiteId,
    AccountSiteIds,
    ResourceTypeId,
    [parentId]: parentSatisfied,
  } = useFilterParamsState()
  const [options, setOptions] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const token = window.localStorage.getItem("vas_token")
    const accountId = parseAccountId(token)

    async function getOptions() {
      const result = await postReportParamsMetadata({
        accountId,
        reportFilterParameterId,
        AccountSiteId: AccountSiteId || null,
        AccountSiteIds: AccountSiteIds || null,
      })

      setOptions(result)
      setLoading(false)
    }

    if (parentSatisfied) {
      getOptions()
    }
  }, [reportFilterParameterId, AccountSiteId, AccountSiteIds, parentSatisfied])

  React.useEffect(() => {
    if (ResourceTypeId !== selectedOption && ResourceTypeId === null) {
      setSelectedOption(null)
    }
  }, [ResourceTypeId, selectedOption])

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
        placeholder={
          loading && parentSatisfied ? "Loading..." : `Select resource type...`
        }
        isLoading={loading && parentSatisfied}
        isDisabled={loading || !parentSatisfied}
      />
    </div>
  )
}

export default ResourceTypeId
