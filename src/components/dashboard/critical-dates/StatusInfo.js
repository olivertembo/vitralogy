import React, { useEffect, useState } from "react"
import * as api from "../../../constants/api"
import {Spin} from 'antd'
import {ReactComponent as InfoIcon} from '../../../assets/icons/brand/info-icon-24x24.svg'
const StatusInfoPopoverContent = props => {
    const [statusInfo, setStatusInfo] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    useEffect(() => {
        if(!props.config) return;
        function getStatusInfo() {
            setLoading(true);
            var statusUrl = `${api.CUSTOMER_API_ROOT}compliance/status-info/${props.customerComplianceOptionId}/${props.customerComplianceOptionAssetId ? props.customerComplianceOptionAssetId : ''}`;            
            props.config.auth
            .request("get", statusUrl)
            .then(response => {
                if(response.ok && response.body.IsSuccess) 
                    setStatusInfo(response.body.Status);
                else
                    setHasError(true);
                setLoading(false);
            }, (reason) => {
                setLoading(false);
                setHasError(true);
            });          
        }
        getStatusInfo();
    }, [props.customerComplianceOptionId, props.customerComplianceOptionAssetId])

    return <Spin size="small" spinning={isLoading} tip="Loading status...">
                <div className="status-popover__content">
                {!isLoading && hasError && <p style={{color: 'red'}}>Unable to get the status!</p> }
                {!isLoading && !hasError &&  statusInfo && 
                    <div style={{background: (statusInfo.IsActiveJobStatus ? 'rgb(92, 184, 92)' : '#ffb000') }} className="status-info">
                        <InfoIcon className="icon"/>
                        <div className="status">
                            <span className="status__value">{statusInfo.Status}</span>
                            <span className="status_label">Status</span>
                        </div>
                    </div>
                }
                {!isLoading && !hasError && (
                        (statusInfo && statusInfo.IsActiveJobStatus && <>
                        <div className="status-property" >
                                <span className="status-property__value">{statusInfo.JobActive && statusInfo.JobActive.LastProjectCompletedOn ? statusInfo.JobActive.LastProjectCompletedOn : 'never'}</span>
                                <span className="status-property__label">Last Project Completed</span> 
                            </div>
                            <div className="status-property">
                                <span className="status-property__value">{statusInfo.JobActive && statusInfo.JobActive.NextActiveProjectOn ? statusInfo.JobActive.NextActiveProjectOn : 'never'}</span>
                                <span className="status-property__label">Next Active Project</span> 
                            </div>                        
                        </>) ||
                        (statusInfo && !statusInfo.IsActiveJobStatus && !statusInfo.IsContainerAsset && <>
                            <div className="status-property">
                                <span className="status-property__value">{statusInfo.JobPending && statusInfo.JobPending.LastTimePerformed ? statusInfo.JobPending.LastTimePerformed : ''}</span>
                                <span className="status-property__label">Last Time Performed</span> 
                            </div>
                            <div className="status-property">
                                <span className="status-property__value">{statusInfo.JobPending ? (statusInfo.JobPending.IsLastProcessInProgress ? 'YES'  : 'NO') : ''}</span>
                                <span className="status-property__label">Last Process still in Progress</span> 
                            </div>                        
                        </>) 
                    )      
                }  
                </div>                                                      
            </Spin>
        
   
}
export default StatusInfoPopoverContent