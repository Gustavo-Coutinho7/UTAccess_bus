import React, {Component} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {CustomHeader} from '../index';
import {IMAGE} from '../constants/Image';
navigator.geolocation = require('@react-native-community/geolocation');

export class NotificationsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      currentLocation: null,
      location: null,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <CustomHeader
          title="Notifications"
          navigation={this.props.navigation}
        />
        <View
          style={{flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
          <Text style={{fontSize: 22, fontWeight: 'bold'}}>
            Locais Favoritos
          </Text>
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
            onPress={this.findCoordinates()}>
            <Image
              style={{width: '8%', marginLeft: 7}}
              source={IMAGE.ICON_CASA}
              resizeMode="contain"
            />
            <View style={{marginLeft: 15}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', top: 11}}>
                Casa
              </Text>
              <TextInput
                placeholder="Toque para inserir um endereço'"
                onChangeText={text => this.setState({total: text})}
              />
            </View>
          </TouchableOpacity>
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
            onPress={{}}>
            <Image
              style={{width: '8%', marginLeft: 7}}
              source={IMAGE.ICON_LOCAL}
              resizeMode="contain"
            />
            <View style={{marginLeft: 15}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', top: 11}}>
                Trabalho
              </Text>
              <TextInput
                placeholder="Toque para inserir um endereço'"
                onChangeText={{}}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderTopColor: '#000',
              borderBottomColor: '#000',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              backgroundColor: '#C7C6C6',
              width: '100%',
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => this.props.navigation.navigate('Notifications')}>
            <Text style={{fontSize: 14}}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}
