import React from "react"
import Formsy from "formsy-react"
import FormsyDropzone from "../../../formsyWrappers/FormsyDropzone"
import { Input, Textarea } from "formsy-react-components"
import PostingButton from "./PostingButton"
import * as api from "../../../../constants/api"

function PhotoForm({ auth, item, isPostAction, onProofSubmitted }) {
  const formRef = React.useRef(null)
  const [canSubmit, setCanSubmit] = React.useState(false)
  const [isPosting, setIsPosting] = React.useState(false)

  const submitForm = () => {
    setIsPosting(true)

    const { invoiceId, lineItemId } = item

    const data = formRef.current.getModel()
    const { description, files, comment } = data
    const postBody = new FormData()
    postBody.append("description", description)
    postBody.append("comment", comment)
    files.forEach(file => {
      postBody.append("content", file)
    })

    auth
      .request("post", api.SNOW_PHOTO_FOR_LINE_ITEM(invoiceId, lineItemId))
      .query({ isPostAction })
      .send(postBody)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess) {
            // success
            console.log(response.body)
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
    <div className="proof-form photo">
      <Formsy
        onValidSubmit={submitForm}
        onValid={enableSubmit}
        onInvalid={disableSubmit}
        ref={formRef}
      >
        <FormsyDropzone
          name="files"
          label="Files"
          accept="image/*,.pdf,.doc,.docx,.zip"
          required
        />
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

const AfterPhotoForm = props => PhotoForm({ ...props, isPostAction: true })
const BeforePhotoForm = props => PhotoForm({ ...props, isPostAction: false })

export { AfterPhotoForm, BeforePhotoForm }
