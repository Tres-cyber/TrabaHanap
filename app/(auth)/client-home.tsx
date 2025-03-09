import { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Define a TypeScript interface for the user data
interface User {
  firstName: string;
  lastName: string;
  emailAddress: string;
  barangay: string;
  street: string;
  userType: string;
}

const JobSeeker = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigation.navigate("sign_in" as never); // Navigate to Login screen
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigation.navigate("sign_in" as never);
      return;
    }

    fetch("http://localhost:3000/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Token expired or unauthorized");
        }
        return res.json();
      })
      .then((data: User) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user details:", err.message);
        localStorage.removeItem("token");
        navigation.navigate("sign_in" as never);
      });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to eDiskarte Client-Side</Text>
      <Text style={styles.subtitle}>Profile Details</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : user ? (
        <View style={styles.profile}>
          <Text>Name: {`${user.firstName} ${user.lastName}`}</Text>
          <Text>Email: {user.emailAddress}</Text>
          <Text>Barangay: {user.barangay}</Text>
          <Text>Street: {user.street}</Text>
          <Text>User Type: {user.userType}</Text>
        </View>
      ) : (
        <Text>No user details found.</Text>
      )}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default JobSeeker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  profile: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 20,
  },
});
