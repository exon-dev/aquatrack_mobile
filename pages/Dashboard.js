import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions, Pressable, TouchableWithoutFeedback } from 'react-native';
import { Divider } from '@rneui/themed';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from '@expo/vector-icons/Entypo';
import Navbar from '../modals/Navbar';
import { supabase } from './auth/Login';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * .8;

const Dashboard = () => {
  const navigation = useNavigation();
  const [sessionData, setSessionData] = useState(null);
  const [transactionData, setTransactionData] = useState([]);
  const [scannedResult, setScannedResult] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useSharedValue(0);

  const checkSession = async () => {
    const session = await AsyncStorage.getItem('session');
    if (session) {
      setSessionData(JSON.parse(session));
    }
  };

  const fetchTransactions = async () => {
    if (!sessionData) return; // Ensure sessionData is available
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('employee_id', sessionData.employee_id);

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    if (data) {
      setTransactionData(data);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleOutsidePress = () => {
    translateY.value = withSpring(0, { damping: 10, stiffness: 50 });
    setTimeout(() => runOnJS(setIsVisible)(false), 300);
  };

  const handleGesture = (event) => {
    const { translationY } = event.nativeEvent;

    if (translationY > 0) {
      translateY.value = withSpring(Math.max(translationY, MAX_TRANSLATE_Y));
    }
  };

  const handleGestureEnd = (event) => {
    const { translationY } = event.nativeEvent;

    if (translationY > SCREEN_HEIGHT * 0.1) {
      handleOutsidePress();
      setScannedResult(null);
    } else {
      translateY.value = withSpring(MAX_TRANSLATE_Y);
    }
  };

  const openDrawer = () => {
    setIsVisible(true);
    translateY.value = withSpring(MAX_TRANSLATE_Y);
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
    if (result) {
      setIsVisible(true);
      setScannedResult(result);
      translateY.value = withSpring(MAX_TRANSLATE_Y);
    }
  };

  const handleScannedGestureEnd = (event) => {
    const { translationY } = event.nativeEvent;

    if (translationY > SCREEN_HEIGHT * 0.1) {
      handleCloseScannedResult();
    } else {
      translateY.value = withSpring(MAX_TRANSLATE_Y);
    }
  };

  const handleCloseScannedResult = () => {
    translateY.value = withSpring(0, { damping: 10, stiffness: 50 }); // Add this line to trigger the animation
    setTimeout(() => {
      setScannedResult(null); // Clear the scanned result to hide the BottomSheet
      setIsVisible(false);
    }, 300);
  };

  useEffect(() => {
    checkSession(); // Fetch session data on component mount
  }, []);

  useEffect(() => {
    if (sessionData) {
      fetchTransactions(); // Fetch transactions when sessionData is available
    }
  }, [sessionData]);

  return (
    <View  style={styles.container}>
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

        <View style={styles.addListContainer}>
          <TouchableOpacity style={styles.addItem} onPress={openDrawer}>
            <Entypo name="add-to-list" size={16} color="#fff" />
            <Text style={styles.addItemText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.cell]}>Date</Text>
            <Text style={[styles.headerCell, styles.cell]}>Type</Text>
            <Text style={[styles.headerCell, styles.cell]}>No. of Containers</Text>
            <Text style={[styles.headerCell, styles.cell]}>Status</Text>
          </View>
          {transactionData.map((row, index) => (
            <TouchableOpacity key={index} style={styles.row}>
              <Text style={styles.cell}>{new Date(row.created_at).toLocaleDateString()}</Text>
              <Text style={styles.cell}>{row.transaction_type}</Text>
              <Text style={styles.cell}>{row.container_count}</Text>
              <Text style={styles.cell}>{row.is_delivered ? "Delivered" : "In Progress"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={[styles.navbar]}>
        <Navbar onScannedResult={handleScannedResult} />
      </View>

      {/* Transactiton Bottom Drawer */}
      {isVisible && (
          <GestureHandlerRootView style={styles.drawerContainer}>
              <TouchableWithoutFeedback onPress={handleOutsidePress}>
                <View style={styles.overlay} />
              </TouchableWithoutFeedback>
              <PanGestureHandler
                onGestureEvent={handleGesture}
                onEnded={handleGestureEnd}
              >
                <Animated.View style={[styles.drawer, animatedStyle]}>
                  <View style={styles.handle} />
                  <Text style={styles.drawerContent}>Add your transaction here</Text>
                </Animated.View>
              </PanGestureHandler>
          </GestureHandlerRootView>
        )}

      {/* Scanned Result Bottom Drawer */}
      {scannedResult && isVisible && (
        <GestureHandlerRootView style={styles.drawerContainer}>
              <TouchableWithoutFeedback onPress={handleCloseScannedResult}>
                <View style={styles.overlay} />
              </TouchableWithoutFeedback>
              <PanGestureHandler
                onGestureEvent={handleGesture}
                onEnded={handleScannedGestureEnd}
              >
                <Animated.View style={[styles.scannedResultDrawer, animatedStyle]}>
                  <View style={styles.handle} />
                  <Text style={styles.resultText}>Scanned Result:</Text>
                  <Text style={styles.resultText}>
                    Predictions: {JSON.stringify(scannedResult.container_predictions, null, 2)}
                  </Text>
                  <Text style={styles.resultText}>Image:</Text>
                  <Image
                    style={styles.scannedImage}
                    // source={{
                    //   uri: ${scannedResult.image},
                    // }}
                  />
                </Animated.View>
              </PanGestureHandler>
          </GestureHandlerRootView>
      )}

    </View >
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'start',
    backgroundColor: '#F2F4FF',
    paddingTop: 20, // Add padding to avoid overlap with the sticky header
    zIndex: 5,
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
    zIndex: 5, // Ensure the header is above other content
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
  addListContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  addItem: {
    flexDirection: 'row',
    width: 'auto',
    padding: 8,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: 'green',
  },
  addItemText: {
    color: '#fff',
    fontWeight: 'medium',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 8,
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
    zIndex: 5,
  },

  drawerContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // overlay: {
  //   ...StyleSheet.absoluteFillObject,
  //   flex: 1,
  //   backgroundColor: "rgba(0, 0, 0, 0.3)",
  //   height: "100%", // Adjust this value as needed
  //   zIndex: 10,
  // },
  overlay: {
    flex: 1,
    height: SCREEN_HEIGHT, // Adjust this value as needed
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  drawer: {
    position: "absolute",
    top: SCREEN_HEIGHT, // Adjust this value as needed
    width: "100%",
    height: SCREEN_HEIGHT, // Adjust this value as needed
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
    padding: 16,
    zIndex: 15,
  },
  scannedResultDrawer: {
    position: "absolute",
    top: SCREEN_HEIGHT, // Adjust this value as needed
    width: "100%",
    height: SCREEN_HEIGHT, // Adjust this value as needed
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "start",
    padding: 16,
    zIndex: 15,
  },
  handle: {
    width: 60,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    marginVertical: 8,
    alignSelf: 'center',
  },
  drawerContent: {
    marginTop: 16,
    fontSize: 18,
    color: "#333",
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