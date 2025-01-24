import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" options={{headerShown: false}} component={Login} />
        <Stack.Screen name="Dashboard" options={{headerShown: false}} component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;