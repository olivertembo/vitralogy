import React from 'react';
import {  Badge, Tag,Icon, Popover } from "antd";
import ReportActions from './item-actions';
import 'antd/dist/antd.css';

export class RequestReportsTableSetup {
    
    static Columns = [{
        title: 'Report name',
        dataIndex: 'reportName',
        key: 'reportName',
        width: 250,
        ellipsis: true,
        sorter: false,
        render: (text, record, index) => {
        const details = record.infos.map((info, index) => <div key={`info_${record.reportUid}_i${index}`}><span>{info.name}:</span><span style={{marginLeft: 5, fontWeight: 'bold'}}>{info.value}</span></div>);
            return <>
                    <Popover key={`info_po_${record.reportUid}`} placement="right" content={details} title="Report details">
                        <Icon key={`info_${record.reportUid}`} type="info-circle" style={{color: '#2590b0', marginRight: 5}}/>
                    </Popover>
                    <strong>{record.reportName || record.reportModelName}</strong>
                </>
        }
    },{
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 50,
        align: 'center',
        render: (text, record, index) => {             
            switch( record.status){
                case 'Done': return <Tag color="green">{record.status}</Tag>;
                case 'Pending': return <Tag color="blue"><Badge status="processing" /> {record.status}</Tag>;
                case'Failed': return <Tag color="red">{record.status}</Tag>;
                default: return record.status;
            }                               
        }                
    }, {
        title: 'Requested by',        
        key: 'requestedBy',
        width: 80
       
    },{
        title: 'Requested On',      
        key: 'requestedOn',
        width: 80,
        sorter: false
    },{
        title: '',
        dataIndex: '',
        key: 'actions',
        width: 150,
        render: (text, record, index) => {
            let payload = {
                preview: record.reportId ? true : false,
                download: record.status === 'Done',
                downloadFileName: record.reportName,
                emailMe: record.status === 'Done',
                share: record.status === 'Done',
                requestUid: record.requestUid,
                reportUid: record.reportUid,
                reportId: record.reportId,
                workEmail: record.workEmail,
                buttonsTheme: "default"     
            }
            return record.reportId !== null && <ReportActions {...payload}/>;                      
        }
    }
    ];       
}

