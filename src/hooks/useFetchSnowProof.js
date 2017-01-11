import { useState, useEffect } from "react"
import { camelizeKeys } from "humps"

function useFetchSnowProof({ auth, url, arrayKey, queryParams }) {
  const [isFetching, setIsFetching] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  const fetchData = () => {
    auth
      .request("get", url)
      .query(queryParams)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)
          if (json.isSuccess) {
            // success
            setItems(json[arrayKey])
          } else {
            // fail
            setError(json.msg)
          }
        },
        () => {
          // fail
          setError("Error retrieving proof data.")
        },
      )
      .then(() => {
        setIsFetching(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { items, error, isFetching }
}

export default useFetchSnowProof
