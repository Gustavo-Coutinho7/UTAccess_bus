import React, {Component, useEffect} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {LINHAS} from './constants/itinerario';
import Directions from './Directions';
import {IMAGE} from './constants/Image';
import {Picker} from '@react-native-community/picker';
import MQTTConnection from './MQTTConnection';
import {Buffer} from 'buffer';
global.Buffer = Buffer;
import AsyncStorage from '@react-native-community/async-storage';
import Sound from 'react-native-sound';

export default class TestScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bothAlert: false,
      startAlert: false,
      stopAlert: false,
      stopnext: false,
      PointNow: 0,
      onPoint: false,
      channel: '',
      end: [],
      points: [],
      user_id: [],
      user: [],
      region: {
        latitude: -21.2030977,
        longitude: -50.4386507,
        latitudeDelta: 0.00143,
        longitudeDelta: 0.0134,
      },
      linha: [],
      linhaC: [],
      linhaB: [],
      linhaAtual: '',
      n: 0,
      i: 0,
      way: null,
      way1: null,
      way2: null,
      way3: null,
      way4: null,
      selectedValue: 'B103',
      linha1: null,
      linha2: null,
      linha3: null,
      linha4: null,
      startnext: false,
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
    let n = this.state.n;
    if (this.state.way[n] != null) {
      let location = this.state.way[n];
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
        if (distPoint < 0.002) {
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
        if (distPoint < 0.002) {
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

  PointNow(n) {
    if (this.state.way[n] != null) {
      let location = this.state.way[n];
      let linha = this.state.linha;
      for (var j = 0; j < linha.length; j++) {
        let ca_co =
          Math.pow(location.latitude - linha[j].latitude, 2) +
          Math.pow(location.longitude - linha[j].longitude, 2);
        let distPoint = Math.pow(ca_co, 0.5);
        if (distPoint < 0.0001) {
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
        console.log(
          'Linha:',
          LINHAS[linha][0].linha,
          'LinhaC:',
          LINHAS[linhaC][0].linha,
          'LinhaB:',
          LINHAS[linhaB][0].linha,
          'LinhaAtual:',
          linhaAtual,
        );
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
    //==============================================================
    this.stop();
    await this.getData();
    //==============================================================
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
    this.stop();
    console.log('Change Line!!!');
    this.setState({
      way1: null,
      way2: null,
      way3: null,
      way4: null,
      linha1: null,
      linha2: null,
      linha3: null,
      linha4: null,
      i: 0,
      n: 0,
    });
    if (this.state.linhaAtual === 'B') {
      let channelnow = 'U-' + this.state.linhaB[0].linha.toString();
      let newchannel = 'U-' + this.state.linhaC[0].linha.toString();
      this.mqttConnect.subscribeChannel(newchannel);
      this.mqttConnect.unsubscribeChannel(channelnow);
      console.log('Trocando para centro');
      console.log(this.state.linhaC);
      this.setState({
        linhaAtual: 'C',
        linha: this.state.linhaC,
      });
    } else {
      let channelnow = 'U-' + this.state.linhaC[0].linha.toString();
      let newchannel = 'U-' + this.state.linhaB[0].linha.toString();
      this.mqttConnect.subscribeChannel(newchannel);
      this.mqttConnect.unsubscribeChannel(channelnow);
      console.log('Trocando para bairro');
      console.log(this.state.linhaB);
      this.setState({
        linhaAtual: 'B',
        linha: this.state.linhaB,
      });
    }
  }

  WayCont() {
    let i = this.state.i;
    if (i < this.state.way1.length - 1) {
      //console.log('On the line 1');
      //console.log(this.state.way1.length);
      this.setState({
        way: this.state.way1,
      });
    } else if (this.state.way2 === null) {
      //console.log('line2 null');
      this.ChangeLine();
      //=============================================
    } else if (this.state.way3 === null) {
      //console.log('line3 null');
      if (i === this.state.way1.length - 1) {
        this.setState({n: 0, way: this.state.way2});
      }
      if (i === this.state.way2.length + this.state.way1.length - 2) {
        this.ChangeLine();
        //Trocar de rota ==================================
      }
      //=============================================
    } else if (this.state.way4 === null) {
      //console.log('Way4 null');
      if (i === this.state.way1.length - 1) {
        // console.log('On the line 2');
        //console.log(this.state.way1.length);
        this.setState({n: 0, way: this.state.way2});
      }
      if (i === this.state.way2.length + this.state.way1.length - 2) {
        //console.log('On the line 3');
        //console.log(this.state.way3.length);
        this.setState({n: 0, way: this.state.way3});
      }
      if (
        i ===
        this.state.way3.length +
          this.state.way2.length +
          this.state.way1.length -
          3
      ) {
        this.ChangeLine();
        //Trocar de linha ==================================
      } //=============================================
    } else {
      if (i === this.state.way1.length - 1) {
        //console.log('On the line 2');
        this.setState({n: 0, way: this.state.way2});
      }
      if (i === this.state.way2.length + this.state.way1.length - 2) {
        //console.log('On the line 3');
        this.setState({n: 0, way: this.state.way3});
      }
      if (
        i ===
        this.state.way3.length +
          this.state.way2.length +
          this.state.way1.length -
          3
      ) {
        //console.log('On the line 4');
        this.setState({n: 0, way: this.state.way4});
      }
      if (
        i ===
        this.state.way4.length +
          this.state.way3.length +
          this.state.way2.length +
          this.state.way1.length -
          4
      ) {
        this.ChangeLine();
        // Trocar de Linha =============================================
      }
    }
    //=============================================
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

  start() {
    this.stopButton();
    this.timerID = setInterval(() => {
      if (this.state.way1 != null) {
        this.WayCont();
        let n = this.state.n;
        let i = this.state.i;
        console.log('Start', n, i);
        this.setState({
          n: ++n,
          i: ++i,
        });
      }
      if (this.state.way != null) {
        this.StopPlease();
        this.Send();
        this.PointNow(this.state.n);
      }
    }, 1000);
  }

  Send() {
    let linha = this.state.linha;
    let id = this.state.user_id.toLocaleString();
    let channel = 'B-' + linha[0].linha.toString();
    let n = this.state.n;
    let message =
      '{"Point_Now":' +
      this.state.PointNow +
      ', "Location":' +
      '{"latitude":' +
      this.state.way[n].latitude +
      ',"longitude":' +
      this.state.way[n].longitude +
      '}, "RequestOK" : " ' +
      id +
      ' "}';
    let json = JSON.parse(message);
    //console.log('Request: ', json);
    this.mqttConnect.send(channel, message);
  }

  stop() {
    clearInterval(this.timerID);
    this.setState({
      n: 0,
      way: null,
    });
  }

  stopButton() {
    clearInterval(this.timerID);
  }

  render() {
    const {linha, n, way, region, linha1, linha2, linha3, linha4} = this.state;

    return (
      <SafeAreaView
        style={{
          height: '100%',
          alignItems: 'center',
          backgroundColor: 'tranparent',
        }}>
        <MapView
          initialRegion={region}
          style={styles.MapView}
          rotateEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          showsPointsOfInterest={false}
          showsBuildings={false}
          showsUserLocation={false}
          loadingEnabled={true}
          onMapReady={async () => {
            console.log('Mapa: OK');
          }}
          ref={(el) => (this.MapView = el)}>
          {this.state.points.map((points, index) => (
            <MapView.Marker
              coordinate={points.coordinate}
              key={index}
              image={IMAGE.USER}
              title={'index'}
            />
          ))}
          {this.state.end.map((end, index) => (
            <MapView.Marker
              coordinate={end.coordinate}
              key={index}
              image={IMAGE.USER}
              title={'index'}
            />
          ))}
          {way && (
            <Marker
              tracksViewChanges={false}
              coordinate={way[n]}
              anchor={{x: 0.5, y: 1}}
              image={IMAGE.BUS}
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
                this.MapView.fitToCoordinates(result.coordinates, {
                  edgePadding: {right: 50, left: 50, top: 50, bottom: 100},
                });
                console.log('Direction OK', result.coordinates);
                this.SplitWay();
              }}
            />
          )}
          {linha1 && (
            <Directions
              width={3}
              color="#FF6600"
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
                //this.start();
              }}
            />
          )}

          {linha2 && (
            <Directions
              width={3}
              color="#FF6600"
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
        </MapView>
        <View
          style={{
            position: 'absolute',
            flexDirection: 'row',
            height: 40,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            bottom: 10,
          }}>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 30,
              width: 55,
              backgroundColor: '#FF8000',
              right: 5,
            }}
            onPress={() => {
              let n = this.state.n; //  reseta
              let i = this.state.i; // não reseta
              let linha = this.state.way;
              if (linha != null && n > 1) {
                if (n > 5) {
                  this.stopButton();
                  this.setState({n: n - 5, i: i - 5});
                  this.start();
                } else {
                  //this.stopButton();
                  this.setState({n: 1, i: i - n + 1});
                  //this.start();
                }

                //console.log(linha.length, n, i);
              }
            }}>
            <Text style={{color: 'black', fontWeight: 'bold', fontSize: 25}}>
              -
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 30,
              width: 75,
              backgroundColor: 'black',
            }}
            onPress={() => {
              this.start();
            }}>
            <Text style={{color: 'white'}}>START</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 30,
              width: 75,
              backgroundColor: 'black',
              left: 5,
            }}
            onPress={() => {
              console.log(
                this.state.linha.length,
                this.state.linhaC.length,
                this.state.linhaB.length,
              );
              this.stopButton();
            }}>
            <Text style={{color: 'white'}}>STOP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 30,
              width: 55,
              backgroundColor: '#FF8000',
              left: 10,
            }}
            onPress={() => {
              let n = this.state.n; //  reseta
              let i = this.state.i; // não reseta
              let linha = this.state.way;
              if (linha != null) {
                let resto = linha.length - n - 1;
                if (n < n + resto) {
                  if (linha.length - n > 10) {
                    this.stopButton();
                    this.setState({n: n + 10, i: i + 10});
                    this.start();
                  } else {
                    this.stopButton();
                    console.log(resto);
                    this.setState({n: n + resto, i: i + resto});
                    this.start();
                  }
                }

                //console.log(linha.length, n, i);
              }
            }}>
            <Text style={{color: 'black', fontWeight: 'bold', fontSize: 25}}>
              +
            </Text>
          </TouchableOpacity>
        </View>
        {this.state.stopAlert && (
          <View
            style={{
              backgroundColor: 'orange',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              PARE NO PRÓXIMO PONTO!!!
            </Text>
          </View>
        )}
        {this.state.startAlert && (
          <View
            style={{
              backgroundColor: 'orange',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              USUÁRIO NO PRÓXIMO PONTO!!!
            </Text>
          </View>
        )}
        {this.state.bothAlert && (
          <View
            style={{
              backgroundColor: 'orange',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              height: 60,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              EMBARQUE E DESEMBARQUE
            </Text>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>
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
