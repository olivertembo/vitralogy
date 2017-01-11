import React from "react"
import { parseAccountId } from "../../../../utils/jwtHelper"
import { useFilterParamsDispatch } from "../FilterParamsContext"

function AccountId() {
  const dispatch = useFilterParamsDispatch()
  React.useEffect(() => {
    const token = window.localStorage.getItem("vas_token")
    const payload = parseAccountId(token)
    dispatch({ type: "AccountId", payload })
  }, [])

  return null
}

export default AccountId
