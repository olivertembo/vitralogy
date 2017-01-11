import React, {useState} from 'react';
import { Button, Popover, Input, Tag } from "antd";
import { ReportsClient } from '../../../utils/reporting-client';
import ToastHelper from "../../../utils/ToastHelper"
import { saveAs } from "file-saver"
import _ from 'lodash';
const { TextArea } = Input;
const emptyOrEmailRegexStandardRFC5322 = /^$|^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
export default function ReportActions(props){
    const [sendingToWorkEmail, setSendingToWorkEmail] = useState(false);
    const [isSendEmailVisible, setSendEmailVisible] = useState(false);
    const [isShareVisible, setShareVisible] = useState(false);
    const [sharingReport, setSharingReport] = useState(false);
    const [emailList, setEmailList] = useState(defaultEmailList);
    const [wrongEmails, setWrongEmails] = useState([]);
    const [downloading, setDownloading] = useState(false);       
    
    function defaultEmailList(){ return `${props.workEmail}; `; }

    function sendEmail(){        
        setSendingToWorkEmail(true);
        setSendEmailVisible(false);
        ReportsClient.sendReportToWorkEmail(props.requestUid, props.reportUid ? [props.reportUid] : []).then(
            response => {
                if(response.isSuccess){
                    ToastHelper.success("Email successfully sent!");
                }
                else{
                    ToastHelper.error(response.message);
                }
                setSendingToWorkEmail(false);
            },
            reason => {
                ToastHelper.error("Something went wrong. Please try again!");
                setSendingToWorkEmail(false)
            }
        );
    }   
    
    function share(){                   
        var emails = emailList.split(/(?:,|;| |\n)+/g);
        var shareTo = [];
        var wrongEmails = [];
        emails.forEach(email => {
            var noSpaceEmail = email.trim();
            if(emptyOrEmailRegexStandardRFC5322.test(noSpaceEmail) === true){
               if(noSpaceEmail !== '') shareTo.push(noSpaceEmail);
            }
            else{                
                wrongEmails.push(noSpaceEmail);
            }
        });

        if(wrongEmails.length > 0) {
            setWrongEmails(wrongEmails); 
            return;
        }  

        setSharingReport(true);
        setShareVisible(false);    
        ReportsClient.shareReport(props.requestUid, { emailList: _.uniq(shareTo), reportLogIds: props.reportUid ? [props.reportUid] : []}).then(
            response => {
                if(response.isSuccess){
                    ToastHelper.success("Email successfully sent!");
                }
                else{
                    ToastHelper.error(response.message);
                }
                setSharingReport(false);
            },
            reason => {
                ToastHelper.error("Something went wrong. Please try again!");
                setSharingReport(false)
            }
        );
    }   
    function downloadReport(){
        setDownloading(true);
        ReportsClient.downloadReport(props.reportId).then(
            report => {
                saveAs(report, props.downloadFileName);
                setDownloading(false);
            },
            reason => {
                ToastHelper.error("Something went wrong. Please try again!");
                setDownloading(false)
            }
        );
    }
    function onEmailListChange(event){
        if(wrongEmails.length > 0) setWrongEmails([]);       
        setEmailList(event.target.value);
    }
    
    function onCancelSharePopover(){
        setWrongEmails([]);
        setEmailList(defaultEmailList());
        setShareVisible(false);        
    }
    
    const sendEmailConfimationContent = 
        <>
            <h5>Please confirm</h5>
            <div style={{display: "flex", justifyContent: "flex-end"}}>
                <Button type="primary" size="small" onClick={sendEmail}>Send</Button>
                <Button ghost type="danger" size="small" style={{marginLeft: 5}} onClick={ () => setSendEmailVisible(false)}>Cancel</Button>
            </div>
        </>
    const wrongEmailBadges = wrongEmails.slice(0, 3).map((email, index) => <Tag key={`we_${index}`} color="red">{email}</Tag>) 
    const wrongEmailManyMore = wrongEmails.length > 3 && <Tag key={`we_more_${props.reportGroupId}`} color="blue">...{wrongEmails.length - 3} more</Tag>;

    const shareContent = 
        <div style={{width: 350}}>
            <h5>Enter your email addresses</h5>
            <TextArea autoFocus rows={3} onChange={onEmailListChange} value={emailList}/>
            <span key="wrong_emails" hidden={wrongEmails.length === 0}>Wrong email(s): {wrongEmailBadges}{wrongEmailManyMore}</span>
            <div style={{display: "flex", justifyContent: "flex-end", marginTop: 5}}>
                <Button disabled={emailList === ''} type="primary" size="small" onClick={share}>Share</Button>
                <Button ghost type="danger" size="small" style={{marginLeft: 5}} onClick={onCancelSharePopover}>Cancel</Button>
            </div>
        </div>
    const sendToWorkEmailPopoverTitle = <span key={`title_po_${props.reportGroupId}`}>Send report to <strong>{props.workEmail}</strong></span>
    return (
        <div style={{display: "flex", justifyContent: "flex-end"}}>
            {/* <Button ghost={props.buttonsTheme === 'primary'} hidden={!props.preview} type={props.buttonsTheme} size='small' onClick={showReport} style={{width: 32}} title="Preview" icon="eye"></Button> */}
            <Button ghost={props.buttonsTheme === 'primary'} hidden={!props.download} loading={downloading} disabled={downloading} type={props.buttonsTheme} size='small' onClick={downloadReport} style={{width: 32, marginLeft: 5}} title="Download"><i hidden={downloading} className="fa fa-cloud-download" aria-hidden="true"></i></Button>
            <Popover visible={isSendEmailVisible} onVisibleChange={visible => props.workEmail === null ? false : setSendEmailVisible(visible)} content={sendEmailConfimationContent} placement="left" title={sendToWorkEmailPopoverTitle} trigger="click">
                <Button ghost={props.buttonsTheme === 'primary'} hidden={!props.emailMe} loading={sendingToWorkEmail} disabled={sendingToWorkEmail || props.workEmail === null} title={props.workEmail === null ? "(no work email found)" : "Send to work email"} type={props.buttonsTheme} style={{width: 32, marginLeft: 5}} size='small' ><i hidden={sendingToWorkEmail} className="fa fa-envelope" aria-hidden="true"></i></Button>
            </Popover>
            <Popover visible={isShareVisible} onVisibleChange={visible => setShareVisible(visible)} content={shareContent} placement="left" title="Share the report with others" trigger="click">
                <Button ghost={props.buttonsTheme === 'primary'} hidden={!props.share} loading={sharingReport} disabled={sharingReport} type={props.buttonsTheme} style={{width: 32, marginLeft: 5}} size='small' title="Share"><i hidden={sharingReport} className="fa fa-share-alt" aria-hidden="true"></i></Button>                
            </Popover>
        </div>
    )
}