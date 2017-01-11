
import React, { useRef, useEffect,useState } from 'react';
import {Modal} from 'antd';
import WebViewer from "../../webViewer";
import { ReportsClient } from '../../../utils/reporting-client';

const readUploadedFileAsArrayBuffer = inputFile => {
    const temporaryFileReader = new FileReader()
  
    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort()
        reject(new DOMException("Problem parsing input file."))
      }
  
      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result)
      }
      temporaryFileReader.readAsArrayBuffer(inputFile)
    })
  }

const ReportViewer = (props) => {
    const [webViewer, setWebViewer] = useState(null);   
    const [viewerReady, setViewerReady] = useState(false);
    // if using a class, equivalent of componentDidMount 
    useEffect(() => {
        setWebViewer(React.createRef());
    }, []);
    useEffect(() => {
        if(viewerReady){
            console.log("viewer is ready!");
        }
    }, [viewerReady]);
    function wvReadyHandler(){
        setViewerReady(true);
        ReportsClient.downloadReport(props.reportId).then(
            report => {
                readUploadedFileAsArrayBuffer(report).then(content => {
                    const file = new File([report], props.reportName)
                    webViewer.current.getInstance().loadDocument(file, {
                      documentId: props.reportId,
                      filename:  props.reportName,
                    })
                  })                
            },
            reason => {
               // ToastHelper.error("Something went wrong. Please try again!");
               // setDownloading(false)
            }
        );
       
    }
    return (
        <Modal visible="true" title="Report viewer" wrapClassName="report-viewer" footer={null} width={'90%'} bodyStyle={{padding: 0, margin: 0, height: "calc(100vh - 140px)"}} style={{ top: 60 }}>
             <WebViewer
                      ref={webViewer}
                      onReady={wvReadyHandler}
                      enablePaging={false}
                      disableNext={true}
                      disablePrev={true}                     
                    //   onDownloadDocument={this.onDownloadDocClick}                     
                    />
        {/* <SingleDocumentViewer 
            file="http://localhost:7509/reporting/download/284221" 
            uniqueId="284221" 
            fileName="Activity Summary by Sites (14 days span)-200408-5848.XLSX"
            auth={props.auth}/> */}
        </Modal>
    );
   
}

export default ReportViewer;