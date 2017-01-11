import React from "react"
import Select from "react-select"
import { parseAccountId } from "../../../../utils/jwtHelper"
import {
  useFilterParamsDispatch,
  useFilterParamsState,
} from "../FilterParamsContext"
import { postReportParamsMetadata } from "../../../../utils/reporting-client"

function ServiceContractId({ reportFilterParameterId, name, parentId }) {
  const {
    AccountSiteId,
    AccountSiteIds,
    ResourceTypeId,
    AccountSiteResourceId: ResourceId,
    MasterContractId,
    ServiceContractId,
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
        ResourceId: ResourceId || null,
        MasterContractId: MasterContractId || null,
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
    ResourceId,
    MasterContractId,
    parentSatisfied,
  ])

  React.useEffect(() => {
    if (ServiceContractId !== selectedOption && ServiceContractId === null) {
      setSelectedOption(null)
    }
  }, [ServiceContractId, selectedOption])

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
        name={`serviceContractId`}
        options={metadataOptions}
        onChange={onSelectItem}
        value={selectedOption}
        placeholder={
          loading && parentSatisfied
            ? "Loading..."
            : `Select service contract...`
        }
        isLoading={loading && parentSatisfied}
        isDisabled={loading || !parentSatisfied}
      />
    </div>
  )
}

export default ServiceContractId
