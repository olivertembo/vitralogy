import React from "react"
import PropTypes from "prop-types"
import List from "antd/lib/list"
import Card from "antd/lib/card"
import Tooltip from "antd/lib/tooltip"
import Icon from "react-fa/lib/Icon"

import OverlayButton from "../layout/OverlayButton"
import MomentFormatter from "../MomentFormatter"
import EmptyStateContainer from "../../containers/EmptyStateContainer"
import Utils from "../../utils/Utils"
import * as api from "../../constants/api"

const propTypes = {
  jobReports: PropTypes.array.isRequired,
}

const defaultProps = {
  jobReports: [],
}

export default class JobReports extends React.Component {
  render() {
    const className = "job-reports"
    const placeholder = <span className="placeholder">N/A</span>

    if (
      this.props.jobReports === undefined ||
      this.props.jobReports.length === 0
    ) {
      const msg = (
        <div>
          Job Reports <strong>pending</strong> generation.
        </div>
      )
      return (
        <div className={className}>
          <EmptyStateContainer
            alertStyle="info"
            title={`No reports available!`}
            message={msg}
          />
        </div>
      )
    }

    return (
      <List
        grid={{ gutter: 8, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
        className={className}
        itemLayout="horizontal"
        //loading={this.state.isFetching}
        dataSource={this.props.jobReports}
        renderItem={item => (
          <List.Item key={item.JobReportId}>
            <Card
              //hoverable
              //type="inner"
              title={item.ReportType}
              extra={
                <OverlayButton
                  bsStyle={"link"}
                  glyph=""
                  disabled={false}
                  text={`Click to download ${item.Description}`}
                  onClick={() =>
                    this.props.auth.downloadFile(item.Url, item.FileName)
                  }
                >
                  Download
                </OverlayButton>
              }
            >
              <div className="row">
                <div className="col-md-3">
                  <Tooltip placement="topLeft" title={item.Description}>
                    <Icon
                      name={Utils.getFileTypeIcon(item.FileName)}
                      style={{ fontSize: 75, color: "#08c" }}
                    />
                  </Tooltip>
                </div>
                <div className="col-md-9">
                  <ul className="list-unstyled geo-details">
                    <li>
                      <strong>Generated On&nbsp;: </strong>{" "}
                      <MomentFormatter
                        datetime={item.CreatedOn}
                        formatter="MM/DD/YYYY hh:mm A"
                        timezone={item.TimeZone}
                      />
                    </li>

                    {(this.props.resourceSupportModeId ===
                      api.RESOURCE_SUPPORT_MODE.SINGLE_RESOURCE ||
                      this.props.resourceSupportModeId ===
                        api.RESOURCE_SUPPORT_MODE.MULTI_RESOURCE) && (
                      <li>
                        {item.Resource && (
                          <span>
                            <strong>Resource&nbsp;: </strong>{" "}
                            {item.Resource || placeholder}{" "}
                          </span>
                        )}
                      </li>
                    )}

                    {this.props.flags.IsDataCollectionRequired && (
                      <li>
                        {item.FormTemplate && (
                          <span>
                            <strong>Form Template&nbsp;: </strong>{" "}
                            {item.FormTemplate || placeholder}{" "}
                          </span>
                        )}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    )
  }
}

JobReports.propTypes = propTypes
JobReports.defaultProps = defaultProps
