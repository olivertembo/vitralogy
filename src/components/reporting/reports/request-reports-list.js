import React from "react"
import 'antd/dist/antd.css';
import { Table } from "antd";

import { ReportsClient } from '../../../utils/reporting-client';
import  { RequestReportsTableSetup } from './request-reports-table-setup';

export default class RequestReportsList extends React.Component
{        
    constructor(props){
        super(props);        
        this.state = {                      
            reports: [],
            loading: false                        
        }
    }

    componentDidMount(){        
        this.loadReports();                 
    }  

    loadReports(){
        this.setState({loading: true })
        ReportsClient.getRequestReports(this.props.requestUid)
            .then(data => {               
                this.setState({
                    reports: data.map(report => ({...report, workEmail: this.props.workEmail}))
                });
            }).finally(() => this.setState({loading: false }));
    }
    
    refresh(){
        this.loadReports();  
    }

    render(){
        
        return (<>
         <Table showHeader={false} rowKey={report => `rpt_${report.reportUid}`} size="middle" 
                pagination={false}                             
                columns={RequestReportsTableSetup.Columns} 
                loading={this.state.loading}                 
                dataSource={this.state.reports} /> 
        </>)
    }
}