import React, {Component} from 'react';
import {
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
} from 'react-native';
import {IMAGE} from './constants/Image';
import AsyncStorage from '@react-native-community/async-storage';

export default class LoadScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {i: 0, n: 0};
  }
  timerID = 0;

  getData = async () => {
    try {
      const linha = await AsyncStorage.getItem('line');
      const bus = await AsyncStorage.getItem('bus');
      if (linha !== null && bus != null) {
        if (linha !== '' && bus !== '') {
          this.props.navigation.navigate('MapScreen');
        }
      } else {
        this.props.navigation.navigate('LineScreen');
      }
    } catch (e) {
      console.log(e);
    }
  };

  start() {
    this.timerID = setInterval(() => {
      let i = this.state.i;
      console.log(i);
      this.setState({i: ++i});
      if (i >= 3) {
        clearInterval(this.timerID);
        this.setState({
          i: 0,
        });
        this.getData();
      }
    }, 1000);
  }

  requestGPSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Ative a localização',
          message: 'O aplicativo funciona usando a sua localização',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Voce pode usar a geolocalização');
        this.start();
      } else {
        console.log('Acesso negado');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  async componentDidMount() {
    this.requestGPSPermission();
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#FF8000'}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            resizeMode="contain"
            style={{width: '90%', height: '90%'}}
            source={IMAGE.LOGO}
          />
          <View
            style={{
              position: 'absolute',
              height: '50%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              bottom: 0,
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: 'transparent',
                width: '100%',
                flex: 1,
              }}
              onPress={() => {
                let n = this.state.n;
                this.setState({
                  n: ++n,
                });
                if (n >= 3) {
                  clearInterval(this.timerID);
                  this.setState({
                    i: 0,
                    n: 0,
                  });
                  this.props.navigation.navigate('TestLineScreen');
                }
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
