import React, {Component} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Directions from '../Directions';
import MapView from 'react-native-maps';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from '@react-native-community/geolocation';

export class HomeScreenDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adress: '',
      id: '',
      token: '',
      region: {
        latitude: -21.2030977,
        longitude: -50.4386507,
        latitudeDelta: 0.00143,
        longitudeDelta: 0.0134,
      },
      destination: {
        latitude: -23.3044524,
        longitude: -51.1695824,
        latitudeDelta: 0.00143,
        longitudeDelta: 0.0134,
      },
      location: {
        latitude: -21.2030977,
        longitude: -50.4386507,
        latitudeDelta: 0.00143,
        longitudeDelta: 0.0134,
      },
    };
  }

  findCoordinates = () => {
    Geolocation.getCurrentPosition(data =>
      this.setState({
        region: {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
          latitudeDelta: 0.00143,
          longitudeDelta: 0.0134,
        },
      }),
    );
  };

  getDestino = async () => {
    try {
      const valueid = await AsyncStorage.getItem('id');
      const valuetoken = await AsyncStorage.getItem('token');
      if (valueid !== null) {
        this.setState({id: valueid});
      }
      if (valuetoken !== null) {
        this.setState({token: valuetoken});
      }
      try {
        let response = await fetch(
          'http://192.168.0.6:4000/destino/' + this.state.id,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 2000,
            body: JSON.stringify({
              token: this.state.token,
            }),
          },
        );
        let responseJson = await response.json();
        console.log(responseJson.destino.title);
        this.setState({
          destination: {
            latitude: parseFloat(responseJson.destino.latitude),
            longitude: parseFloat(responseJson.destino.longitude),
            latitudeDelta: 0.00143,
            longitudeDelta: 0.0134,
          },
        });
        return responseJson.data;
      } catch (error) {
        console.log(error);
      }
    } catch (e) {
      Alert.alert(e);
    }
  };

  async componentDidMount() {
    this.findCoordinates();
  }

  render() {
    const {region, destination} = this.state;
    return (
      <SafeAreaView style={{flex: 1, height: '100%', alignItems: 'center'}}>
        <MapView
          region={this.state.region}
          style={styles.MapView}
          rotateEnabled={false}
          //scrollEnabled={false}
          //zoomEnabled={false}
          showsPointsOfInterest={false}
          showsBuildings={false}
          showsUserLocation
          loadingEnabled
          onMapReady={() => this.getDestino()}
          ref={el => (this.MapView = el)}>
          {destination && (
            <Directions
              origin={region}
              destination={destination}
              onReady={result => {
                this.MapView.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: 50,
                    left: 50,
                    top: 50,
                    bottom: 50,
                  },
                });
              }}
            />
          )}
        </MapView>
        <TouchableOpacity
          style={{height: 50, backgroundColor: '#ff0'}}
          onPress={() => this.findCoordinates()}>
          <Text>OK</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  MapView: {
    width: '100%',
    height: '50%',
  },
});
