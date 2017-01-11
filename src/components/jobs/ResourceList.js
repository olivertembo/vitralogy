import React, { Component, PropTypes } from "react"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"

class ResourceList extends Component {
  render() {
    const { title, resources, onSelectResource } = this.props
    const options = {
      sizePerPage: 5,
      hideSizePerPage: true,
      onRowClick: onSelectResource,
    }

    return (
      <div className="resource-list">
        <h3>{title}</h3>
        <div>
          <BootstrapTable data={resources} options={options} pagination>
            <TableHeaderColumn dataField="JobResourceId" isKey={true}>
              Resource ID
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="Name"
              filter={{ type: "TextFilter", delay: 1000 }}
            >
              Name
            </TableHeaderColumn>
            <TableHeaderColumn dataField="Type">Type</TableHeaderColumn>
            <TableHeaderColumn dataField="Make">Make</TableHeaderColumn>
            <TableHeaderColumn dataField="Model">Model</TableHeaderColumn>
            <TableHeaderColumn dataField="SN">Serial #</TableHeaderColumn>
          </BootstrapTable>
        </div>
      </div>
    )
  }
}

ResourceList.propTypes = {
  resources: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
}

export default ResourceList
