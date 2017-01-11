import React from 'react';
import Reports from './reports/index';

export default class Reporting extends React.Component{
    constructor(props){
        super(props);
        //new ReportingNotifier(this.onReportReady).subscribe();
    }
    onReportReady(reports){
        console.log(`New reports are ready: ${JSON.stringify(reports)}`);
    }
    render(){
        return (<>
            <Reports auth={this.props.auth}></Reports>           
        </>)
    }
}