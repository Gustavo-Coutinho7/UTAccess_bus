import React, {Component} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {CustomHeader} from '../index';

export class SettingsScreen extends Component {
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <CustomHeader
          title="Settings"
          isHome={false}
          navigation={this.props.navigation}
        />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Settings!</Text>
          <TouchableOpacity
            style={{marginTop: 20}}
            onPress={() => this.props.navigation.navigate('SettingDetail')}>
            <Text>Go Settings Detail</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}
