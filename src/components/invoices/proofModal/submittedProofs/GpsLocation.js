import React from "react"
import ProofLoader from "../ProofLoader"
import useFetchSnowProof from "../../../../hooks/useFetchSnowProof"
import useDeleteSnowProof from "../../../../hooks/useDeleteSnowProof"
import { SNOW_GPS_LOC_FOR_LINE_ITEM } from "../../../../constants/api"
import CommonProof from "./CommonProof"

const GpsLocation = ({ item, auth, onProofSubmitted, disabled }) => {
  const { invoiceId, lineItemId } = item
  const url = SNOW_GPS_LOC_FOR_LINE_ITEM(invoiceId, lineItemId)

  const { items, error: fetchError, isFetching } = useFetchSnowProof({
    auth,
    url,
    arrayKey: "locations",
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
      <dt>Latitude</dt>
      <dd>{proof.latitude}</dd>
      <dt>Longitude</dt>
      <dd>{proof.longitude}</dd>
    </CommonProof>
  )
}

export default GpsLocation
