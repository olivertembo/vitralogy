import _ from 'lodash';
import React from "react";
import { camelizeKeys } from "humps";
import { Table, Modal, Button } from "antd";
import FormDataViewerClient from "../../../../utils/dashboard/form-data-viewer-client";

const columns = [{
        title: 'Job SchedOn',
        dataIndex: 'jobScheduledOn',
        key: 'jobScheduledOn',
        width: 50
    }, {
        title: 'Job SchedAt',
        dataIndex: 'jobScheduledAt',
        key: 'jobScheduledAt',
        width: 50
    },{
        title: 'Submitted by',
        dataIndex: 'submittedBy',
        key: 'submittedBy',
        width: 70
    },{
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        width: 250,
        ellipsis: true
    }];

export default class HistoricalValues extends React.Component{
    constructor(props){
        super(props);                                   
        this.state={           
            data: [],
            loading: false
        }
    }

  
    componentDidMount(){
      
    }

    componentDidUpdate(prevProps){       
        if(_.isEqual(prevProps, this.props)) return;

        if(this.props.measurementIds === null || this.props.measurementIds.length <= 0) return;
      
        this.setState({loading: true});
        FormDataViewerClient.getHistoricalValues(this.props.accountSiteId, this.props.measurementIds, this.props.measurementUid, [this.props.dateMin, this.props.dateMax])
        .then(values => {
            this.setState({
                data: camelizeKeys(values)                
            })
        }).finally(() => this.setState({loading: false}))
    }

    render(){        
        return (  
            <Modal width={"70%"} centered={true}
                title={`${this.props.title} (${this.props.dateMin} - ${this.props.dateMax})`} 
                visible={this.props.visible}  
                onOk={this.props.onHide}
                onCancel={this.props.onHide}
                footer={[
                    <Button type="primary" key={this.props.title} onClick={this.props.onHide}>Close</Button>
                ]}>                   
                    <Table rowKey={record => record.id} size="small" pagination={false} scroll={{y: 400}} 
                        columns={columns} 
                        loading={this.state.loading} 
                        dataSource={this.state.data} />            
            </Modal>        
        )
    }
}