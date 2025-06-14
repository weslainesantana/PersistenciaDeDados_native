import { useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  List,
  PaperProvider,
  Switch,
  Text,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";
import myColors from "./assets/colors.json";
import myColorsDark from "./assets/colorsDark.json";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { openDBAsync, runAsync, getAllAsync } from "./db";

export default function App() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [theme, setTheme] = useState({
    ...DefaultTheme,
    myOwnProperty: true,
    colors: myColors.colors,
  });

  const saveTheme = async (value) => {
    try {
      await AsyncStorage.setItem("Tema", JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };

  async function loadDarkMode() {
    try {
      const value = await AsyncStorage.getItem("Tema");
      if (value !== null) {
        setIsSwitchOn(JSON.parse(value));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function getLocation() {
    setIsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão negada');
      setIsLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    console.log("Valores de localização:", latitude, longitude);

    try {
      const db = await openDBAsync();
      await runAsync(
        db, 
        'INSERT INTO locations (latitude, longitude) VALUES (?, ?)', 
        [latitude, longitude]
      );
      await loadLocations();
    } catch (e) {
      console.error("Erro ao salvar localização:", e);
    }
    setIsLoading(false);
  }

  async function loadLocations() {
    setIsLoading(true);
    try {
      const db = await openDBAsync();
      const result = await getAllAsync(db, 'SELECT * FROM locations ORDER BY timestamp DESC');
      setLocations(result);
    } catch (e) {
      console.error("Erro ao buscar localizações:", e);
    }
    setIsLoading(false);
  }

  async function loadLocations() {
    setIsLoading(true);
    try {
      const db = await openDBAsync();
      const result = await getAllAsync(db, 'SELECT * FROM locations ORDER BY timestamp DESC;');
      setLocations(result);
    } catch (e) {
      console.error("Erro ao buscar localizações:", e);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadDarkMode();
    loadLocations();
  }, []);

  useEffect(() => {
    setTheme({ ...theme, colors: isSwitchOn ? myColorsDark.colors : myColors.colors });
    saveTheme(isSwitchOn);
  }, [isSwitchOn]);

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title="My Location BASE" />
      </Appbar.Header>
      <View style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.containerDarkMode}>
          <Text>Dark Mode</Text>
          <Switch value={isSwitchOn} onValueChange={() => setIsSwitchOn(!isSwitchOn)} />
        </View>
        <Button
          style={styles.containerButton}
          icon="map"
          mode="contained"
          loading={isLoading}
          onPress={getLocation}
        >
          Capturar localização
        </Button>

        <FlatList
          style={styles.containerList}
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <List.Item
              title={`Localização ${item.id}`}
              description={`Lat: ${item.latitude} | Long: ${item.longitude}`}
            />
          )}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  containerDarkMode: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerButton: {
    margin: 10,
  },
  containerList: {
    margin: 10,
    height: "100%",
  },
});
