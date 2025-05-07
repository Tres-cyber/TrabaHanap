import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import io, { Socket } from "socket.io-client";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid login");
      }

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("currentUserId", data.user.id);
      await AsyncStorage.setItem("userType", data.user.userType);

      setCurrentUserId(data.user.id);
      setMessage("Login successful!");

      // ✅ Initialize the socket and register the user
      const newSocket = io(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000`,
        {
          auth: {
            token: data.token,
          },
        }
      );

      newSocket.on("connect", () => {
        // console.log("Connected to socket:", newSocket.id);
        newSocket.emit("register_user", data.user.id);
      });

      setSocket(newSocket);

      const isJobSeeker = data.user?.userType === "job-seeker";

      router.replace(
        isJobSeeker
          ? "/(main)/(tabs)/(job-seeker)/job-seeker-home"
          : "/(main)/(tabs)/(client)/client-home"
      );
    } catch (error) {
      // console.error("Login error:", error);
      setMessage("Login failed. Please check your credentials.");
    }
  };

  const handleForgotPassword = () => {
    router.push("/screen/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/(auth)/user-page");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>

        <Text style={styles.subtitle}>Enter Email and Password</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.inputLine} />
          <Text style={styles.inputLabel}>Email</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            {password.length > 0 && (
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.inputLine} />
          <View style={styles.passwordLabelContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        {message ? (
          <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
            {message}
          </Text>
        ) : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.noAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    paddingVertical: 8,
    fontSize: 16,
  },
  inputLine: {
    height: 1,
    backgroundColor: "#000",
    width: "100%",
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: "bold",
    color: "#000",
  },
  passwordLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotText: {
    color: "#2196F3",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#0A1747",
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  noAccountText: {
    fontSize: 14,
  },
  signUpText: {
    fontSize: 14,
    color: "#2196F3",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    padding: 8,
  },
});
