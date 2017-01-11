import PusherClient from "../pusher-client";
import client from '../api-client';
import {CUSTOMER_API_ROOT} from '../../constants/api';

const REPORTS_READY_EVENT = "evt-reports-ready";

const PUSHER_ENDPOINT_ROOT = `${CUSTOMER_API_ROOT}in-app-notification/`;
const PusherChannelType = {
    Reporting: "Reporting"
}

export default class ReportingNotifier{    
    constructor(onReportsReady){
        this.pusherClient = new PusherClient();              
        this.onReportsReady = onReportsReady;                
    }

    
    onReportsSubscriptionError = (status) => {
        if(status === 403){console.log("You are not authorized on reporting channel!")}        
    }

    onReportsSubscriptionReady(){
        this.bindEvents();
    }

    get reportingChannel(){
        return client(`${PUSHER_ENDPOINT_ROOT}channel/${PusherChannelType.Reporting}`);
    }

    subscribe(){   
        this.reportingChannel.then(channel => {
            this.reportsChannel = this.pusherClient.subscribeChannel(channel);
            this.pusherClient.onSubscriptionError(this.reportsChannel, (status) => this.onReportsSubscriptionError.bind(this, status));
            this.pusherClient.onSubscriptionSucceeded(this.reportsChannel, this.onReportsSubscriptionReady.bind(this));     
        });
    }
            
    bindEvents = () => {        
        this.pusherClient.bindEvent(this.reportsChannel, REPORTS_READY_EVENT, this.onReportsReady);
    }           
}