import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	ScrollView,
	Dimensions,
	Pressable,
	TouchableWithoutFeedback,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from "react-native";
import { Divider } from "@rneui/themed";
import { useNavigation, CommonActions } from "@react-navigation/native";
import {
	GestureHandlerRootView,
	PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	runOnJS,
} from "react-native-reanimated";
import DropDownPicker from "react-native-dropdown-picker";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import Navbar from "../modals/Navbar";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./auth/Login";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.8;
const Transaction_MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.4;

const Dashboard = () => {
	const navigation = useNavigation();
	const [sessionData, setSessionData] = useState(null);
	const [transactionData, setTransactionData] = useState([]);
	const [selectedTransactionId, setSelectedTransactionId] = useState(null);
	const [scannedResult, setScannedResult] = useState(null);
	const [isVisible, setIsVisible] = useState(false);
	const [isEditVisible, setIsEditVisible] = useState(false);
	const [isResultVisible, setIsResultVisible] = useState(false);
	const [scanResult, setScanResult] = useState(null);
	const [containersData, setContainersData] = useState([]);
	const [loading, setLoading] = useState(false);
	const translateY = useSharedValue(0);
	const initialY = useSharedValue(0);
	const [open, setOpen] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [value, setValue] = useState(null);
	const [items, setItems] = useState([
		{ label: "Delivered", value: "true" },
		{ label: "In Progress", value: "false" },
	]);

	const [transactionFormData, setTransactionFormData] = useState({
		transaction_type: "",
		container_count: null,
		delivery_location: "",
		is_delivered: false,
	});

	const [scannedResultFormData, setScannedResultFormData] = useState({
		fixed_gallons: null,
		broken_gallons: null,
	});

	const checkSession = async () => {
		const session = await AsyncStorage.getItem("session");
		if (session) {
			setSessionData(JSON.parse(session));
		}
	};

	const handleInputChange = (field, value) => {
		setTransactionFormData((prevState) => ({
			...prevState,
			[field]: value,
		}));
	};

	const handleScannedInputChange = (field, value) => {
		setScannedResultFormData((prevState) => ({
			...prevState,
			[field]: value,
		}));
	};

	const fetchTransactions = async () => {
		if (!sessionData) return; // Ensure sessionData is available

		const { data, error } = await supabase
			.from("transactions")
			.select("*")
			.eq("employee_id", sessionData.employee_id);

		if (error) {
			console.error("Error fetching transactions:", error);
			return;
		}

		if (data) {
			setTransactionData(data);
		}
	};

  const fetchContainers = async () => {
    if (!sessionData) return; // Ensure sessionData is available
  
    const { data, error } = await supabase
      .from("containers")
      .select("*")
      .eq("station_id", sessionData.station_id)
      .in("status", ["Available", "In-use"]); // Filter by status
  
    if (error) {
      console.error("Error fetching containers:", error);
      return;
    }
  
    if (data) {
      // Count the number of containers with status "Available" and "In-use"
      const availableCount = data.filter(container => container.status === "Available").length;
      const inUseCount = data.filter(container => container.status === "In-use").length;
      setContainersData({ availableCount, inUseCount });
    }
  };

	const handleAddTransaction = async () => {
		if (
			!transactionFormData.transaction_type ||
			transactionFormData.container_count === null ||
			transactionFormData.container_count === undefined ||
			isNaN(transactionFormData.container_count)
		) {
			alert("Please fill in all fields with valid values");
			return;
		}

		console.log("Submitting transaction:", {
			...transactionFormData,
			employee_id: sessionData.employee_id,
			station_id: sessionData.station_id,
		});

		try {
			const { error } = await supabase.from("transactions").insert([
				{
					...transactionFormData,
					employee_id: sessionData.employee_id,
					station_id: sessionData.station_id,
				},
			]);

			if (error) {
				console.error("Supabase error:", error);
				throw new Error(error.message || "Unexpected API response format");
			} else {
				console.log("Transaction added successfully!");
				setTimeout(() => runOnJS(setIsVisible)(false), 2000);
				if (setIsVisible === false) {
					translateY.value = withSpring(0, { damping: 10, stiffness: 50 });
					Toast.show({
						type: "success",
						text1: "Success",
						text2: "Transaction added successfully!",
						visibilityTime: 2000,
					});

					// Reset form after successful submission
					setTransactionFormData({
						transaction_type: "",
						container_count: null,
						delivery_location: "",
						is_delivered: false,
					});
				}
			}
		} catch (error) {
			console.error("Unexpected error:", error);

			Toast.show({
				type: "error",
				text1: "Error",
				text2: error.message || "Adding went wrong. Please try again.",
				visibilityTime: 3000,
			});
		}
	};

	const openCamera = async () => {
		try {
			const { status } = await ImagePicker.requestCameraPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission Denied",
					"Sorry, we need camera permissions to make this work!"
				);
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaType,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 1,
				base64: false,
			});

			// console.log('Camera Result:', result);

			if (!result.canceled) {
				setLoading(true);
				try {
					const formData = new FormData();
					const uri = result.assets[0].uri;
					const fileType = result.assets[0].mimeType;
					const fileName = uri.split("/").pop();

					formData.append("file", {
						uri: uri,
						name: fileName,
						type: fileType,
					});

					const apiResponse = await fetch(
						"http://192.168.254.109:5000/api/v1/detect",
						{
							method: "POST",
							headers: {
								"Content-Type": "multipart/form-data",
							},
							body: formData,
						}
					);

					const responseData = await apiResponse.json();
					// console.log("API Response:", responseData);
					setScanResult({
						container_predictions: responseData.predictions,
					});
					console.log(scanResult);

				} catch (error) {
					console.log("Error sending image to API:", error);
				} finally {
					setLoading(false);
				}
			}
		} catch (error) {
			console.error("Error opening camera:", error);
		}
	};

  useEffect(() => {
		if (scanResult && scanResult.container_predictions) {
			// Update the container_count with the "FIXED GALLON" value
			const fixedGallonValue = scanResult.container_predictions["FIXED GALLON"];
			if (fixedGallonValue !== undefined) {
				setTransactionFormData((prevData) => ({
					...prevData,
					container_count: fixedGallonValue,
				}));
			}
		}
	}, [scanResult]);

	const handleEditDrawer = (transaction) => {
		if (transaction) {
			setTransactionFormData({
				transaction_type: transaction.transaction_type,
				container_count: transaction.container_count,
				delivery_location: transaction.delivery_location,
				is_delivered: transaction.is_delivered,
			});
			// Store the transaction ID in state or a ref for later use
			setSelectedTransactionId(transaction.transaction_id);
		}
		setIsEditVisible(true);
		translateY.value = withSpring(Transaction_MAX_TRANSLATE_Y);
		initialY.value = Transaction_MAX_TRANSLATE_Y;
	};

	const handleEditTransaction = async () => {
		if (
			!transactionFormData.transaction_type ||
			transactionFormData.container_count === null ||
			transactionFormData.container_count === undefined ||
			isNaN(transactionFormData.container_count)
		) {
			alert("Please fill in all fields with valid values");
			return;
		}

		console.log("Editing transaction:", {
			...transactionFormData,
			transaction_id: selectedTransactionId, // Use the stored transaction ID
		});

		try {
			const { error } = await supabase
				.from("transactions")
				.update({
					transaction_type: transactionFormData.transaction_type,
					container_count: transactionFormData.container_count,
					delivery_location: transactionFormData.delivery_location,
					is_delivered: transactionFormData.is_delivered,
				})
				.eq("transaction_id", selectedTransactionId) // Use the stored transaction ID
				.eq("employee_id", sessionData.employee_id)
				.eq("station_id", sessionData.station_id);

			if (error) {
				console.error("Supabase error:", error);
				throw new Error(error.message || "Unexpected API response format");
			} else {
				console.log("Transaction edited successfully!");
				setTimeout(() => runOnJS(setIsEditVisible)(false), 2000);
				if (setIsEditVisible === false) {
					translateY.value = withSpring(0, { damping: 10, stiffness: 50 });
					Toast.show({
						type: "success",
						text1: "Success",
						text2: "Transaction edited successfully!",
						visibilityTime: 2000,
					});

					// Reset form after successful submission
					setTransactionFormData({
						transaction_type: "",
						container_count: null,
						delivery_location: "",
						is_delivered: false,
					});
					setSelectedTransactionId(null); // Clear the stored transaction ID
				}
			}
		} catch (error) {
			console.error("Unexpected error:", error);

			Toast.show({
				type: "error",
				text1: "Error",
				text2: error.message || "Editing went wrong. Please try again.",
				visibilityTime: 3000,
			});
		}
	};

	const handleUpdateContainers = async () => {
		try {
			// Step 1: Fetch random containers using the PostgreSQL function
			const { data: containers, error: fetchError } = await supabase.rpc(
				"get_random_containers",
				{
					limit_count: scannedResultFormData.broken_gallons,
				}
			);

			if (fetchError) {
				console.error("Error fetching containers:", fetchError);
				return;
			}

			if (containers.length === 0) {
				console.log("No containers found to update.");
				return;
			}

			// Step 2: Extract container IDs
			const containerIds = containers.map(
				(container) => container.container_id
			);

			// Step 3: Update the selected containers
			const { data, error: updateError } = await supabase
				.from("containers")
				.update({ dmg_containers: true })
				.in("container_id", containerIds)
				.eq("station_id", sessionData.station_id)
				.eq("employee_id", sessionData.employee_id);

			if (updateError) {
				console.error("Error updating containers:", updateError);
				return;
			} else {
				console.log("Containers updated successfully!", data);
			}
		} catch (error) {
			console.error("Unexpected error:", error);
		}
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	const handleOutsidePress = () => {
		translateY.value = withSpring(0, { damping: 10, stiffness: 50 });
		setTimeout(() => runOnJS(setIsVisible)(false), 300);
		setTimeout(() => runOnJS(setIsEditVisible)(false), 300);
		setTimeout(() => runOnJS(setIsResultVisible)(false), 300);

		// Reset form after successful submission
		setTransactionFormData({
			transaction_type: "",
			container_count: null,
			delivery_location: "",
			is_delivered: false,
		});
	};

	const handleGesture = (event) => {
		const { translationY } = event.nativeEvent;

		// Calculate the new position based on the initial position and translation
		const newY = initialY.value + translationY;

		// Prevent the drawer from going above the maximum position
		if (newY > Transaction_MAX_TRANSLATE_Y) {
			translateY.value = newY;
		}
	};

	const handleGestureEnd = (event) => {
		const { translationY } = event.nativeEvent;

		if (translationY > SCREEN_HEIGHT * 0.1) {
			handleOutsidePress();
			setScannedResult(null);
		} else {
			translateY.value = withSpring(Transaction_MAX_TRANSLATE_Y);
		}
	};

	const openDrawer = () => {
		setIsVisible(true);
		translateY.value = withSpring(Transaction_MAX_TRANSLATE_Y);
		initialY.value = Transaction_MAX_TRANSLATE_Y; // Set the initial position when the drawer opens
	};

	const handleScannedResult = (result) => {
		if (result) {
			setIsResultVisible(true);
			setScannedResult(result);
			translateY.value = withSpring(MAX_TRANSLATE_Y);
			initialY.value = MAX_TRANSLATE_Y;
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

	const handleRefresh = () => {
		fetchTransactions();
	};

	useEffect(() => {
		if (scannedResult) {
			setScannedResultFormData({
				fixed_gallons: scannedResult.container_predictions["FIXED GALLON"] || 0,
				broken_gallons:
					scannedResult.container_predictions["BROKEN GALLON"] || 0,
				missing_gallons:
					scannedResult.container_predictions["MISSING GALLON"] || 0,
			});
		}
	}, [scannedResult]);

	useEffect(() => {
		if (scanResult) {
			console.log("Updated Scan Result:", scanResult);
		}
	}, [scanResult]); // This will log the updated scanResult whenever it changes

	useEffect(() => {
		checkSession(); // Fetch session data on component mount
	}, []);

	useEffect(() => {
		if (sessionData) {
      fetchContainers();
			fetchTransactions(); // Fetch transactions when sessionData is available
		}
	}, [sessionData]);

	return (
		<View style={styles.container}>
			<Toast />
			{/* Sticky Header */}
			<View style={styles.header}>
				{/* <Image source={require("../assets/menu_btn.png")} style={styles.menu} /> */}
				{sessionData && (
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>
							{sessionData.first_name && sessionData.last_name
								? `${sessionData.first_name[0]}${sessionData.last_name[0]}`
								: "NA"}
						</Text>
					</View>
				)}
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

        <View style={{flexDirection: "row", justifyContent: "space-between", alignContent: "flex-end", alignItems: "flex-end" }}>
          <View style={styles.statistics}>
            <Text style={{color: "green"}}>
              <Text style={{fontSize: 20, fontWeight: "bold"}}>{containersData.availableCount}</Text> Availble Containers
            </Text>
            <Text style={{color: "orange"}}>
              <Text style={{fontSize: 20, fontWeight: "bold"}}>{containersData.inUseCount}</Text> In-use Containers
            </Text>
          </View>

          <View style={styles.addListContainer}>
            <TouchableOpacity style={styles.addItem} onPress={openDrawer}>
              <Entypo name="add-to-list" size={16} color="#fff" />
              <Text style={styles.addItemText}>Add Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refresh} onPress={handleRefresh}>
              <Feather name="refresh-cw" size={16} color="gray" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>


				<View style={styles.tableContainer}>
					<View style={styles.headerRow}>
						<Text style={[styles.headerCell, styles.cell]}>Date</Text>
						<Text style={[styles.headerCell, styles.cell]}>Type</Text>
						<Text style={[styles.headerCell, styles.cell]}>
							No. of Containers
						</Text>
						<Text style={[styles.headerCell, styles.cell]}>Location</Text>
						<Text style={[styles.headerCell, styles.cell]}>Status</Text>
					</View>
					{transactionData.map((row, index) => (
						<TouchableOpacity
							key={index}
							style={styles.row}
							onPress={() => handleEditDrawer(row)}
						>
							<Text style={styles.cell}>
								{new Date(row.created_at).toLocaleDateString()}
							</Text>
							<Text style={styles.cell}>{row.transaction_type}</Text>
							<Text style={styles.cell}>{row.container_count}</Text>
							<Text style={styles.cell}>{row.delivery_location}</Text>
							<Text
								style={[
									styles.cell,
									{
										backgroundColor: row.is_delivered ? "green" : "orange",
										color: "white", // Ensure text is visible
										padding: 5,
										borderRadius: 999,
										fontWeight: "bold",
										textAlign: "center",
									},
								]}
							>
								{row.is_delivered ? "Completed" : "Pending"}
							</Text>
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

			{/* Add Transactiton Bottom Drawer */}
			{isVisible && (
				<GestureHandlerRootView style={styles.drawerContainer}>
					<TouchableWithoutFeedback onPress={handleOutsidePress}>
						<View style={styles.overlay} />
					</TouchableWithoutFeedback>
					<PanGestureHandler
						onGestureEvent={handleGesture}
						onEnded={handleGestureEnd}
					>
						<KeyboardAvoidingView
							behavior={
								Platform.OS === "android" || "ios" ? "padding" : "height"
							}
							style={styles.keyboardAvoidingView}
						>
							<Animated.View style={[styles.drawer, animatedStyle]}>
								<View style={styles.handle} />
								<Text style={styles.drawerContent}>Add transaction</Text>
								<View>
									<Text>Transaction Type:</Text>
									<DropDownPicker
										open={openType}
										value={transactionFormData.transaction_type} // Assuming this is a Boolean (true/false)
										items={[
											{ label: "Delivery", value: "Delivery" },
											{ label: "Refill", value: "Refill" },
										]}
										setOpen={setOpenType}
										setValue={(callback) =>
											setTransactionFormData((prevState) => ({
												...prevState,
												transaction_type: callback(prevState.transaction_type), // Ensure the value is updated
											}))
										}
										setItems={setItems}
										onChangeText={(text) =>
											handleInputChange("transaction_type", text)
										}
										style={{
											height: 40,
											paddingHorizontal: 12,
											borderColor: "gray",
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 28,
										}}
									/>
									<View
										style={{
											flexDirection: "row",
											justifyContent: "space-between",
										}}
									>
										<Text>Number of Containers:</Text>
										<TouchableOpacity
											style={{
												position: "absolute",
												top: 18,
												right: 5,
												zIndex: 10,
												borderRadius: 999,
												padding: 6,
											}}
											onPress={openCamera}
										>
											{loading ? (
												<ActivityIndicator color={"gray"} />
											) : (
												<Ionicons name="camera" size={24} color="gray" />
											)}
										</TouchableOpacity>
									</View>
									<TextInput
										style={{
											height: 40,
											paddingHorizontal: 12,
											borderColor: "gray",
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 10,
										}}
                    // value={scanResult.container_predictions["FIXED GALLON"]?.toString()} // Ensure it's a string
										value={transactionFormData.container_count?.toString()} // Ensure it's a string
										onChangeText={
											(text) =>
												handleInputChange(
													"container_count",
													parseInt(text.replace(/[^0-9]/g, "")) || 0
												) // Ensure it's a number
										}
										placeholder="Number of Containers"
										keyboardType="numeric" // Ensure numeric keyboard is shown
									/>
									<Text>Delivery Location:</Text>
									<TextInput
										style={{
											height: 40,
											paddingHorizontal: 12,
											borderColor: "gray",
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 10,
										}}
										value={transactionFormData.delivery_location} // Ensure it's a string
										onChangeText={(text) =>
											handleInputChange("delivery_location", text)
										}
										placeholder="Delivery Location"
									/>
									<Text>Status {"(e.g Delivered, In Progress)"}:</Text>
									<DropDownPicker
										open={open}
										value={transactionFormData.is_delivered} // Assuming this is a Boolean (true/false)
										items={[
											{ label: "Completed", value: true }, // Boolean true
											{ label: "Pending", value: false }, // Boolean false
										]}
										setOpen={setOpen}
										setValue={(callback) =>
											setTransactionFormData((prevState) => ({
												...prevState,
												is_delivered: callback(prevState.is_delivered), // Ensure the value is updated
											}))
										}
										setItems={setItems}
										style={{
											height: 40,
											paddingHorizontal: 12,
											borderColor: "gray",
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 28,
										}}
									/>
								</View>
								<TouchableOpacity
									style={styles.logoutButton}
									onPress={handleAddTransaction}
								>
									<Text style={styles.logoutButtonText}>Add Transaction</Text>
								</TouchableOpacity>
							</Animated.View>
						</KeyboardAvoidingView>
					</PanGestureHandler>
				</GestureHandlerRootView>
			)}

			{/* Edit Transactiton Bottom Drawer */}
			{isEditVisible && (
				<GestureHandlerRootView style={styles.drawerContainer}>
					<TouchableWithoutFeedback onPress={handleOutsidePress}>
						<View style={styles.overlay} />
					</TouchableWithoutFeedback>
					<PanGestureHandler
						onGestureEvent={handleGesture}
						onEnded={handleGestureEnd}
					>
						<KeyboardAvoidingView
							behavior={
								Platform.OS === "android" || "ios" ? "padding" : "height"
							}
							style={styles.keyboardAvoidingView}
						>
							<Animated.View style={[styles.drawer, animatedStyle]}>
								<View style={styles.handle} />
								<Text style={styles.drawerContent}>Edit transaction</Text>
								<View>
									<Text>Transaction Type:</Text>
									<DropDownPicker
										open={openType}
										value={transactionFormData.transaction_type} // Assuming this is a Boolean (true/false)
										items={[
											{ label: "Delivery", value: "Delivery" },
											{ label: "Refill", value: "Refill" },
										]}
										setOpen={setOpenType}
										setValue={(callback) =>
											setTransactionFormData((prevState) => ({
												...prevState,
												transaction_type: callback(prevState.transaction_type), // Ensure the value is updated
											}))
										}
										setItems={setItems}
										onChangeText={(text) =>
											handleInputChange("transaction_type", text)
										}
										style={{
											height: 40,
											paddingHorizontal: 12,
											borderColor: "gray",
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 28,
										}}
									/>
									<Text>Number of Containers:</Text>
									<TextInput
										style={{
											height: 40,
											paddingHorizontal: 12,
											borderColor: "gray",
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 10,
										}}
										value={transactionFormData.container_count?.toString()} // Ensure it's a string
										onChangeText={
											(text) =>
												handleInputChange(
													"container_count",
													parseInt(text.replace(/[^0-9]/g, "")) || 0
												) // Ensure it's a number
										}
										placeholder="Number of Containers"
										keyboardType="numeric" // Ensure numeric keyboard is shown
									/>
									<Text>Delivery Location:</Text>
									<TextInput
										style={{
											height: 40,
											paddingHorizontal: 12,
											borderColor: "gray",
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 10,
										}}
										value={transactionFormData.delivery_location}
										onChangeText={(text) =>
											handleInputChange("delivery_location", text)
										}
										placeholder="Delivery Location"
									/>
									<Text>Status {"(e.g Delivered, In Progress)"}:</Text>
									<DropDownPicker
										open={open}
										value={transactionFormData.is_delivered} // Assuming this is a Boolean (true/false)
										items={[
											{ label: "Completed", value: true }, // Boolean true
											{ label: "Pending", value: false }, // Boolean false
										]}
										setOpen={setOpen}
										setValue={(callback) =>
											setTransactionFormData((prevState) => ({
												...prevState,
												is_delivered: callback(prevState.is_delivered), // Ensure the value is updated
											}))
										}
										setItems={setItems}
										style={{
											height: 40,
											paddingHorizontal: 12,
											borderColor: "gray",
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 28,
										}}
									/>
								</View>
								<TouchableOpacity
									style={styles.logoutButton}
									onPress={handleEditTransaction}
								>
									<Text style={styles.logoutButtonText}>Edit Transaction</Text>
								</TouchableOpacity>
							</Animated.View>
						</KeyboardAvoidingView>
					</PanGestureHandler>
				</GestureHandlerRootView>
			)}

			{/* Scanned Result Bottom Drawer */}
			{scannedResult && isResultVisible && (
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
							<View style={styles.resultTextContainer}>
								<Text style={styles.resultFixedText}>
									<Image
										style={{ width: 30, height: 30 }}
										source={require("../assets/fixed_gallons.png")}
									/>{" "}
									Fixed Containers:
								</Text>
								<TextInput
									style={{
										padding: 12,
										borderColor: "gray",
										color: "red",
										fontSize: 16,
										borderWidth: 1,
										borderRadius: 8,
										marginBottom: 10,
									}}
									value={scannedResultFormData.fixed_gallons?.toString()} // Bind to state
									onChangeText={(text) =>
										handleScannedInputChange(
											"fixed_gallons",
											parseInt(text.replace(/[^0-9]/g, "")) || 0
										)
									}
									placeholder="Number of Fixed Containers"
									keyboardType="numeric"
									returnKeyType="done"
								/>

								<Text style={styles.resultDmgText}>
									<Image
										style={{ width: 30, height: 30 }}
										source={require("../assets/damaged_gallons.png")}
									/>{" "}
									Damaged Containers:
								</Text>
								<TextInput
									style={{
										padding: 12,
										borderColor: "gray",
										color: "red",
										fontSize: 16,
										borderWidth: 1,
										borderRadius: 8,
										marginBottom: 10,
									}}
									value={scannedResultFormData.broken_gallons?.toString()} // Bind to state
									onChangeText={(text) =>
										handleScannedInputChange(
											"broken_gallons",
											parseInt(text.replace(/[^0-9]/g, "")) || 0
										)
									}
									placeholder="Number of Broken Containers"
									keyboardType="numeric"
									returnKeyType="done"
								/>

								{/* <Text style={styles.resultMssText}>
									<Image
										style={{ width: 30, height: 30 }}
										source={require("../assets/missing_gallons.png")}
									/>{" "}
									Missing Containers:
								</Text>
                <TextInput
										style={{
											padding: 12,
											borderColor: "gray",
                      color: "red",
                      fontSize: 16,
											borderWidth: 1,
											borderRadius: 8,
											marginBottom: 10,
										}}
										value={scannedResult.container_predictions["MISSING GALLON"]?.toString()} // Ensure it's a string
										onChangeText={
											(text) =>
												handleInputChange(
													"container_count",
													parseInt(text.replace(/[^0-9]/g, "")) || 0 
												) // Ensure it's a number
										}
										placeholder="Number of Missing Containers"
										keyboardType="numeric" // Ensure numeric keyboard is shown
									>
                  </TextInput> */}
							</View>
							{/* <Text style={styles.resultText}>Image:</Text> */}
							<Image
								style={styles.scannedImage}
								source={{ uri: scannedResult.image }}
							/>
							{/* <TouchableOpacity style={styles.editButton}>
								<Text style={styles.editText}>Edit Result</Text>
							</TouchableOpacity> */}
							<TouchableOpacity
								style={styles.logoutButton}
								onPress={handleUpdateContainers}
							>
								<Text style={styles.logoutButtonText}>Submit Result</Text>
							</TouchableOpacity>
						</Animated.View>
					</PanGestureHandler>
				</GestureHandlerRootView>
			)}
		</View>
	);
};

export default Dashboard;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "start",
		backgroundColor: "#F2F4FF",
		paddingTop: 20, // Add padding to avoid overlap with the sticky header
		zIndex: 0,
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
		zIndex: 5, // Ensure the header is above other content
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
		marginBottom: 8,
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
  statistics: {
    flexDirection: "column",
    justifyContent: "space-between",
    // marginBottom: 16,
    // padding: 12,
    // backgroundColor: "#fff",
    // borderRadius: 12,
  },
	transactionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 12,
		marginBottom: 8,
	},
	headers: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "auto",
		paddingHorizontal: 12,
	},
	headersText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#8d8d8d",
	},
	transactions: {
		width: "100%",
		marginTop: 8,
	},
	transactionsTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#262626",
	},
	tabContainer: {
		flexDirection: "row",
		width: "100%",
		gap: 8,
		marginTop: 16,
	},
	tab: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		elevation: 3,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 6,
		marginBottom: 8,
		width: "auto",
		height: 30,
		backgroundColor: "#fff",
		borderRadius: 6,
	},
	transaction: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 8,
		padding: 12,
		height: "auto",
		backgroundColor: "#fff",
		borderRadius: 6,
	},
	transactionDesc: {
		// justifyContent: 'space-between',
	},
	transactionText: {
		color: "#262626",
	},
	addListContainer: {
		flexDirection: "column",
		alignItems: "flex-emd",
		justifyContent: "flex-end",
		gap: 12,
	},
	addItem: {
		flexDirection: "row",
		width: "auto",
		padding: 8,
		gap: 4,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 50,
		backgroundColor: "green",
	},
	addItemText: {
		color: "#fff",
		fontWeight: "medium",
	},
	refresh: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		justifyContent: "flex-end",
    marginBottom: 6,
	},
	refreshText: {
		color: "gray",
		fontWeight: "medium",
	},
	tableContainer: {
		backgroundColor: "#fff",
		borderRadius: 12,
		width: "100%",
		marginBottom: 16,
		marginTop: 10,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "flex-end",
		borderBottomWidth: 1,
		borderBottomColor: "#000",
		paddingVertical: 8,
		width: "100%",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		paddingVertical: 8,
		paddingHorizontal: 4,
		width: "100%",
	},
	headerCell: {
		fontWeight: "bold", // Make header text bold
		color: "#8d8d8d", // Header text color
	},
	cell: {
		flex: 1, // Equal width for all columns
		textAlign: "center", // Center-align text
		paddingHorizontal: 4, // Add some padding
		fontSize: 12,
	},
	cardContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginTop: 9,
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
		zIndex: 5,
	},

	keyboardAvoidingView: {
		flex: 1,
	},

	drawerContainer: {
		flex: 1,
		position: "absolute",
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
		height: SCREEN_HEIGHT * 0.8, // Adjust this value as needed
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
	},
	drawer: {
		position: "absolute",
		top: SCREEN_HEIGHT * 0.3, // Adjust this value as needed
		width: "100%",
		height: SCREEN_HEIGHT * 0.8, // Adjust this value as needed
		backgroundColor: "#fff",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		alignItems: "start",
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
		alignSelf: "center",
	},
	drawerContent: {
		flexDirection: "column",
		marginBottom: 4,
		fontSize: 24,
		fontWeight: "bold",
		color: "#8d8d8d",
		alignItems: "start",
		justifyContent: "start",
	},
	resultTextContainer: {
		flexDirection: "column",
		// justifyContent: 'space-between',
		marginTop: 10,
	},
	resultText: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#8D8D8D",
	},
	resultFixedText: {
		fontSize: 18,
		marginBottom: 10,
		fontWeight: "400",
		color: "green",
	},
	resultDmgText: {
		fontSize: 18,
		marginBottom: 10,
		fontWeight: "400",
		color: "red",
	},
	resultMssText: {
		fontSize: 18,
		marginBottom: 10,
		fontWeight: "400",
		color: "orange",
	},
	scannedImage: {
		width: "100%",
		height: "40%",
		borderRadius: 12,
		marginTop: 10,
		marginVertical: 20,
		zIndex: 10,
	},
	editButton: {
		backgroundColor: "#D0DADC",
		padding: 15,
		borderRadius: 5,
		alignItems: "center",
		width: "100%",
		marginBottom: 10,
	},
	editText: {
		color: "#6d6d6d",
		fontWeight: "bold",
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
