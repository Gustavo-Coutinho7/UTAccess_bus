import React, {Component} from 'react';
import {Text, View, Image, TouchableOpacity} from 'react-native';
import {IMAGE} from './constants/Image';

export class CustomHeader extends Component {
  render() {
    let {navigation, isHome, title} = this.props;
    return (
      <View
        style={{
          flexDirection: 'row',
          height: 50,
          backgroundColor: '#FF8000',
        }}>
        {isHome ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Image
                style={{left: 7, width: 30, height: 30}}
                source={IMAGE.ICON_MENU}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                style={{left: 7, width: 30, height: 30}}
                source={IMAGE.ICON_BACK}
              />
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{
            flex: 1.5,
            justifyContent: 'center',
          }}>
          <Image
            style={{width: '100%', height: '90%'}}
            resizeMode="contain"
            source={IMAGE.ICON_LOGO}
          />
        </View>
        <View style={{flex: 1}} />
      </View>
    );
  }
}
