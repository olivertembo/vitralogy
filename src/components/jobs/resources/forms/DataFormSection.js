import React from "react"
import PropTypes from "prop-types"
import Modal from "react-bootstrap/lib/Modal"
import Alert from "react-bootstrap/lib/Alert"
import Icon from "react-fa/lib/Icon"

import DataFormTemplates from "./DataFormTemplates"
import DataForm from "./DataForm"
//import DataFormSubmissionList from './DataFormSubmissionList'
import * as api from "../../../../constants/api"

const propTypes = {
  auth: PropTypes.object.isRequired,
  jobId: PropTypes.number.isRequired,
  tierId: PropTypes.number.isRequired,
  jobResourceId: PropTypes.number.isRequired,
}

const defaultProps = {
  jobResourceId: null,
  auth: {},
  submittedForms: [],
  templates: [],
}

export default class DataFormSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showForm: false,
      templates: [],
      formData: {},
      submittedForms: [],
      isFetching: false,
      isFetchingTemplates: false,
    }

    this.onTemplateSelected = this.onTemplateSelected.bind(this)
    this.hideForm = this.hideForm.bind(this)
    this.onSubmissionSelected = this.onSubmissionSelected.bind(this)
  }

  componentDidMount() {
    this.getFormTemplates()
    this.getSubmittedForms()
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.resource.JobResourceId !== nextProps.resource.JobResourceId
    ) {
      this.getSubmittedForms(nextProps.resource.JobResourceId)
    }
  }

  onTemplateSelected(formData) {
    this.setState({ formData, showForm: true })
  }

  onSubmissionSelected(submission) {
    const {
      DefaultUISchema,
      JSONSchema,
      ResultData,
      TemplateName,
      FormTemplateId,
    } = submission

    this.setState({
      formData: {
        DefaultUISchema,
        JSONSchema,
        DefaultFormData: ResultData,
        Name: TemplateName,
        IsUpdate: true,
        FormTemplateId,
      },
      showForm: true,
    })
  }

  hideForm() {
    this.setState({ showForm: false, formData: {} })
  }

  getFormTemplates() {
    if (this.state.isFetchingTemplates) {
      return
    }

    this.setState({ isFetchingTemplates: true })

    const url = `${api.JOBS_ROOT}${this.props.jobId}${api.JOB_FORM_TEMPLATES}`
    console.log(`Retrieving form templates: ${url}...`)

    this.props.auth
      .request("get", url)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ templates: response.body.JobForms })
          }
        },
        () => {
          console.log("failed to get job form templates")
        },
      )
      .then(() => {
        this.setState({ isFetchingTemplates: false })
      })
  }

  getSubmittedForms(jobResourceId) {
    if (this.state.isFetching) {
      return
    }

    this.setState({ isFetching: true })

    if (jobResourceId === undefined) {
      jobResourceId = this.props.resource.JobResourceId
    }

    const url = `${api.JOBS_ROOT}${this.props.jobId}${
      api.JOB_FORM_RESULT_ENDPOINT
    }`
    console.log(
      `Retrieving tier#${
        this.props.tierId
      } level resource#${jobResourceId} forms: ${url}...`,
    )

    // if (Object.getOwnPropertyNames(this.props.resource).length !== 0) {  if
    // (jobResourceId === undefined) {    jobResourceId =
    // this.props.resource.JobResourceId  } }

    this.props.auth
      .request("get", url)
      .query({ jobSourcingTierId: this.props.tierId })
      .query({ jobResourceId: jobResourceId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          if (response.body.IsSuccess === true) {
            this.setState({ submittedForms: response.body.JobFormResults })
          } else {
            console.log("failed to get submitted job forms")
          }
        },
        () => {
          console.log("failed to get submitted job forms")
        },
      )
      .then(() => {
        this.setState({ isFetching: false })
      })
  }

  render() {
    const className = "resource-forms"

    if (this.state.isFetchingTemplates) {
      return (
        <div className={className}>
          <Alert bsStyle="info">
            <Icon spin name="spinner" />
            &nbsp;Fetching Templates...
          </Alert>
        </div>
      )
    }

    if (this.state.isFetching) {
      return (
        <div className={className}>
          <Alert bsStyle="info">
            <Icon spin name="spinner" />
            &nbsp;Fetching Submitted Forms...
          </Alert>
        </div>
      )
    }

    return (
      <div className={className}>
        <p class="title-separator"><span>Data Forms</span></p>
        <DataFormTemplates
          templates={this.state.templates}
          submissions={this.state.submittedForms}
          onTemplateSelected={this.onTemplateSelected}
          onSubmissionSelected={this.onSubmissionSelected}
          data={this.props.data}
          auth={this.props.auth}
          flags={this.props.flags}
        />

        {/* Modal to display the data form to work on */
        this.state.showForm && (
          <Modal
            bsSize="large"
            backdrop="static"
            show={this.state.showForm}
            onHide={this.hideForm}
            dialogClassName="data-form-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>{this.state.formData.Name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <DataForm
                formData={this.state.formData}
                finalized={true}
                onCancelClick={this.hideForm}
              />
            </Modal.Body>
          </Modal>
        )}
      </div>
    )
  }
}

DataFormSection.propTypes = propTypes
DataFormSection.defaultProps = defaultProps
