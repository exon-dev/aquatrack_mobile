import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const Navbar = ({ onScannedResult }) => {
  const [loading, setLoading] = React.useState(false);

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: false,
      });

      console.log('Camera Result:', result);

      if (!result.canceled) {
        setLoading(true);
        try {
          const formData = new FormData();
          const uri = result.assets[0].uri;
          const fileType = result.assets[0].mimeType;
          const fileName = uri.split('/').pop();

          formData.append('file', {
            uri: uri,
            name: fileName,
            type: fileType,
          });

          const apiResponse = await fetch('http://192.168.254.106:5000/api/v1/detect', {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          });

          const responseData = await apiResponse.json();
          // console.log('API Response:', responseData);
          onScannedResult({
            container_predictions: responseData.predictions,
            image: responseData.prediction_image,
          }); // Pass the result to the parent component
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
          <Entypo name="add-to-list" size={24} color="#000" />
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