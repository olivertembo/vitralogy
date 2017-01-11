import React, { PropTypes } from "react"
import ResourceList from "../components/jobs/ResourceList"

const ResourceContainer = ({ resources, onSelectResource }) => (
  <ResourceList
    title="Site Resources"
    resources={resources}
    onSelectResource={resource => onSelectResource(resource)}
  />
)

ResourceContainer.propTypes = {
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      ResourceTypeId: PropTypes.number.isRequired,
      ResourceType: PropTypes.string,
      JobResourceId: PropTypes.number.isRequired,
      IsActive: PropTypes.bool,
      Name: PropTypes.string.isRequired,
      Make: PropTypes.string.isRequired,
      Model: PropTypes.string.isRequired,
      SN: PropTypes.string.isRequired,
      Description: PropTypes.string.isRequired,
      PhotoCount: PropTypes.number,
      DocumentCount: PropTypes.number,
      FormCount: PropTypes.number,
      ConclusionCount: PropTypes.number,
    }),
  ).isRequired,
}

export default ResourceContainer
