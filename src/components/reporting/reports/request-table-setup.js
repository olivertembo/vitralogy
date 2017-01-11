import React from 'react';
import {  Badge, Tag,Icon, Popover } from "antd";
import ReportActions from './item-actions';
import 'antd/dist/antd.css';

export class RequestsTableSetup {
    
    static Columns = [{
        title: 'Report',
        dataIndex: 'reportModelName',
        key: 'reportModelName',
        width: 250,
        ellipsis: true,
        sorter: false,
        render: (text, record, index) => {
        const details = record.infos.map((info, index) => <div key={`info_${record.reportUid}_i${index}`}><span>{info.name}:</span><span style={{marginLeft: 5, fontWeight: 'bold'}}>{info.value}</span></div>);
            return <>
                    <Popover key={`info_po_${record.reportUid}`} placement="right" content={details} title="Report details">
                        <Icon key={`info_${record.reportUid}`} type="info-circle" style={{color: '#2590b0', marginRight: 5}}/>
                    </Popover>
                    <strong>{text}</strong>
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
        dataIndex: 'requestedBy',
        key: 'requestedBy',
        width: 80
       
    },{
        title: 'Requested On',
        dataIndex: 'requestedOn',
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
                preview: record.status === 'Done' && record.reportsCount === 1 && record.reportId && record.reportName,
                download: record.status === 'Done' && record.reportsCount === 1 && record.reportId && record.reportName,
                downloadFileName: record.reportName,
                emailMe: record.status === 'Done',
                share: record.status === 'Done',
                requestUid: record.requestUid,
                reportId: record.reportId,                
                workEmail: record.workEmail,
                buttonsTheme: "primary"  
            }
            return record.reportsCount > 0  && <ReportActions {...payload}/>;                       
        }
    }
    ];
    
    static DefaultPageSize = 20;
    static getPagination(onPageChange, onPageSizeChange, total) {
        return {
            defaultCurrent: 1,
            hideOnSinglePage: false,
            pageSize: this.DefaultPageSize,
            pageSizeOptions: ['20', '50', '100'],
            size: 'small',
            showTotal: (total, range) => `${range[0]} - ${range[1]} out of ${total}`,
            total: total,
            onChange: (page, pageSize) => onPageChange(page, pageSize),
            onShowSizeChange: (current, size) => onPageSizeChange(current, size),
            showSizeChanger: false
        };
    }
}

