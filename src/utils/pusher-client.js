import Pusher from "pusher-js";
import {
    APP_PUSHER_KEY,
    APP_PUSHER_CLUSTER
} from "../constants/api"

export default class PusherClient{    
    constructor(){
        this.pusher = new Pusher(APP_PUSHER_KEY, {
            cluster: APP_PUSHER_CLUSTER,
            encrypted: true,
            // authEndpoint: '/in-app-notification/auth',
            // auth: {
            //   headers: {
            //     'X-CSRF-Token': "<%%= form_authenticity_token %>"
            //   }
            // }
        });              
    }    

    bindConnectionEvents = (onConnectionStateChanged) => this.pusher.connection.bind("state_chage", onConnectionStateChanged);
    onConnectionsLimitReached = (callback) =>  this.pusher.connection.bind( 'error', function( err ){
        if( err.error.data.code === 4004 ) {
          callback(err);
        }
    })
    onSubscriptionSucceeded = (channel, onSubscribed) => channel.bind("pusher:subscription_succeeded", () => onSubscribed());
    onSubscriptionError = (channel, onError) => channel.bind("pusher:subscription_error", (status) => onError(status));

    subscribeChannel = (channel) => this.pusher.subscribe(channel); 
    unsubscribeChannel = (channel) => this.pusher.unsubscribe(channel);

    bindEvent = (channel, eventName, callback) => channel.bind(eventName, data => callback(data));
    unbindEvent = (channel, eventName, callback) => channel.unbind(eventName, callback);

    disconnect = () => this.pusher.disconnect();
    connect = () => this.pusher.connect();
}