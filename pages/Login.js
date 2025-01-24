import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.containerCard}>
      </View>
      <View style={styles.card}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Image
            source={require('../assets/aqua.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>AquaTrack</Text>
        </View>

        {/* Welcome Text */}
        <Text style={styles.subtitle}>Log in</Text>
        <Text style={styles.description}>
          Welcome! Please log in to your account to continue.
        </Text>

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Email Address or Username"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <View>{passwordVisible ? <Entypo name="eye-with-line" size={20} color="black" /> : <Entypo name="eye" size={20} color="black" />  }</View>
          </TouchableOpacity>
        </View>

        {/* Log In Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <TouchableOpacity>
          <Text style={styles.signUpText}>
            Doesn't have an account yet? Contact your administrator.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#255ADE', // Light blue gradient background
  },
  containerCard: {
    backgroundColor: '#2196F3',
    zIndex: 1,
    position: 'absolute',
    borderRadius: 15,
    padding: 10,
    width: '90%',
    height: '40%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    transform: [{ rotate: '6deg' }],
  },
  card: {
    backgroundColor: '#fff',
    zIndex: 2,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    alignItems: 'start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'start',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    width: '100%',
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  loginButton: {
    backgroundColor: '#00BCD4',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#2196F3',
    fontSize: 14,
  },
});

export default Login;
