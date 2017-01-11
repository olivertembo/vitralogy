import React from 'react';
import RequestList from './request-list';
import ReportsFilter from './filter';
import ReportGenerator from './../report-generator/index';
import {Button} from "antd"


export default class Reports extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showGenerateReport: false,
            filter: {
                reportModelId: null, 
                requestedById: null,
                minDate: null,
                maxDate: null,
                includeAutomatedReports: false
            }
        }
    }
    onFilterChange(filter){
        this.setState({filter: {...filter}});
    }
    
    toggleGenerateReport(reportUid){        
        if(reportUid !== null){
            this.refs.requestList.refresh(reportUid);
        }

        this.setState(prev => ({ showGenerateReport: !prev.showGenerateReport }));                
    }
    render(){
        return (
            <div className="col-md-10 col-md-offset-1 reporting-layout" style={{position: 'relative'}}>
                <div style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                    <ReportsFilter style={{width: '85%'}} onChange={this.onFilterChange.bind(this)}></ReportsFilter>                      
                    <Button type="primary" style={{marginLeft: 'auto', marginBottom: 15, marginTop: 'auto'}} onClick={this.toggleGenerateReport.bind(this, null)}>Generate report</Button>
                </div>
                <RequestList ref="requestList" key="requests_list" filter={this.state.filter} auth={this.props.auth}></RequestList>                   
                <ReportGenerator auth={this.props.auth} visible={this.state.showGenerateReport} onHide={this.toggleGenerateReport.bind(this)}/>                 
            </div>
        )
    }
}