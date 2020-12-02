import React, {Component} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {LINHAS, TerminalChegada} from './constants/itinerario';
import Directions from './Directions';
import {IMAGE} from './constants/Image';
import Geolocation from '@react-native-community/geolocation';
import MQTTConnection from './MQTTConnection';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import {Buffer} from 'buffer';
global.Buffer = Buffer;
import AsyncStorage from '@react-native-community/async-storage';
import Sound from 'react-native-sound';

export default class TestScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      points: [],
      end: [],
      user_id: [],
      user: [],
      region: {
        latitude: -21.2030977,
        longitude: -50.4386507,
        latitudeDelta: 0.00143,
        longitudeDelta: 0.0134,
      },
      linha: [],
      linhaC: null,
      linhaB: null,
      linhaAtual: '',
      selectedValue: null,
      way: null,
      way1: null,
      way2: null,
      way3: null,
      way4: null,
      linha1: null,
      linha2: null,
      linha3: null,
      linha4: null,
      stopnext: false,
      startnext: false,
      stopAlert: false,
      startAlert: false,
      bothAlert: false,
      channel: '',
      PointNow: 0,
      heading: 0,
    };
  }
  timerID = 0;

  playSound(alert) {
    this.alerta.play((success) => {
      if (!success) {
        console.log('Sound did not play');
      }
      while (this.alerta.isPlaying === true) {}
      console.log(alert);
      if (alert === 'both') {
        this.bothalert.play((sucs) => {
          if (!sucs) {
            console.log('Sound did not play');
          }
        });
      }
      if (alert === 'stop') {
        this.desembarque.play((sucs) => {
          if (!sucs) {
            console.log('Sound did not play');
          }
        });
      }
      if (alert === 'start') {
        this.embarque.play((sucs) => {
          if (!sucs) {
            console.log('Sound did not play');
          }
        });
      }
    });
  }

  StopPlease() {
    let startAlert = false;
    let stopAlert = false;
    let stopnext = this.state.stopnext;
    let startnext = this.state.startnext;
    if (this.state.region != null) {
      let location = this.state.region;
      let nextPoint = this.state.linha[this.state.PointNow + 1];
      let end = this.state.end;
      let points = this.state.points;
      if (stopnext === false) {
        for (var j = 0; j < end.length; j++) {
          let coord = end[j].coordinate;
          if (
            coord.latitude === nextPoint.latitude &&
            coord.longitude === nextPoint.longitude
          ) {
            this.setState({
              stopnext: true,
            });
            break;
          }
        }
      }
      if (stopnext === true) {
        let ca_co =
          Math.pow(location.latitude - nextPoint.latitude, 2) +
          Math.pow(location.longitude - nextPoint.longitude, 2);
        let distPoint = Math.pow(ca_co, 0.5);
        if (distPoint < 0.0007) {
          console.log('========PARE POR FAVOR===========');
          stopAlert = true;
        }
      }
      if (startnext === false) {
        for (var j = 0; j < points.length; j++) {
          let coord = points[j].coordinate;
          if (
            coord.latitude === nextPoint.latitude &&
            coord.longitude === nextPoint.longitude
          ) {
            this.setState({
              startnext: true,
            });
            break;
          }
        }
      }
      if (startnext === true) {
        let ca_co =
          Math.pow(location.latitude - nextPoint.latitude, 2) +
          Math.pow(location.longitude - nextPoint.longitude, 2);
        let distPoint = Math.pow(ca_co, 0.5);
        if (distPoint < 0.0007) {
          console.log('========USUÁRIO NO PROXIMO PONTO===========');
          startAlert = true;
        }
      }
      if (stopAlert === true && startAlert === true) {
        this.playSound('both');
        console.log('BOTHALERT!!!');
        this.setState({
          bothAlert: true,
          stopAlert: false,
          startAlert: false,
        });
      } else if (stopAlert === true) {
        this.playSound('stop');
        this.setState({
          stopAlert: true,
        });
      } else if (startAlert === true) {
        this.playSound('start');
        this.setState({
          startAlert: true,
        });
      }
    }
  }

  EndPoint(point) {
    let end_ok = false;
    let end = this.state.end;
    let linha = this.state.linha;
    for (var i = 0; i < this.state.end.length; i++) {
      let coord = end[i].coordinate;
      if (
        linha[point].latitude === coord.latitude &&
        linha[point].longitude === coord.longitude
      ) {
        console.log('IGUAIS');
      }
    }
    if (end_ok === false) {
      let coordinate = {
        coordinate: {
          latitude: linha[point].latitude,
          longitude: linha[point].longitude,
        },
      };
      console.log('Coordinate: ', coordinate);
      if (end.length === 0) {
        this.setState({
          end: [coordinate],
        });
      } else {
        let concat = end.concat(coordinate);
        this.setState({
          end: concat,
        });
      }
    }
  }

  UserRequest(request) {
    console.log('Nova mensagem!!!');
    let message = JSON.parse(request);
    let id_ok = false;
    let point_ok = false;
    if (this.state.user.length !== 0) {
      console.log('Mais um user');
      for (var i = 0; i < this.state.user.length; i++) {
        let user = this.state.user[i];
        if (message.id === user.id) {
          id_ok = true;
          console.log('OLD USER');
          if (message.On_Bus === true) {
            console.log('ON BUS');
            this.EndPoint(message.Stop_End);
          }
        }
      }
    }
    if (id_ok === false) {
      console.log('False');
      let new_points = [
        {
          coordinate: {
            latitude: this.state.linha[message.Point_Stop].latitude,
            longitude: this.state.linha[message.Point_Stop].longitude,
          },
        },
      ];
      for (var j = 0; j < this.state.points.length; j++) {
        console.log('Entrou no for');
        let coordinate = this.state.points[j].coordinate;
        if (
          coordinate.latitude ===
            this.state.linha[message.Point_Stop].latitude &&
          coordinate.longitude ===
            this.state.linha[message.Point_Stop].longitude
        ) {
          console.log('===NAO CRIAR NOVO PONTO==============');
          point_ok = true;
        } else {
          new_points = [
            {
              coordinate: {
                latitude: this.state.linha[message.Point_Stop].latitude,
                longitude: this.state.linha[message.Point_Stop].longitude,
              },
            },
          ];
        }
      }
      //=====================================
      let user_mem = this.state.user;
      let points_mem = this.state.points;
      let user_id_mem = this.state.user_id;
      let new_user_id = [message.id];

      let new_user = {
        id: message.id,
        Point_Stop: message.Point_Stop,
        On_Bus: message.On_Bus,
        Stop_End: message.Stop_End,
      };
      let concat_points;
      let concat_id = user_id_mem.concat(new_user_id);
      let concat_user = user_mem.concat(new_user);
      if (point_ok === false) {
        concat_points = points_mem.concat(new_points);
      } else {
        concat_points = points_mem;
      }

      //Cadastrar requisição e mandar OK
      this.setState({
        user: concat_user,
        points: concat_points,
        user_id: concat_id,
      });
      console.log(concat_id);
    }
  }

  getData = async () => {
    try {
      const linha = await AsyncStorage.getItem('linha');
      const linhaC = await AsyncStorage.getItem('linhaC');
      const linhaB = await AsyncStorage.getItem('linhaB');
      const linhaAtual = await AsyncStorage.getItem('linhaAtual');
      if (linha !== null) {
        this.setState({
          linha: LINHAS[linha],
          linhaC: LINHAS[linhaC],
          linhaB: LINHAS[linhaB],
          linhaAtual: linhaAtual,
        });
      }
    } catch (e) {
      console.log(e);
      this.props.navigation.goBack();
    }
    let linha = this.state.linha;
    let channel = 'U-' + linha[0].linha.toString();
    this.setState({
      channel: channel,
    });
  };

  PointNow() {
    if (this.state.region != null) {
      let location = this.state.region;
      let linha = this.state.linha;
      for (var j = 0; j < linha.length; j++) {
        let ca_co =
          Math.pow(location.latitude - linha[j].latitude, 2) +
          Math.pow(location.longitude - linha[j].longitude, 2);
        let distPoint = Math.pow(ca_co, 0.5);
        if (distPoint < 0.0003) {
          console.log('No ponoto: ', j, 'Dist: ', distPoint);
          let points = this.state.points;
          let end = this.state.end;
          let user = this.state.user;
          let user_id = this.state.user_id;
          for (var k = 0; k < points.length; k++) {
            let coordinate = points[k].coordinate;
            if (
              (coordinate.latitude === linha[j].latitude) &
              (coordinate.longitude === linha[j].longitude)
            ) {
              let splicePoints = points.splice(k, 1);
              this.setState({
                points: points,
              });
            }
          }
          for (var k = 0; k < end.length; k++) {
            let coordinate = end[k].coordinate;
            if (
              (coordinate.latitude === linha[j].latitude) &
              (coordinate.longitude === linha[j].longitude)
            ) {
              let spliceEnd = end.splice(k, 1);
              this.setState({
                end: end,
              });
            }
          }
          for (var k = 0; k < user.length; k++) {
            let Stop_End = user[k].Stop_End;
            let id = user[k].id;
            if (Stop_End === j) {
              for (var i = 0; i < user_id.length; i++) {
                console.log('Entrou no laço for', user_id[i]);
                if (user_id[i] === id) {
                  console.log('Apagando', user_id);
                  let idsplice = user_id.splice(i, 1);
                  console.log(user_id);
                  this.setState({
                    user_id: user_id,
                  });
                }
              }
            }
          }
          if (j === linha.length - 1) {
            this.ChangeLine();
          }
          this.setState({
            PointNow: j,
            stopnext: false,
            startnext: false,
            stopAlert: false,
            startAlert: false,
            bothAlert: false,
          });
        }
      }
    }
  }

  SplitWay() {
    console.log('SplitWay!!!');
    let linha = this.state.linha;
    let linha1 = linha.slice(0, 10);
    let linha2 = linha.slice(9, 19);
    let linha3 = linha.slice(18, 28);
    let linha4 = linha.slice(27, 37);
    console.log(
      linha.length,
      linha1.length,
      linha2.length,
      linha3.length,
      linha4.length,
    );
    this.setState({
      linha1: linha1,
      linha2: linha2,
      linha3: linha3,
      linha4: linha4,
      n: 0,
      i: 0,
    });
  }

  ChangeLine() {
    console.log('Change line');
    this.setState({
      way2: null,
      way3: null,
      way4: null,
      linha2: null,
      linha3: null,
      linha4: null,
    });

    if (this.state.linhaAtual === 'B') {
      let channelnow = 'U-' + this.state.linhaB[0].linha.toString();
      let newchannel = 'U-' + this.state.linhaC[0].linha.toString();
      this.mqttConnect.subscribeChannel(newchannel);
      this.mqttConnect.unsubscribeChannel(channelnow);
      this.setState({
        linhaAtual: 'C',
        linha: this.state.linhaC,
      });
    } else {
      let channelnow = 'U-' + this.state.linhaC[0].linha.toString();
      let newchannel = 'U-' + this.state.linhaB[0].linha.toString();
      this.mqttConnect.subscribeChannel(newchannel);
      this.mqttConnect.unsubscribeChannel(channelnow);
      this.setState({
        linhaAtual: 'B',
        linha: this.state.linhaB,
      });
    }
  }

  findCoordinates = () => {
    console.log('Find coord');
    Geolocation.watchPosition(
      (data) => {
        let location = {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
          latitudeDelta: 0.00143,
          longitudeDelta: 0.0134,
        };
        this.setState({
          region: location,
          heading: data.coords.heading,
        });
        this.PointNow();
        this.StopPlease();
      },
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 3000,
        distanceFilter: 1,
      },
    );
  };

  getCurrentPosition() {
    Geolocation.getCurrentPosition(
      (data) => {
        let location = {
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
          latitudeDelta: 0.00143,
          longitudeDelta: 0.0134,
        };
        this.setState({
          region: location,
          heading: data.coords.heading,
        });
      },
      (error) => {
        console.log('getCurrentPosition: ', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 3000,
        distanceFilter: 1,
      },
    );
    this.findCoordinates();
  }

  GpsIsOff = async () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        this.GpsIsOff();
        console.log(err);
      });
  };

  stop() {
    clearInterval(this.timerID);
  }

  async componentDidMount() {
    //Load Sound =====================================================
    this.alerta = new Sound('alerta_sonoro.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
    });
    this.embarque = new Sound('embarque.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
    });
    this.desembarque = new Sound(
      'desembarque.mp3',
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
      },
    );
    this.bothalert = new Sound(
      'embarque_desembarque.mp3',
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
      },
    );
    //=============================================================
    await this.getData();
    //=======================================
    const backAction = () => {
      //Quando o botão voltar é pressionado

      Alert.alert('ALERTA!', 'Você quer mesmo sair do app?', [
        {
          text: 'Cancelar',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Sim',
          onPress: async () => {
            this.stop();
            try {
              await AsyncStorage.setItem('line', '');
              await AsyncStorage.setItem('bus', '');
            } catch (e) {
              // saving error
            }
            BackHandler.exitApp();
          },
        },
      ]);

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    this.getCurrentPosition();
    //========== MQTTConnection ============================================
    this.mqttConnect = new MQTTConnection();
    this.mqttConnect.connect('test.mosquitto.org', 8080);
    this.mqttConnect.onMQTTConnect = () => {
      console.log('Connect');
      this.mqttConnect.subscribeChannel(this.state.channel);
    };
    this.mqttConnect.onMQTTLost = () => {
      console.log('Lost Conmection');
      this.mqttConnect.subscribeChannel(this.state.channel);
    };
    this.mqttConnect.onMQTTMessageArrived = (message) => {
      //console.log('Message arrived: ', message);
      // console.log('Payload: ', message.payloadString);
      this.UserRequest(message.payloadString);
    };
    this.mqttConnect.onMQTTMessageDelivered = (message) => {
      //console.log('Message delivered: ', message);
    };

    return () => {
      this.mqttConnect.close();
      backHandler.remove();
    };
  }

  start() {
    clearInterval(this.timerID);
    this.timerID = setInterval(() => {
      this.Send();
      this.GpsIsOff();
    }, 1000);
  }

  Send() {
    let linha = this.state.linha;
    let id = this.state.user_id.toLocaleString();
    let channel = 'B-' + linha[0].linha.toString();
    let message =
      '{"Point_Now":' +
      this.state.PointNow +
      ', "Location":' +
      '{"latitude":' +
      this.state.region.latitude +
      ',"longitude":' +
      this.state.region.longitude +
      '}, "RequestOK" : " ' +
      id +
      ' "}';
    //let json = JSON.parse(message);
    //console.log('Request: ', json);
    this.mqttConnect.send(channel, message);
  }

  render() {
    const {linha, region, linha1, linha2, linha3, linha4} = this.state;
    return (
      <SafeAreaView
        style={{
          height: '100%',
          alignItems: 'center',
          backgroundColor: '#FF8000',
        }}>
        <MapView
          initialRegion={region}
          style={styles.MapView}
          rotateEnabled={false}
          showsCompass={false}
          //scrollEnabled={false}
          //zoomEnabled={false}
          showsPointsOfInterest={false}
          showsBuildings={false}
          showsUserLocation={false}
          loadingEnabled={true}
          onMapReady={async () => {
            console.log('Mapa: OK');
          }}
          ref={(el) => (this.MapView = el)}>
          {region && (
            <Marker
              coordinate={region}
              anchor={{x: 0.5, y: 1}}
              image={IMAGE.BUS}
            />
          )}
          {this.state.points.map((points, index) => (
            <MapView.Marker
              coordinate={points.coordinate}
              key={index}
              image={IMAGE.USER}
            />
          ))}
          {this.state.end.map((end, index) => (
            <MapView.Marker
              coordinate={end.coordinate}
              key={index}
              image={IMAGE.USER}
            />
          ))}
          {region && (
            <Directions
              width={0}
              color="#000"
              mode="DRIVING"
              origin={region}
              destination={linha[linha.length - 1]}
              onError={(error) => {
                console.log(error);
              }}
              onReady={(result) => {
                this.MapView.animateCamera(
                  {
                    center: region,
                    pitch: 90,
                    heading: this.state.heading,
                    altitude: 200,
                    zoom: 18,
                  },
                  0,
                );
              }}
            />
          )}
          {linha && (
            <Directions
              width={0}
              color="#000"
              mode="DRIVING"
              origin={linha[0]}
              destination={linha[linha.length - 1]}
              waypoints={linha}
              onError={(error) => {
                console.log(error);
              }}
              onReady={(result) => {
                /* this.MapView.fitToCoordinates(result.coordinates, {
                  edgePadding: {right: 50, left: 50, top: 50, bottom: 50},
                });*/
                console.log('Direction OK');
                this.SplitWay();
              }}
            />
          )}
          {linha1 && (
            <Directions
              width={3}
              color="#FF8000"
              mode="DRIVING"
              origin={linha1[0]}
              destination={linha1[linha1.length - 1]}
              waypoints={linha1}
              onError={(error) => {
                console.log(error);
              }}
              onReady={(result) => {
                this.setState({
                  way1: result.coordinates,
                });
                this.start();
              }}
            />
          )}
          {linha2 && (
            <Directions
              width={3}
              color="#FF8000"
              mode="DRIVING"
              origin={linha2[0]}
              destination={linha2[linha2.length - 1]}
              waypoints={linha2}
              onError={(error) => {
                console.log(error);
              }}
              onReady={(result) => {
                this.setState({
                  way2: result.coordinates,
                });
              }}
            />
          )}
          {linha3 && (
            <Directions
              width={3}
              color="#FF8000"
              mode="DRIVING"
              origin={linha3[0]}
              destination={linha3[linha3.length - 1]}
              waypoints={linha3}
              onError={(error) => {
                console.log(error);
              }}
              onReady={(result) => {
                this.setState({
                  way3: result.coordinates,
                });
              }}
            />
          )}
          {linha4 && (
            <Directions
              width={3}
              color="#FF8000"
              mode="DRIVING"
              origin={linha4[0]}
              destination={linha4[linha4.length - 1]}
              waypoints={linha4}
              onError={(error) => {
                console.log(error);
              }}
              onReady={(result) => {
                this.setState({
                  way4: result.coordinates,
                });
              }}
            />
          )}
          {this.state.linha.map((points, index) => (
            <MapView.Marker
              coordinate={{
                latitude: points.latitude,
                longitude: points.longitude,
              }}
              key={index}
              image={IMAGE.STOP}
            />
          ))}
        </MapView>
        {this.state.stopAlert && (
          <View
            style={{
              backgroundColor: '#FF8000',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>
              PARE NO PRÓXIMO PONTO!!!
            </Text>
          </View>
        )}
        {this.state.startAlert && (
          <View
            style={{
              backgroundColor: '#FF8000',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>
              USUÁRIO NO PRÓXIMO PONTO!!!
            </Text>
          </View>
        )}
        {this.state.bothAlert && (
          <View
            style={{
              backgroundColor: '#FF8000',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              height: 60,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>
              EMBARQUE E DESEMBARQUE
            </Text>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: 'white'}}>
              NO PRÓXIMO PONTO
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  MapView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
