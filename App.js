import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const checkSession = async () => {
  //     const session = await AsyncStorage.getItem('session');
  //     if (session) {
  //       setUser(JSON.parse(session));
  //     }
  //     setIsLoading(false);
  //   };

  //   checkSession();
  // }, []);

  // if (isLoading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* {user ? (
          <Stack.Screen name="Dashboard" options={{headerShown: false}} component={Dashboard} />
          ) : (
            <Stack.Screen name="Login" options={{headerShown: false}} component={Login} />
            )} */}
        <Stack.Screen name="Login" options={{headerShown: false}} component={Login} />
        <Stack.Screen name="Dashboard" options={{headerShown: false}} component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;