import React, {Component} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import {Picker} from '@react-native-community/picker';
import AsyncStorage from '@react-native-community/async-storage';
import {IMAGE} from './constants/Image';

export default class TestLineScreen extends Component {
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
            this.stop();
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
    console.log('id:', id, 'linha:', line);
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
      linhaB = (id - 1).toString();
      linhaC = id.toString();
      linhaAtual = 'C';
    }
    try {
      await AsyncStorage.setItem('linha', linha);
      await AsyncStorage.setItem('linhaB', linhaB);
      await AsyncStorage.setItem('linhaC', linhaC);
      await AsyncStorage.setItem('linhaAtual', linhaAtual);
      console.log(
        'linhaAtual: ',
        linhaAtual,
        'LinhaB',
        linhaB,
        'linhaC',
        linhaC,
      );
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
        <View
          style={{
            width: '80%',
            height: '20%',
          }}
        />
        <Text
          style={{
            width: '80%',
            height: '20%',
            fontSize: 30,
            fontWeight: 'bold',
          }}>
          DEV MODE
        </Text>

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
                this.props.navigation.navigate('TestScreen');
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
