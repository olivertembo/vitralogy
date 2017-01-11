import React from "react"
import Form from "react-jsonschema-form"

export default class DataForm extends React.Component {
  constructor(props) {
    super(props)

    this.customFieldTemplate = this.customFieldTemplate.bind(this)
  }

  componentDidMount() {
    console.log(this.props.formData)
  }

  customFieldTemplate(props) {
    const { id, classNames, label, required, description, children } = props
    return (
      <div className={classNames}>
        <label htmlFor={id}>
          {required ? "*" : null}
          {label}
        </label>
        {description}
        <fieldset disabled>{children}</fieldset>
      </div>
    )
  }

  render() {
    const { JSONSchema, DefaultUISchema, DefaultFormData } = this.props.formData

    return (
      <div className="data-form">
        <Form
          schema={JSON.parse(JSONSchema)}
          uiSchema={JSON.parse(DefaultUISchema)}
          formData={JSON.parse(DefaultFormData)}
          onChange={type => console.log("changed", type)}
          //onSubmit={(type) => this.props.onFormSubmit(type)}
          onError={type => console.log("errors", type)}
          //FieldTemplate={this.customFieldTemplate}
        >
          <br />
        </Form>
      </div>
    )
  }
}
