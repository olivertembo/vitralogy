import React from "react"
import Formsy from "formsy-react"
import { Input, Textarea } from "formsy-react-components"
import FormsyDropzone from "../../../formsyWrappers/FormsyDropzone"
import PostingButton from "./PostingButton"
import * as api from "../../../../constants/api"

export default class OtherDocumentForm extends React.Component {
  state = {
    isPosting: false,
    canSubmit: false,
  }

  enableSubmit = () => {
    this.setState({ canSubmit: true })
  }

  disableSubmit = () => {
    this.setState({ canSubmit: false })
  }

  submitForm = () => {
    this.setState({ isPosting: true })

    const { invoiceId, lineItemId } = this.props.item

    const data = this.formRef.getModel()
    const { description, files, comment } = data
    const postBody = new FormData()
    postBody.append("description", description)
    postBody.append("comment", comment)
    files.forEach(file => {
      postBody.append("content", file)
    })

    this.props.auth
      .request(
        "post",
        api.SNOW_SUPPORT_DOC_FOR_LINE_ITEM(invoiceId, lineItemId),
      )
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
        this.setState({ isPosting: false }, () => {
          this.props.onProofSubmitted()
        })
      })
  }

  render() {
    return (
      <div className="proof-form other-document">
        <Formsy
          onValidSubmit={this.submitForm}
          onValid={this.enableSubmit}
          onInvalid={this.disableSubmit}
          ref={ref => {
            this.formRef = ref
          }}
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
            onClick={this.submitForm}
            canSubmit={this.state.canSubmit}
            isPosting={this.state.isPosting}
          />
        </Formsy>
      </div>
    )
  }
}
