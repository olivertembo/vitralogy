import React from "react"
import Button from "react-bootstrap/lib/Button"
import ProofLoader from "../ProofLoader"
import useFetchSnowProof from "../../../../hooks/useFetchSnowProof"
import useDeleteSnowProof from "../../../../hooks/useDeleteSnowProof"
import { SNOW_CERT_DOC_FOR_LINE_ITEM } from "../../../../constants/api"
import CommonProof from "./CommonProof"

const CertifiedSnowTotals = ({ item, auth, onProofSubmitted, disabled }) => {
  const { invoiceId, lineItemId } = item
  const url = SNOW_CERT_DOC_FOR_LINE_ITEM(invoiceId, lineItemId)

  const { items, error: fetchError, isFetching } = useFetchSnowProof({
    auth,
    url,
    arrayKey: "documents",
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

export default CertifiedSnowTotals
