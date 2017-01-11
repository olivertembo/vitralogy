import React from "react"
import Button from "react-bootstrap/lib/Button"
import ProofLoader from "../ProofLoader"
import useFetchSnowProof from "../../../../hooks/useFetchSnowProof"
import useDeleteSnowProof from "../../../../hooks/useDeleteSnowProof"
import { SNOW_SIGNATURE_FOR_LINE_ITEM } from "../../../../constants/api"
import CommonProof from "./CommonProof"

const Signature = ({ item, auth, disabled, onProofSubmitted }) => {
  const { invoiceId, lineItemId } = item
  const url = SNOW_SIGNATURE_FOR_LINE_ITEM(invoiceId, lineItemId)

  const { items, error: fetchError, isFetching } = useFetchSnowProof({
    auth,
    url,
    arrayKey: "signatures",
  })

  const proof = items.filter(x => x.isDeleted === false)[0] || null

  const { isDeleting, error: deleteError, deleteProof } = useDeleteSnowProof({
    auth,
    url,
    onDeleted: onProofSubmitted,
  })

  if (isFetching || isDeleting || !proof) {
    return <ProofLoader />
  }

  if (fetchError || deleteError) {
    return <span>Error: {fetchError || deleteError}</span>
  }

  return (
    <CommonProof {...proof} onDeleteProof={deleteProof} disabled={disabled}>
      <dt>File</dt>
      <dd>
        <Button
          bsStyle="link"
          className="btn-anchor"
          onClick={() => {
            auth.downloadFile(proof.url, proof.fileName)
          }}
        >
          Download
        </Button>
      </dd>
    </CommonProof>
  )
}

export default Signature
