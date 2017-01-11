import React from "react"
import Formsy from "formsy-react"
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar"
import { Select, Input, Textarea } from "formsy-react-components"
import PostingButton from "./PostingButton"
import FormsyDropzone from "../../../formsyWrappers/FormsyDropzone"
import * as api from "../../../../constants/api"

export default class CertifiedSnowTotalsForm extends React.Component {
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
    const { description, snowTotal, files, comment, weatherProvider } = data
    const postBody = new FormData()
    postBody.append("weather-provider-id", weatherProvider)
    postBody.append("description", description)
    postBody.append("snow-total", snowTotal)
    postBody.append("comment", comment)
    files.forEach(file => {
      postBody.append("content", file)
    })

    this.props.auth
      .request("post", api.SNOW_CERT_DOC_FOR_LINE_ITEM(invoiceId, lineItemId))
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
    const weatherProviderOptions = api.FMS_WEATHER_PROVIDERS.map(type => {
      return {
        value: type.ItemId.toString(),
        label: type.Value,
      }
    })

    weatherProviderOptions.unshift({
      value: "",
      label: "Select document type...",
    })

    return (
      <div className="proof-form cert-snow-totals">
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
          <Select
            name="weatherProvider"
            id="weatherProvider"
            label="Weather Provider"
            options={weatherProviderOptions}
            required
          />
          <Input name="snowTotal" label="New (max) snow total" required />
          <Input name="description" label="Description" />
          <Textarea
            rows={3}
            cols={40}
            name="comment"
            label="Comment"
            placeholder="Add optional comments associated with this proof submission"
            layout="vertical"
          />
          <ButtonToolbar>
            <PostingButton
              onClick={this.submitForm}
              canSubmit={this.state.canSubmit}
              isPosting={this.state.isPosting}
            />
            {this.props.hasSubmission && (
              <PostingButton
                onClick={this.props.onCancelAnotherProof}
                isPosting={this.state.isPosting}
                text="Cancel"
              />
            )}
          </ButtonToolbar>
        </Formsy>
      </div>
    )
  }
}
