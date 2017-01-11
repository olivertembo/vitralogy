import React from "react"
import Form from "react-jsonschema-form"
import Button from "react-bootstrap/lib/Button"

export default class DataForm extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (
      JSON.stringify(nextProps.formData) === JSON.stringify(this.props.formData)
    ) {
      return false
    }

    return true
  }

  render() {
    const { JSONSchema, DefaultUISchema, DefaultFormData } = this.props.formData

    let uiSchema = JSON.parse(DefaultUISchema)
    if (this.props.finalized) {
      uiSchema["ui:readonly"] = true
    }

    return (
      <div className="data-form">
        <Form
          schema={JSON.parse(JSONSchema)}
          uiSchema={uiSchema}
          formData={JSON.parse(DefaultFormData)}
          onError={type => console.log("errors", type)}
        >
          <div className="text-right">
            <Button
              className="mr-md"
              disabled={false}
              onClick={this.props.onCancelClick}
              type="button"
            >
              {this.props.finalized === true ? "Close" : "Cancel"}
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}
