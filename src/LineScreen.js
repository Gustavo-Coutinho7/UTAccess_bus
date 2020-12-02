import React, {Component} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  BackHandler,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-community/picker';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import AsyncStorage from '@react-native-community/async-storage';
import {IMAGE} from './constants/Image';

export default class LineScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: '',
      selectedValue1: '',
      isSelected: false,
    };
  }

  getData = async () => {
    try {
      const linha = await AsyncStorage.getItem('line');
      const bus = await AsyncStorage.getItem('bus');
      if (linha !== null && bus != null) {
        if (linha !== '' && bus !== '') {
          this.props.navigation.navigate('MapScreen');
        }
        this.setState({
          selectedValue: linha,
          selectedValue1: bus,
        });
        this.isSelected(linha, bus);
      }
    } catch (e) {
      console.log(e);
    }
  };

  GpsIsOff = async () => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    })
      .then((data) => {
        console.log(data);
        this.props.navigation.navigate('MapScreen');
      })
      .catch((err) => {
        this.GpsIsOff();
        console.log(err);
      });
  };

  async componentDidMount() {
    this.getData();
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

    return () => {
      backHandler.remove();
    };
  }

  async isSelected(line, bus) {
    console.log(line, bus);
    if (line != '' && bus != '') {
      this.setState({
        isSelected: true,
      });
    } else {
      this.setState({
        isSelected: false,
      });
    }
  }

  async setData(id, line) {
    let linha;
    let linhaB;
    let linhaC;
    let linhaAtual;
    if (line === 'B') {
      linha = id.toString();
      linhaB = id.toString();
      linhaC = (id + 1).toString();
      linhaAtual = 'B';
    } else {
      linha = id.toString();
      linhaB = id.toString();
      linhaC = (id - 1).toString();
      linhaAtual = 'C';
    }
    try {
      await AsyncStorage.setItem('linha', linha);
      await AsyncStorage.setItem('linhaB', linhaB);
      await AsyncStorage.setItem('linhaC', linhaC);
      await AsyncStorage.setItem('linhaAtual', linhaAtual);
    } catch (e) {
      // saving error
    }
  }

  render() {
    return (
      <SafeAreaView
        style={{
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FF8000',
        }}>
        <Image
          style={{width: '80%', height: '20%', flex: 0.5}}
          resizeMode="center"
          source={IMAGE.ICON_LOGO}
        />

        <View
          style={{
            flex: 1,
            paddingLeft: 5,
            width: '100%',
            alignItems: 'center',
          }}>
          <View
            style={{alignItems: 'flex-start', width: '100%', paddingLeft: 15}}>
            <Text
              style={{
                width: '40%',
                color: 'white',
                fontSize: 20,
                fontWeight: 'bold',
                paddingLeft: 5,
                paddingBottom: 10,
              }}>
              Cod. Ônibus:
            </Text>
          </View>
          <Picker
            mode={'dropdown'}
            selectedValue={this.state.selectedValue1}
            style={{
              height: 40,
              width: '90%',
              backgroundColor: 'white',
              justifyContent: 'center',
            }}
            onValueChange={async (itemValue, itemIndex) => {
              try {
                await AsyncStorage.setItem('bus', itemValue);
              } catch (e) {
                // saving error
              }
              this.isSelected(this.state.selectedValue, itemValue);
              this.setState({
                selectedValue1: itemValue,
              });
            }}>
            <Picker.Item label="" value="" />
            <Picker.Item label="101" value="101" />
            <Picker.Item label="102" value="102" />
            <Picker.Item label="103" value="103" />
            <Picker.Item label="104" value="104" />
            <Picker.Item label="105" value="105" />
            <Picker.Item label="106" value="106" />
          </Picker>
          <View
            style={{
              alignItems: 'flex-start',
              width: '100%',
              paddingLeft: 15,
            }}>
            <Text
              style={{
                width: '40%',
                color: 'white',
                fontSize: 20,
                fontWeight: 'bold',
                paddingLeft: 5,
                paddingBottom: 10,
                paddingTop: 10,
              }}>
              Linha:
            </Text>
          </View>
          <Picker
            mode={'dropdown'}
            selectedValue={this.state.selectedValue}
            style={{
              height: 40,
              width: '90%',
              backgroundColor: 'white',
              justifyContent: 'center',
            }}
            onValueChange={async (itemValue, itemIndex) => {
              try {
                await AsyncStorage.setItem('line', itemValue);
              } catch (e) {
                // saving error
              }
              this.isSelected(itemValue, this.state.selectedValue1);
              this.setState({
                selectedValue: itemValue,
              });
              let div = itemIndex + 1;
              let id = itemIndex - 1;
              if (div % 2 === 0) {
                this.setData(id, 'B');
                //Se indice par, linha para o bairro
              } else {
                this.setData(id, 'C');
              }
            }}>
            <Picker.Item label="" value="" />
            <Picker.Item label="B126" value="B126" />
            <Picker.Item label="C126" value="C126" />
            <Picker.Item label="B123" value="B123" />
            <Picker.Item label="C123" value="C123" />
            <Picker.Item label="B103" value="B103" />
            <Picker.Item label="C103" value="C103" />
          </Picker>
        </View>

        {this.state.isSelected && (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              alignItems: 'center',
              bottom: 25,
            }}>
            <TouchableOpacity
              style={{
                borderRadius: 20,
                backgroundColor: '#000',
                width: '80%',
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                this.GpsIsOff();
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }
}
