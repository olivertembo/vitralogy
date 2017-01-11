import React from "react"
import PropTypes from "prop-types"
import Tree from "antd/lib/tree"
import Icon from "react-fa/lib/Icon"
import { getAssetTypesDetails } from "./CustomerDashboard"

import * as api from "../../constants/api"

import { Scrollbars } from "react-custom-scrollbars"

import {ReactComponent as SiteIcon} from "../../assets/icons/brand/site.svg";
import {ReactComponent as OptionIcon} from "../../assets/icons/brand/option-icon.svg";
import {ReactComponent as PushMenuRight } from "../../assets/icons/brand/push-menu.svg"
const { TreeNode } = Tree

// const propTypes = {
//   config: PropTypes.object.isRequired,
//   onFiltersApplied: PropTypes.func.isRequired,
//   dashboardFilter: PropTypes.array.isRequired,
// }

// const defaultProps = {
//   config: {},
// }

export default class DashboardFilter extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      siteTreeSelectedKeys: (this.props.dashboardFilter[0] && [`{"Type": ${api.DASHBOARD_TREE_NODE.SITE}, "Site": ${this.props.dashboardFilter[0].SiteId.toString()}}` ]) || [],
      isPortfolioSelected: false
    }
  }
  render() {
    const { config, onFiltersApplied, dashboardFilter, toggleOverview } = this.props;
    
    const onPortfolioClick = () => {
      let activeNode = {
        type: api.DASHBOARD_TREE_NODE.PORTFOLIO,
        label: 'Portfolio',
        dashboardSelected: "",
        dashboardsAvailable: []
      }

      const newconfig = Object.assign({}, config, {
        activeNode
      });
      this.setState({siteTreeSelectedKeys: [], isPortfolioSelected: true });
      onFiltersApplied(newconfig);
    }

    const onSelect = selectedKeys => {
      if (selectedKeys.length > 0) {
        this.setState({siteTreeSelectedKeys: selectedKeys, isPortfolioSelected: false});
        const node = JSON.parse(selectedKeys)
        const site = dashboardFilter.find(s => {
          return s.SiteId === node.Site
        })
        

        let activeNode = {
          value: site.SiteId,
          label: site.SiteName,
          type: node.Type,
          dashboardSelected:
            site.Dashboards.length > 0 ? site.Dashboards[0].toString() : "",
          dashboardsAvailable: site.Dashboards,
          activeSite: {
            value: site.SiteId,
            label: site.SiteName,
            assetTypesDetails: getAssetTypesDetails(site)
          },
        }

        if (node.AssetType !== undefined) {
          const assetType = site.AssetTypes.find(t => {
            return t.AssetTypeId === node.AssetType
          })

          activeNode = {
            value: node.AssetType,
            label: assetType.AssetTypeName,
            type: node.Type,
            dashboardSelected:
              assetType.Dashboards.length > 0
                ? assetType.Dashboards[0].toString()
                : "",
            dashboardsAvailable: assetType.Dashboards,
            activeSite: {
              value: site.SiteId,
              label: site.SiteName,
            },
          }

          if (node.Asset !== undefined) {
            //console.log("Asset", node.Asset)
            const asset = assetType.Assets.find(a => {
              return a.AssetId === node.Asset
            })

            activeNode = {
              value: node.Asset,
              label: asset.AssetName,
              type: node.Type,
              dashboardSelected:
                asset.Dashboards.length > 0 ? asset.Dashboards[0].toString() : "",
              dashboardsAvailable: asset.Dashboards,
              activeSite: {
                value: site.SiteId,
                label: site.SiteName,
              },
            }
          }
        }

        const newconfig = Object.assign({}, config, {
          activeNode,
        })
        onFiltersApplied(newconfig)
      } else {
        let activeNode = {}
        const newconfig = Object.assign({}, config, {
          activeNode,
        })
        onFiltersApplied(newconfig)
      }
    }

    const treeData = dashboardFilter.map(s => {
      let data = (
        <TreeNode        
          key={`{"Type": ${api.DASHBOARD_TREE_NODE.SITE}, "Site": ${s.SiteId}}`}
          icon={<SiteIcon className="site-icon"/>}
          title={s.SiteName}
        />
      )

      if (s.AssetTypes.length > 0) {
        const assetTypes = s.AssetTypes
        let assetType = assetTypes.map(t => {
          let resourceType = (
            <TreeNode
              icon={
                <Icon
                  name={t.AssetTypeId === 1 ? "envira" : "cube"}
                  style={{ color: "#32CD32" }}
                />
              }
              title={t.AssetTypeName}
              key={`{"Type": ${api.DASHBOARD_TREE_NODE.ASSET_TYPE}, "Site": ${
                s.SiteId
              }, "AssetType": ${t.AssetTypeId}}`}
            />
          )

          if (assetTypes.length > 0) {
            const assets = t.Assets
            const asset = assets.map(a => {
              return (
                <TreeNode className="asset-node"
                  icon={<OptionIcon className="node-icon"/>}
                  title={a.AssetName}
                  key={`{"Type": ${api.DASHBOARD_TREE_NODE.ASSET}, "Site": ${
                    s.SiteId
                  }, "AssetType": ${t.AssetTypeId}, "Asset": ${a.AssetId}}`}
                  isLeaf={true}               
                />
              )
            })

            resourceType = (
              <TreeNode className="asset-type-node"
                icon={<OptionIcon className="node-icon"/>}
                title={`${t.AssetTypeName} - (${t.Assets.length})`}
                key={`{"Type": ${api.DASHBOARD_TREE_NODE.ASSET_TYPE}, "Site": ${
                  s.SiteId
                }, "AssetType": ${t.AssetTypeId}}`}
                switcherIcon={<Icon name="angle-down" />}
              >
                {asset}
              </TreeNode>
            )
          }

          return resourceType
        })

        data = (
          <TreeNode className="site-node"
            key={`{"Type": ${api.DASHBOARD_TREE_NODE.SITE}, "Site": ${s.SiteId}}`}
            icon={<SiteIcon className="node-icon"/>}
            title={s.SiteName}
            switcherIcon={<Icon name="angle-down" />}
          >
            {assetType}
          </TreeNode>
        )
      }

      return data
    })

    const defaultExpandedKeys = dashboardFilter.map(s => {
      return `{"Type": ${
        api.DASHBOARD_TREE_NODE.SITE
      }, "Site": ${s.SiteId.toString()}}`
    })

    return (
      <div className="sidebar-layout__sidebar">      
        <PushMenuRight className="toggle-icon" onClick={toggleOverview}/>
        <section className="section-title">
          <div className="container-fluid">
            <a className={ this.state.isPortfolioSelected ? 'selected' : ''} onClick={onPortfolioClick}><span>Portfolio</span></a>
          </div>
        </section>
      
        <section className="section-overview">
          <Scrollbars           
          autoHeightMin="100%">
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12">
                <div className="dashboard-filter__content">
                  <Tree
                    showLine
                    showIcon
                    defaultExpandedKeys={defaultExpandedKeys}
                    defaultSelectedKeys={(dashboardFilter[0] && [
                      `{"Type": ${
                      api.DASHBOARD_TREE_NODE.SITE
                      }, "Site": ${dashboardFilter[0].SiteId.toString()}}`,
                    ]) || []}
                    onSelect={onSelect}
                    selectedKeys={this.state.siteTreeSelectedKeys}
                    className="hide-file-icon"
                  >
                    {treeData}
                  </Tree>
                </div>
              </div>
            </div>
          </div>
          </Scrollbars>
        </section>
      
      </div>
    )
  }
}

// DashboardFilter.propTypes = propTypes
// DashboardFilter.defaultProps = defaultProps

//export default DashboardFilter
