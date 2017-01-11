import React from 'react';
import LookupService from '../../../utils/lookup-service';
import { Select, DatePicker, Checkbox } from 'antd';
import { camelizeKeys } from "humps";
import {getReports} from '../../../utils/reporting-client';


const { Option } = Select;
const SYSTEM_USER_ID = 1;
export default class ReportsFilter extends React.Component{
    constructor(props){
        super(props);
        this.state={
            reportModels: [],
            userAccounts: [],
            filter: {
                reportModelId: null, 
                requestedById: null,
                minDate: null,
                maxDate: null,
                includeAutomatedReports: false
            }
        }
    }

    componentDidMount(){        
        getReports().then(reportModels => {
            this.setState({reportModels: camelizeKeys(reportModels)});
        }).catch(_ => {
            console.error("Unable to retrieve the report models!");
        });

        LookupService.getUserAccounts(false).then(userAccounts => {
            userAccounts.splice(0, 0, {id: SYSTEM_USER_ID, name: '--system--'});
            this.setState({userAccounts: userAccounts});
        }).catch(_ => {
            console.error("Unable to retrieve the user accounts!");
        });
    }

    onReportModelChange(reportModelId){
        this.props.onChange({...this.state.filter, reportModelId: reportModelId });
        this.setState(prev => (
            {   
                filter: {
                    ...prev.filter, 
                    reportModelId: reportModelId
                }
            }));            
    }

    onRequestedByChange(requestedById){       
        let includeAutomatedReports = requestedById === SYSTEM_USER_ID ? true : this.state.filter.includeAutomatedReports
        this.props.onChange({...this.state.filter, requestedById: requestedById, includeAutomatedReports: includeAutomatedReports });
        this.setState(prev => (
            {   
                filter: {
                    ...prev.filter, 
                    requestedById: requestedById,
                    includeAutomatedReports: includeAutomatedReports 
                }
            }));        
    }

    onMinDateChange(date, dateString){
        dateString = dateString === "" ? null : dateString;
        this.props.onChange({...this.state.filter, minDate: dateString });
        this.setState(prev => (
            {   
                filter: {
                    ...prev.filter, 
                    minDate: dateString 
                }
            }));
    }

    onMaxDateChange(date, dateString){
        dateString = dateString === "" ? null : dateString;
        this.props.onChange({...this.state.filter, maxDate: dateString });
        this.setState(prev => (
            {   
                filter: {
                    ...prev.filter, 
                    maxDate: dateString 
                }
            }));
    }
    onIncludeAutomatedReports(onChangeEvent){
        let isChecked = onChangeEvent.target.checked;
        let requestedById = !isChecked && this.state.filter.requestedById === SYSTEM_USER_ID ? null : this.state.filter.requestedById;
        this.props.onChange({...this.state.filter, includeAutomatedReports: isChecked, requestedById: requestedById  });
        this.setState(prev => (
            {   
                filter: {
                    ...prev.filter, 
                    includeAutomatedReports: isChecked,
                    requestedById: requestedById 
                }
            }));
    }
    render(){
        const {includeAutomatedReports, requestedById} = this.state.filter;
        
        const userAccountOptions = this.state.userAccounts.map(ua => <Option key={`ua_${ua.id}`} value={ua.id}>{ua.name}</Option>);
        const reportModelOptions = this.state.reportModels.map(rm => <Option key={`rm_${rm.reportModelId}`} value={rm.reportModelId}>{rm.name}</Option>);
        return (
            <div className="requests-filter">               
                <div className="filter-item report-model">
                    <label>Report</label> 
                    <Select className="value-selector" onChange={this.onReportModelChange.bind(this)} allowClear={true}>{reportModelOptions}</Select>         
                </div>
                <div className="filter-item req-by">
                    <label>Requested by</label> 
                    <Select className="value-selector" onChange={this.onRequestedByChange.bind(this)} allowClear={true} value={requestedById}>{userAccountOptions}</Select>  
                </div>
                <div className="filter-item start-date">
                    <label>Start Date</label> 
                    <DatePicker className="value-selector" onChange={this.onMinDateChange.bind(this)} format="MM/DD/YYYY"></DatePicker>  
                </div>
                <div className="filter-item end-date">
                    <label>End Date</label> 
                    <DatePicker className="value-selector" onChange={this.onMaxDateChange.bind(this)} format="MM/DD/YYYY"></DatePicker>                                                                             
                </div>
                <div className="filter-item automated-reports" >                    
                    <Checkbox onChange={this.onIncludeAutomatedReports.bind(this)} checked={includeAutomatedReports}> Include Automated Reports</Checkbox> 
                </div>
                
            </div>
        )
    }
}