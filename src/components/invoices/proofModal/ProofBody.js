import React from "react"
import ProofOptions from "./ProofOptions"
import ChooseProof from "./ChooseProof"
// import ProofProgressAlert from "./ProofProgressAlert"
import CertifiedSnowTotalsForm from "./forms/CertifiedSnowTotalsForm"
import GpsLocationForm from "./forms/GpsLocationForm"
import { AfterPhotoForm, BeforePhotoForm } from "./forms/PhotoForm"
import OtherDocumentForm from "./forms/OtherDocumentForm"
import SignatureForm from "./forms/SignatureForm"
import TimestampForm from "./forms/TimestampForm"
import { FMS_PROOF_TYPES } from "../../../constants/api"
import CertifiedSnowTotals from "./submittedProofs/CertifiedSnowTotals"
import GpsLocation from "./submittedProofs/GpsLocation"
import Signature from "./submittedProofs/Signature"
import OtherDocument from "./submittedProofs/OtherDocument"
import Timestamp from "./submittedProofs/Timestamp"
import { AfterPhoto, BeforePhoto } from "./submittedProofs/Photo"
import { ProofContext } from "./ProofContext"

const {
  CERT_SNOW_TOTALS,
  GPS_LOC,
  AFTER_PIC,
  BEFORE_PIC,
  SITE_MGR_SIG,
  OTHER_DOC,
  TIMESTAMP,
} = FMS_PROOF_TYPES

const formComponents = {
  0: ChooseProof,
  [CERT_SNOW_TOTALS]: CertifiedSnowTotalsForm,
  [GPS_LOC]: GpsLocationForm,
  [AFTER_PIC]: AfterPhotoForm,
  [BEFORE_PIC]: BeforePhotoForm,
  [SITE_MGR_SIG]: SignatureForm,
  [OTHER_DOC]: OtherDocumentForm,
  [TIMESTAMP]: TimestampForm,
}

const displayComponents = {
  [CERT_SNOW_TOTALS]: CertifiedSnowTotals,
  [GPS_LOC]: GpsLocation,
  [SITE_MGR_SIG]: Signature,
  [OTHER_DOC]: OtherDocument,
  [TIMESTAMP]: Timestamp,
  [AFTER_PIC]: AfterPhoto,
  [BEFORE_PIC]: BeforePhoto,
}

function ProofBody() {
  const proofContext = React.useContext(ProofContext)
  const { item, auth, options, disabled, onProofSubmitted } = proofContext
  const [selectedOptionId, setSelectedOptionId] = React.useState(0)

  const onOptionClick = selectedOptionId =>
    setSelectedOptionId(selectedOptionId)

  const hasSubmission =
    selectedOptionId > 0
      ? options.find(x => x.proofTypeId === selectedOptionId).uploadedCount > 0
      : false
  const FormComponent = hasSubmission
    ? displayComponents[selectedOptionId]
    : formComponents[selectedOptionId]
  const props = {
    item,
    auth,
    onProofSubmitted,
    hasSubmission,
    disabled,
  }

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-md-12 mb-md">
          <strong>Select a submitted proof below to view details.</strong>
        </div>
      </div>
      {/* <div className="row">
        <div className="col-md-12">
          <ProofProgressAlert />
        </div>
      </div> */}
      <div className="row">
        {/* proof options here */}
        <div className="col-md-4">
          <ProofOptions
            onOptionClick={onOptionClick}
            selectedOptionId={selectedOptionId}
          />
        </div>
        {/* form goes here */}
        <div className="col-md-8">
          {!!FormComponent && <FormComponent {...props} options={options} />}
        </div>
      </div>
    </React.Fragment>
  )
}

export default ProofBody
