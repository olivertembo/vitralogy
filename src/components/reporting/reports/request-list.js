import React from "react"
import { camelizeKeys } from "humps";
import 'antd/dist/antd.css';
import { Table } from "antd";
import _ from 'lodash';

import { ReportsClient } from '../../../utils/reporting-client';
import  { RequestsTableSetup } from './request-table-setup';
import  RequestReportsList from './request-reports-list';

export default class RequestList extends React.Component
{    
    
    constructor(props){
        super(props);        
        this.state = {      
            currentPage: 1,    
            workEmail: null,
            requestPage: {
                count: 0,
                requests: [],
                loading: false
            }            
        }
    }

    componentDidMount(){        
        this.loadRequestsPage(0, RequestsTableSetup.DefaultPageSize, true);                 
    }

    componentDidUpdate(prevProps){
        if(_.isEqual(prevProps.filter, this.props.filter)) return;           
        this.loadRequestsPage(0, RequestsTableSetup.DefaultPageSize, true);           
    }

    loadRequestsPage(skip, take, moveToFistPage){
        if(moveToFistPage) this.setState({currentPage: 1});     
        this.setState(prevState => ({requestPage: {...prevState.requestPage, loading: true }}));
        ReportsClient.getPagedRequests({...this.props.filter, skip: skip, take: take })
            .then(data => {
                var pagedRequests = camelizeKeys(data);
                this.setState(prevState => ({
                    requestPage: {
                        ...prevState.requestPage, 
                        count: pagedRequests.count, 
                        requests: pagedRequests.requests 
                    }
                }));
            }).finally(() => this.setState(prevState => ({requestPage: {...prevState.requestPage, loading: false }})));
    }

    onPageChange(page, pageSize){
        this.setState({currentPage: page});
        this.loadRequestsPage((page - 1) * pageSize, pageSize, false);         
    }

    onPageSizeChange(current, size){}

    refresh(newReportUid){        
        this.loadRequestsPage(0, RequestsTableSetup.DefaultPageSize, true);  
    }
    
    render(){
        const isExpandable = (record) => (record.status === 'Failed' && record.reportsCount > 1) || (record.status === 'Done' &&  !(record.reportsCount === 1 || record.reportId !== null || record.reportName !== null));
        const getRowClassName = (record) => !isExpandable(record) ? 'non-expandable-row' : '';
        const rowDetails = (record, index, indent, expanded) =>  isExpandable(record) && 
            <RequestReportsList workEmail={record.workEmail} requestUid={record.requestUid}></RequestReportsList>;
        
        return (<>                
         <Table className="requests" rowClassName={getRowClassName}  rowKey={request => `rq_${request.requestUid}`} size="middle" 
                pagination={{
                    ...RequestsTableSetup.getPagination(this.onPageChange.bind(this), this.onPageSizeChange.bind(this), this.state.requestPage.count), 
                    current: this.state.currentPage
                }} 
                scroll={{y: 'calc(100vh - 250px)'}}                
                columns={RequestsTableSetup.Columns} 
                expandedRowRender={rowDetails}
                loading={this.state.requestPage.loading}                 
                dataSource={this.state.requestPage.requests} /> 
        </>)
    }
}