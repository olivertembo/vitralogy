import React from "react"
import ProofLoader from "../ProofLoader"
import useFetchSnowProof from "../../../../hooks/useFetchSnowProof"
import useDeleteSnowProof from "../../../../hooks/useDeleteSnowProof"
import { SNOW_TIMESTAMP_FOR_LINE_ITEM } from "../../../../constants/api"
import CommonProof from "./CommonProof"
import { format } from "../../../../utils/datetime"

const Timestamp = ({ item, auth, disabled, onProofSubmitted }) => {
  const { invoiceId, lineItemId } = item
  const url = SNOW_TIMESTAMP_FOR_LINE_ITEM(invoiceId, lineItemId)

  const { items, error: fetchError, isFetching } = useFetchSnowProof({
    auth,
    url,
    arrayKey: "timeStamps",
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
      <dt>Date</dt>
      <dd>{format(proof.date, "MM/DD/YYYY")}</dd>
      <dt>Time</dt>
      <dd>{format(proof.date.replace("00:00:00", proof.time), "h:mm:ss A")}</dd>
    </CommonProof>
  )
}

export default Timestamp
