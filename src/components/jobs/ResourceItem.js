import React from "react"
import PropTypes from "prop-types"

import ResourceDocumentTable from "./resources/ResourceDocumentTable"
import ResourcePicturesTable from "./resources/ResourcePicturesTable"
import CheckListContainer from "../../containers/CheckListContainer"
import CorrectiveAction from "./resources/CorrectiveAction"
import CorrectiveActionDocuments from "./resources/CorrectiveActionDocuments"
import ResourceConclusionForm from "./resources/ResourceConclusionForm"
import DataFormSection from "./resources/forms/DataFormSection"
import * as api from "../../constants/api"

import Button from "react-bootstrap/lib/Button"
import { ReactComponent as PensilIcon } from "../../assets/icons/brand/pencil.svg"


const propTypes = {
  resource: PropTypes.object,
  auth: PropTypes.object,
  jobId: PropTypes.number,
  tierId: PropTypes.number,
  flags: PropTypes.object,
}

const defaultProps = {
  resource: {},
  auth: {},
  flags: {},
}

const TABS_ALIASES = {
  details: 'details',
  checklist: 'checklist',
  dataForms: 'dataForms',
  photos: 'photos',
  documents: 'documents',
  action: 'action',
  supportingDocuments: 'supportingDocuments',
  result: 'result',
}


export default class ResourceItem extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      activeTab: ''
    }
  }

  handleTabChange = tabAlias => e => {
    this.setState({
      activeTab: tabAlias
    })
  }
  render() {
    const placeholder = <span className="placeholder">N/A</span>
    const { resource, flags, resourceFilter } = this.props
    const { activeTab } = this.state

    if (resource === null) {
      return <div />
    }

    const TABS_MAP = [
      {
        name: 'Details',
        alias: TABS_ALIASES.details,
        showCondition: resource.JobResourceId != null && resource.JobResourceId !== 0
      }, {
        name: 'Checklist',
        alias: TABS_ALIASES.checklist,
        showCondition: flags.IsCheckList
      }, {
        name: 'Data Forms',
        alias: TABS_ALIASES.dataForms,
        showCondition: flags.IsAnyForm
      }, {
        name: 'Photos',
        alias: TABS_ALIASES.photos,
        showCondition: true
      }, {
        name: 'Documents',
        alias: TABS_ALIASES.documents,
        showCondition: true
      }, {
        name: 'Corrective Action',
        alias: TABS_ALIASES.action,
        showCondition: flags.IsCorrectiveAction
      }, {
        name: 'Supporting Documents',
        alias: TABS_ALIASES.supportingDocuments,
        showCondition: flags.IsCorrectiveAction
      }, {
        name: 'Result',
        alias: TABS_ALIASES.result,
        showCondition: true
      }
    ]

    if (!activeTab) {
      this.setState({
        activeTab: TABS_MAP.find(tab => tab.showCondition).alias
      })
    }

    return (
      <div>
        <div className="job-tabs sub-tabs">
          {TABS_MAP.map(tab => {
            return tab.showCondition && <Button
                bsClass="tab-label"
                className={activeTab === tab.alias && 'active'}
                onClick={this.handleTabChange(tab.alias)}
              >{tab.name} <PensilIcon/></Button>
          })}
        </div>
        <div className="tab-body">
          {activeTab === TABS_ALIASES.details && <section className="tabSection">
            {resourceFilter}
            <p class="title-separator"><span>Details</span></p>
            <ul className="list-blocks">
              <li>
                <strong>{resource.Name}</strong>
                <span>Name</span>
              </li>
              <li>
                <strong>{resource.ResourceType != null &&
                  resource.ResourceType.length > 0
                    ? resource.ResourceType
                    : placeholder}
                </strong>
                <span>Type</span>
              </li>
              <li>
                <strong>
                  {resource.Make != null && resource.Make.length > 0
                    ? resource.Make
                    : placeholder}
                </strong>
                <span>Make</span>
              </li>
              <li>
                <strong>
                  {resource.Model != null && resource.Model.length > 0
                    ? resource.Model
                    : placeholder}
                </strong>
                <span>Model</span>
              </li>
              <li>
                <strong>
                  {resource.SN != null && resource.SN.length > 0
                    ? resource.SN
                    : placeholder}
                </strong>
                <span>Serial #</span>
              </li>
              <li>
                <strong>
                  {resource.Description != null &&
                    resource.Description.length > 0
                      ? resource.Description
                      : placeholder}
                </strong>
                <span>Description</span>
              </li>
            </ul>
          </section>}
          {activeTab === TABS_ALIASES.checklist && <section className="tabSection">
            <CheckListContainer
              {...this.props}
              jobResourceId={resource.JobResourceId}
              getType={api.CheckListTypeEnum.JOB_CHECKLIST_ONLY}
            />
          </section>}
          {activeTab === TABS_ALIASES.dataForms && <section className="tabSection">
            <DataFormSection
              {...this.props}
              jobResourceId={resource.JobResourceId}
            />
          </section>}
          {activeTab === TABS_ALIASES.photos && <section className="tabSection">
            <ResourcePicturesTable
              {...this.props}
              jobResourceId={resource.JobResourceId}
              visible={this.props.panelOpen}
            />
          </section>}
          {activeTab === TABS_ALIASES.documents && <section className="tabSection">
            <ResourceDocumentTable
              {...this.props}
              jobResourceId={resource.JobResourceId}
            />
          </section>}
          {activeTab === TABS_ALIASES.action && <section className="tabSection">
            <CorrectiveAction
              {...this.props}
              jobResourceId={resource.JobResourceId}
            />
          </section>}
          {activeTab === TABS_ALIASES.supportingDocuments && <section className="tabSection">
            <CorrectiveActionDocuments
              {...this.props}
              jobResourceId={resource.JobResourceId}
            />
          </section>}
          {activeTab === TABS_ALIASES.result && <section className="tabSection">
            <ResourceConclusionForm
              {...this.props}
              updateSignOff={this.props.updateSignOff}
              jobResourceId={resource.JobResourceId}
            />
          </section>}

        </div>
      </div>
    )
  }
}

ResourceItem.propTypes = propTypes
ResourceItem.defaultProps = defaultProps
