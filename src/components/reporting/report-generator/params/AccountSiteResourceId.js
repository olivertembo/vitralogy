import React from "react"
import Select from "react-select"
import { parseAccountId } from "../../../../utils/jwtHelper"
import {
  useFilterParamsDispatch,
  useFilterParamsState,
} from "../FilterParamsContext"
import { postReportParamsMetadata } from "../../../../utils/reporting-client"

function AccountSiteResourceId({ reportFilterParameterId, name, parentId }) {
  const {
    AccountSiteId,
    AccountSiteIds,
    ResourceTypeId,
    AccountSiteResourceId,
    [parentId]: parentSatisfied,
  } = useFilterParamsState()
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
        AccountSiteId: AccountSiteId || null,
        AccountSiteIds: AccountSiteIds || null,
        ResourceTypeId: ResourceTypeId || null,
      })

      setOptions(result)
      setLoading(false)
    }

    if (parentSatisfied) {
      getOptions()
    }
  }, [
    reportFilterParameterId,
    AccountSiteId,
    AccountSiteIds,
    ResourceTypeId,
    parentSatisfied,
  ])

  React.useEffect(() => {
    if (
      AccountSiteResourceId !== selectedOption &&
      AccountSiteResourceId === null
    ) {
      setSelectedOption(null)
    }
  }, [AccountSiteResourceId, selectedOption])

  function onSelectItem(option) {
    setSelectedOption(option)
    dispatch({ type: name, payload: option.value })
  }

  let metadataOptions = null
  if (AccountSiteIds && AccountSiteIds.length > 1) {
    metadataOptions = options.map(x => {
      return { label: `${x.name}, ${x.parentName}`, value: x.id }
    })
  } else {
    metadataOptions = options.map(x => {
      return { label: x.name, value: x.id }
    })
  }

  return (
    <div className="mb-sm">
      <Select
        name="accountSiteResourceId"
        options={metadataOptions}
        onChange={onSelectItem}
        value={selectedOption}
        placeholder={
          loading && parentSatisfied ? "Loading..." : `Select site resource...`
        }
        isLoading={loading && parentSatisfied}
        isDisabled={loading || !parentSatisfied}
      />
    </div>
  )
}

export default AccountSiteResourceId
