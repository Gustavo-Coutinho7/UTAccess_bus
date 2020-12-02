import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TestScreen from './src/TestScreen';
import MapScreen from './src/MapScreen';
import LoadScreen from './src/LoadScreen';
import LineScreen from './src/LineScreen';
import TestLineScreen from './src/TestLineScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none" initialRouteName="LoadScreen">
        <Stack.Screen name="LoadScreen" component={LoadScreen} />
        <Stack.Screen name="TestScreen" component={TestScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="LineScreen" component={LineScreen} />
        <Stack.Screen name="TestLineScreen" component={TestLineScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
