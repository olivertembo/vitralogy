import React from "react"
import Formsy from "formsy-react"
import { Input, Textarea } from "formsy-react-components"
import PostingButton from "./PostingButton"
import * as api from "../../../../constants/api"

function GpsLocationForm({ auth, item, onProofSubmitted }) {
  const formRef = React.useRef(null)
  const [canSubmit, setCanSubmit] = React.useState(false)
  const [isPosting, setIsPosting] = React.useState(false)

  const submitForm = () => {
    setIsPosting(true)

    const { invoiceId, lineItemId } = item

    const data = formRef.current.getModel()
    const { description, latitude, longitude, comment } = data

    auth
      .request("post", api.SNOW_GPS_LOC_FOR_LINE_ITEM(invoiceId, lineItemId))
      .send({ latitude, longitude, description, comment })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            // success
          } else {
            // fail
          }
        },
        () => {
          // fail
        },
      )
      .then(() => {
        setIsPosting(false)
        onProofSubmitted()
      })
  }

  const enableSubmit = () => {
    setCanSubmit(true)
  }

  const disableSubmit = () => {
    setCanSubmit(false)
  }

  return (
    <div className="proof-form gps-location">
      <Formsy
        onValidSubmit={submitForm}
        onValid={enableSubmit}
        onInvalid={disableSubmit}
        ref={formRef}
      >
        <Input name="latitude" label="Latitude" required />
        <Input name="longitude" label="Longitude" required />
        <Input name="description" label="Description" />
        <Textarea
          rows={3}
          cols={40}
          name="comment"
          label="Comment"
          placeholder="Add optional comments associated with this proof submission"
          layout="vertical"
        />
        <PostingButton
          onClick={submitForm}
          canSubmit={canSubmit}
          isPosting={isPosting}
        />
      </Formsy>
    </div>
  )
}

export default GpsLocationForm
