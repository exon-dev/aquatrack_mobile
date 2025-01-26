import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from "@expo/vector-icons/Entypo";
import Navbar from "../modals/Navbar";

const Dashboard = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("session");
      console.log("Session removed successfully");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error("Error removing session:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <Image source={require("../assets/menu_btn.png")} style={styles.menu} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeText}>
            Hello, <Text style={styles.name}>Cyrel</Text>!
          </Text>
          <Text style={styles.welcomeDescription}>Have a nice day!</Text>
        </View>
        <View style={styles.transactions}>
          <Text style={styles.transactionsTitle}>Transactions</Text>
        </View>
        <View style={styles.transactionsContainer}>
          <Text>Hello</Text>
        </View>
        <View style={styles.cardContainer}>
          {[1, 2, 3].map((item, index) => (
            <View key={index} style={styles.cardContent}>
              <Image
                style={styles.image}
                source={{
                  uri: "https://tecdn.b-cdn.net/img/new/standard/nature/186.jpg",
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
              {/* <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.deleteButton]}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.editButton]}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={[styles.navbar]}>
        <Navbar />
      </View>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F2F4FF",
    paddingTop: 20, // Add padding to avoid overlap with the sticky header
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute", // Make the header sticky
    top: 0, // Stick to the top
    left: 0,
    right: 0,
    backgroundColor: "#F2F4FF", // Match the background color
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
    backgroundColor: "#00BCD4",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  innerContainer: {
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 80, // Add padding to avoid overlap with the sticky header
    paddingBottom: 44,
    width: "100%",
  },
  welcomeBanner: {
    width: "100%",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
  },
  name: {
    fontWeight: "bold",
  },
  welcomeDescription: {
    color: "#8d8d8d",
  },
  transactions: {
    width: "100%",
  },
  transactionsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
  },

  transactionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 16,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  cardContent: {
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    width: "48%",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  image: {
    width: "100%",
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
    fontWeight: "500",
    color: "#262626",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  addressText: {
    color: "#525252",
  },
  employeeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  employeeText: {
    color: "#525252",
  },

  navbar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  editButton: {
    backgroundColor: "#3b71ca",
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#00BCD4",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});