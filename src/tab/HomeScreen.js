import React, {Component} from 'react';
import {
  ImageBackground,
  Text,
  StyleSheet,
  View,
  TextInput,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import {CustomHeader} from '../index';
import {IMAGE} from '../constants/Image';
import AsyncStorage from '@react-native-community/async-storage';
import Search from '../search';

export class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      homeAdress: 'Toque para inserir um endereço',
      workAdress: 'Toque para inserir um endereço',
      adress: '',
      locais: [],
      recentes: [],
      id: '',
      token: '',
      destination: [],
    };
  }

  loadFavoritos = async () => {
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
          'http://192.168.0.6:4000/favoritos/' + this.state.id,
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
        try {
          this.setState({
            locais: responseJson,
          });
        } catch (error) {
          console.log(error);
        }

        return responseJson.data;
      } catch (error) {}
    } catch (e) {
      Alert.alert(e);
    }
  };

  loadRecentes = async () => {
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
          'http://192.168.0.6:4000/recentes/' + this.state.id,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 2000,
            body: JSON.stringify({
              token: this.state.token,
              num_reg: 5,
            }),
          },
        );
        let responseJson = await response.json();
        try {
          this.setState({
            recentes: responseJson,
          });
        } catch (error) {
          console.log(error);
        }

        return responseJson.data;
      } catch (error) {
        console.log(error);
      }
    } catch (e) {
      Alert.alert(e);
    }
  };

  addRecente = async () => {
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
          'http://192.168.0.6:4000/addRecente/' + this.state.id,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 3000,
            body: JSON.stringify({
              token: this.state.token,
              latitude: this.state.destination.latitude,
              longitude: this.state.destination.longitude,
              title: this.state.destination.title,
              adress: this.state.adress,
            }),
          },
        );
        let responseJson = await response.json();
        return responseJson.data;
      } catch (error) {
        console.log(error);
      }
    } catch (e) {
      Alert.alert(e);
    }
  };

  handleLocationSelected = (data, {geometry}) => {
    const {
      location: {lat: latitude, lng: longitude},
    } = geometry;
    this.setState({
      adress: data.structured_formatting.secondary_text,
      destination: {
        latitude,
        longitude,
        title: data.structured_formatting.main_text,
      },
    });
    this.addRecente();
    this.props.navigation.navigate('HomeDetail');
  };

  async componentDidMount() {
    this.loadFavoritos();
    this.loadRecentes();
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <CustomHeader
          title=""
          isHome={true}
          navigation={this.props.navigation}
        />

        <View
          style={{
            backgroundColor: '#fff',
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <View style={{width: '100%', height: '40%'}}>
            <ImageBackground
              style={{
                flex: 1,
                resizeMode: 'container',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
              source={IMAGE.ICON_BACKGROUND}
            />
          </View>

          <View
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'flex-start',
              backgroundColor: '#FF8000',
            }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FF8000',
                width: '100%',
              }}>
              <View
                style={{
                  backgroundColor: '#C7C6C6',
                  width: '100%',
                  height: 20,
                  justifyContent: 'center',
                }}>
                <Text style={{left: 10, fontSize: 14}}>FAVORITOS</Text>
              </View>
              <FlatList
                style={{width: '100%'}}
                data={this.state.locais}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      height: 55,
                      width: '100%',
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      borderTopWidth: 1,
                      borderTopColor: '#000',
                    }}
                    onPress={this.loadFavoritos}>
                    <Image
                      style={{width: '8%', marginLeft: 7}}
                      source={IMAGE.ICON_LOCAL}
                      resizeMode="contain"
                    />
                    <View style={{marginLeft: 15}}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        {item.nome_local}
                      </Text>
                      <Text>{item.endereco}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.nome_local}
              />
              <TouchableOpacity
                style={{
                  borderTopColor: '#000',
                  borderBottomColor: '#000',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  backgroundColor: '#fff',
                  width: '100%',
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.handleLocationSelected();
                  // this.props.navigation.navigate('Notifications');
                }}>
                <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                  Adicionar
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FF8000',
                width: '100%',
              }}>
              <View
                style={{
                  backgroundColor: '#C7C6C6',
                  width: '100%',
                  height: 20,
                  justifyContent: 'center',
                }}>
                <Text style={{left: 10, fontSize: 14}}>RECENTES</Text>
              </View>
              <FlatList
                style={{width: '100%'}}
                data={this.state.recentes}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      height: 55,
                      width: '100%',
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      borderTopWidth: 1,
                      borderTopColor: '#000',
                    }}
                    onPress={this.loadFavoritos}>
                    <Image
                      style={{width: '8%', marginLeft: 7}}
                      source={IMAGE.ICON_LOCAL}
                      resizeMode="contain"
                    />
                    <View style={{marginLeft: 15}}>
                      <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                        {item.title}
                      </Text>
                      <Text>{item.adress}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id.toString()}
              />
              <TouchableOpacity
                style={{
                  borderTopColor: '#000',
                  borderBottomColor: '#000',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  backgroundColor: '#fff',
                  width: '100%',
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.props.navigation.navigate('HomeDetail');
                }}>
                <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                  Histórico
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Search onLocationSelected={this.handleLocationSelected} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  Imput: {
    marginBottom: '10%',
    padding: 15,
    width: '96%',
    height: 48,
    backgroundColor: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    borderRadius: 20,
  },
});
