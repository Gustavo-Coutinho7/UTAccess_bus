import init from 'react_native_mqtt';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-community/async-storage';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

const defaultConnectOptions = {
  reconnect: true,
  cleanSession: true,
  mqttVersion: 3,
  keepAliveInterval: 60,
  timeout: 60,
};

export default class MQTTConnection {
  constructor() {
    this.mqtt = null;
    this.QOS = 0;
    this.RETAIN = false;
  }

  connect(host, port, options = null) {
    console.log('host: ', host, port);
    if (options) {
      this.QOS = options.qos;
      this.RETAIN = options.retain;
    }
    let currentTime = +new Date();
    let clientID = currentTime + uuid.v1();
    clientID = clientID.slice(0, 23);
    console.log('ClientID: ', clientID);

    this.mqtt = new Paho.MQTT.Client(host, port, clientID);
    this.mqtt.onConnectionLost = (res) => {
      this.onMQTTLost;
    };
    this.mqtt.onMessageArrived = (message) => {
      this.onMQTTMessageArrived(message);
    };
    this.mqtt.onMessageDelivered = (message) => {
      this.onMQTTMessageDelivered(message);
    };

    const connectOptions = options ? options : defaultConnectOptions;

    this.mqtt.connect({
      onSuccess: this.onMQTTSucess,
      onFailure: this.onMQTTFailure,
      ...connectOptions,
    });
  }

  onMQTTSucess = () => {
    this.onMQTTConnect();
  };

  onMQTTFailure = () => {
    this.onMQTTLost();
  };

  subscribeChannel(channel) {
    console.log('MQTTConection sub: ', channel);
    if (!this.mqtt || !this.mqtt.isConnected()) {
      return;
    }
    this.mqtt.subscribe(channel, this.QOS);
  }

  unsubscribeChannel(channel) {
    console.log('MQTTConection unsub: ', channel);
    if (!this.mqtt || !this.mqtt.isConnected()) {
      return;
    }
    this.mqtt.unsubscribe(channel);
  }

  send(channel = null, payload) {
    //console.log('send: ', payload);
    if (!this.mqtt || !this.mqtt.isConnected()) {
      console.log('no Connection');
      return;
    }
    if (!channel || !payload) {
      return false;
    }
    console.log(`send publish: ${channel}, payload: ${payload}`);
    this.mqtt.publish(channel, payload, this.QOS, this.RETAIN);
  }
  close() {
    this.mqtt && this.mqtt.disconnect();
    this.mqtt = null;
  }
}

MQTTConnection.prototype.onMQTTConnect = null;
MQTTConnection.prototype.onMQTTLost = null;
MQTTConnection.prototype.onMQTTMessageArrived = null;
MQTTConnection.prototype.onMQTTMessageDelivered = null;
