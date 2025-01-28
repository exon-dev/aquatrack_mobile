import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Divider } from '@rneui/themed';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from '@expo/vector-icons/Entypo';
import Navbar from '../modals/Navbar';
import BottomSheet from '../components/BottomSheet';
import { color } from '@rneui/base';
import { supabase } from './auth/Login';

const Dashboard = () => {
  const navigation = useNavigation();
  const [sessionData, setSessionData] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkSession = async () => {
    const session = await AsyncStorage.getItem('session');

    console.log("Session: ", session)

    if (session) {
      setSessionData(JSON.parse(session));
    }
  };
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('session');
      console.log('Session removed successfully');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Error removing session:', error);
    }
  };

  const handleScannedResult = (result) => {
    setScannedResult(result);
    setIsVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setScannedResult(null); // Clear the scanned result to hide the BottomSheet
    setIsVisible(false); // Update the visibility state
  };

  const tableData = [
    {id: 1, date: "01-28-2025", name: 'Refill', age: 28, city: 'In Progress', occupation: 'Engineer' },
    {id: 2, date: "01-28-2025", name: 'Delivery', age: 34, city: 'Delivered', occupation: 'Designer' },
    {id: 3, date: "01-28-2025", name: 'Delivery', age: 45, city: 'Delivered', occupation: 'Teacher' },
    {id: 4, date: "01-28-2025", name: 'Refill', age: 30, city: 'In Progress', occupation: 'Doctor' },
  ];

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <Image source={require('../assets/menu_btn.png')} style={styles.menu} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.welcomeBanner}>
          {sessionData && (
            <Text style={styles.welcomeText}>
              Hello, <Text style={styles.name}>{sessionData.first_name}</Text>!
            </Text>
          )}
          <Text style={styles.welcomeDescription}>Have a nice day!</Text>
        </View>
        {/* <View style={styles.transactions}>
          <Text style={styles.transactionsTitle}>Transactions</Text>
        </View> */}
        {/* <View style={styles.transactionHeader}>
          <View style={styles.headers}>
            <Text style={styles.headersText}>Date</Text>
          </View>
          <View style={styles.headers}>
            <Text style={styles.headersText}>Type</Text>
          </View>
          <View style={styles.headers}>
            <Text style={styles.headersText}>Containers</Text>
          </View>
          <View style={styles.headers}>
            <Text style={styles.headersText}>Status</Text>
          </View>
        </View> */}
        {/* <Divider /> */}
        {/* <View style={styles.hr} /> */}
        {/* <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tab}>
            <Text>Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text>Lorem Ipsum</Text>
          </TouchableOpacity>
        </View> */}

        {/* <View style={styles.transaction}>
          <View style={styles.transactionDesc}>
            <Text style={styles.transactionText}>01-28-2025</Text>
          </View>
          <View style={styles.transactionDesc}>
            <Text style={styles.transactionText}>Refill</Text>
          </View>
          <View style={styles.transactionDesc}>
            <Text style={styles.transactionText}>12</Text>
          </View>
          <View style={styles.transactionDesc}>
            <Text style={styles.transactionText}>In Progress</Text>
          </View>
        </View> */}

        {/* <View style={styles.transaction}>
          <View style={styles.transactionDesc}>
            <Text>01-28-2003</Text>
          </View>
          <View style={styles.transactionDesc}>
            <Text>Refill</Text>
          </View>
          <View style={styles.transactionDesc}>
            <Text>12</Text>
          </View>
        </View> */}

        <View style={styles.tableContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.cell]}>Date</Text>
            <Text style={[styles.headerCell, styles.cell]}>Type</Text>
            <Text style={[styles.headerCell, styles.cell]}>No. of Containers</Text>
            <Text style={[styles.headerCell, styles.cell]}>Status</Text>
          </View>

          {tableData.map((row) => (
            <TouchableOpacity key={row.id} style={styles.row}>
              <Text style={styles.cell}>{row.date}</Text>
              <Text style={styles.cell}>{row.name}</Text>
              <Text style={styles.cell}>{row.age}</Text>
              <Text style={styles.cell}>{row.city}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* <View style={styles.cardContainer}>
          {[1, 2, 3].map((item, index) => (
            <View key={index} style={styles.cardContent}>
              <Image
                style={styles.image}
                source={{
                  uri: 'https://tecdn.b-cdn.net/img/new/standard/nature/186.jpg',
                }}
              />
              <View style={styles.contentContainer}>
                <Text style={styles.stationName}>Aquasis Water Refilling Station</Text>
                <View style={styles.addressContainer}>
                  <Entypo name="location-pin" size={16} color="#3b71ca" />
                  <Text style={styles.addressText}>Jose, 123 Main St</Text>
                </View>
                <View style={styles.employeeContainer}>
                  <Entypo name="users" size={16} color="green" />
                  <Text style={styles.employeeText}>5 Employee/s</Text>
                </View>
              </View>
            </View>
          ))}
        </View> */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={[styles.navbar]}>
        <Navbar onScannedResult={handleScannedResult} />
      </View>
      {scannedResult && (
        <BottomSheet onClose={handleCloseBottomSheet}>
          <Text style={styles.resultText}>Scanned Result:</Text>
          <Text style={styles.resultText}>
            Predictions: {JSON.stringify(scannedResult.container_predictions, null, 2)}
          </Text>
          <Text style={styles.resultText}>Image:</Text>
          <Image
            style={styles.scannedImage}
            // source={{
            //   uri: `${scannedResult.image}`,
            // }}
          />
        </BottomSheet>
      )}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'start',
    backgroundColor: '#F2F4FF',
    paddingTop: 20, // Add padding to avoid overlap with the sticky header
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute', // Make the header sticky
    top: 0, // Stick to the top
    left: 0,
    right: 0,
    backgroundColor: '#F2F4FF', // Match the background color
    paddingHorizontal: 20,
    paddingTop: 44,
    zIndex: 10, // Ensure the header is above other content
  },
  menu: {
    width: 27.5,
    height: 17,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: '#00BCD4',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  innerContainer: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 80, // Add padding to avoid overlap with the sticky header
    paddingBottom: 44,
    width: '100%',
  },
  welcomeBanner: {
    width: '100%',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 32,
  },
  name: {
    fontWeight: 'bold',
  },
  welcomeDescription: {
    color: '#8d8d8d',
  },

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  headers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 'auto',
    paddingHorizontal: 12,
  },

  headersText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8d8d8d',
  },

  transactions: {
    width: '100%',
    marginTop: 8,
  },
  transactionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#262626',
  },

  // hr: {
  //   width: '80%',
  //   height: 1, // Thickness of the line
  //   backgroundColor: 'black', // Color of the line
  //   marginVertical: 10,
  // },

  tabContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
    marginTop: 16,
  },

  tab: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 8,
    width: 'auto',
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 6,
  },

  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // width: 'auto',
    height: 'auto',
    backgroundColor: '#fff',
    borderRadius: 6,
  },

  transactionDesc: {
    // justifyContent: 'space-between',

  },

  transactionText: {
    color: '#262626',
  },

  tableContainer: {
    width: '100%',
    marginBottom: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 8,
    // backgroundColor: '#f2f2f2', // Header background color
    width: '100%',
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    width: '100%',
  },

  headerCell: {
    fontWeight: 'bold', // Make header text bold
    color: '#8d8d8d', // Header text color
  },

  cell: {
    flex: 1, // Equal width for all columns
    textAlign: 'center', // Center-align text
    paddingHorizontal: 4, // Add some padding
  },

  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  cardContent: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    width: '48%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#262626',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  addressText: {
    color: '#525252',
  },
  employeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  employeeText: {
    color: '#525252',
  },
  navbar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  resultText: {
    fontSize: 16,
    color: '#000',
  },
  scannedImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    marginTop: 10,
    zIndex: 10,
  },
  logoutButton: {
    backgroundColor: '#00BCD4',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});