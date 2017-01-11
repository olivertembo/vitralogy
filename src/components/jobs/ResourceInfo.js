import React, { Component } from "react"
import { Tab, Tabs, TabList, TabPanel } from "react-tabs"

import ResourceDataCollectionTable from "./resources/ResourceDataCollectionTable"
import ResourceDocumentTable from "./resources/ResourceDocumentTable"
import ResourcePicturesTable from "./resources/ResourcePicturesTable"
import ResourceConclusionForm from "./resources/ResourceConclusionForm"
import CorrectiveActionTable from "./CorrectiveActionTable"

class ResourceInfo extends Component {
  constructor() {
    super()

    this.handleSelectTab = this.handleSelectTab.bind(this)
  }

  handleSelectTab() {
    console.log("in handle select tab")
  }

  render() {
    const { resourceId } = this.props.match.params

    return (
      <div className="resource-info">
        <div>resource info for id {resourceId}</div>
        <Tabs onSelect={this.handleSelectTab}>
          <TabList>
            <Tab>Data Forms</Tab>
            <Tab>Photos</Tab>
            <Tab>Documents</Tab>
            <Tab>Corrective Action</Tab>
            <Tab>Conclusion</Tab>
          </TabList>
          <TabPanel>
            <ResourceDataCollectionTable
              auth={this.props.auth}
              id={resourceId}
              jobId={this.props.jobId}
            />
          </TabPanel>
          <TabPanel>
            <ResourcePicturesTable
              auth={this.props.auth}
              id={resourceId}
              jobId={this.props.jobId}
              resourceId={resourceId}
            />
          </TabPanel>
          <TabPanel>
            <ResourceDocumentTable
              auth={this.props.auth}
              resourceId={resourceId}
              jobId={this.props.jobId}
            />
          </TabPanel>
          <TabPanel>
            <CorrectiveActionTable
              auth={this.props.auth}
              resourceId={resourceId}
              jobId={this.props.jobId}
              tierId={0}
            />
          </TabPanel>
          <TabPanel>
            <ResourceConclusionForm
              auth={this.props.auth}
              id={resourceId}
              jobId={this.props.jobId}
            />
          </TabPanel>
        </Tabs>
      </div>
    )
  }
}

export default ResourceInfo
