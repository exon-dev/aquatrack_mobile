import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const Navbar = () => {
  const [loading, setLoading] = React.useState(false);

  // Function to open the camera and send the image to the API
  const openCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
        return;
      }
  
      // Launch the camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: false,
      });
  
      console.log('Camera Result:', result); // Log the result to debug
  
      // Handle the result
      if (!result.canceled) {
        setLoading(true);
        try {
          // Create a FormData object
          const formData = new FormData();
          
          // Append the image file to the form data
          const uri = result.assets[0].uri;
          const fileType = result.assets[0].mimeType;
          const fileName = uri.split('/').pop();
  
          formData.append('file', {
            uri: uri,
            name: fileName,
            type: fileType,
          });
  
          // Send the image to the API
          const apiResponse = await fetch('http://192.168.254.106:5000/api/v1/detect', {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          });
  
          const responseData = await apiResponse.json();
          console.log('API Response:', responseData); // Log the API response to debug
        } catch (error) {
          console.log('Error sending image to API:', error);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={openCamera} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Ionicons name="camera" size={24} color="#000" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // For Android shadow
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    color: '#000',
  },
});

export default Navbar;