import { useState } from "react"
import { camelizeKeys } from "humps"

function useDeleteSnowProof({ auth, url, onDeleted, queryParams }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  function deleteProof(proofItemId) {
    const deleteUrl = `${url}/${proofItemId}`
    setIsDeleting(true)
    auth
      .request("delete", deleteUrl)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)
          if (json.isSuccess) {
            onDeleted()
          } else {
            setError(json.msg)
          }
        },
        () => {
          setError("Error deleting proof.")
        },
      )
      .then(() => {
        setIsDeleting(false)
      })
  }

  return { isDeleting, error, deleteProof }
}

export default useDeleteSnowProof
