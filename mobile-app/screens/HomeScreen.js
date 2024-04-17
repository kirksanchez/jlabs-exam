import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

const HomeScreen = ({ navigation }) => {
  const [ipAddress, setIpAddress] = useState('');
  const [geoInfo, setGeoInfo] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadGeoInfo();
    });

    return unsubscribe;
  }, [navigation]);

  const loadGeoInfo = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          fetchGeoInfo('json', token);
        } else {
          Alert.alert(
            'No Internet Connection',
            'Check your network and try again.'
          );
        }
      });
    } else {
      navigation.navigate('Login');
    }
  };

  const fetchGeoInfo = async (ip, token) => {
    try {
      const response = await axios.get(`https://ipinfo.io/${ip}/geo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGeoInfo(response.data);
      if (ip !== 'json') {
        setHistory([...history, ip]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to retrieve IP information.');
    }
  };

  const handleSearch = async () => {
    if (isValidIp(ipAddress)) {
      const token = await AsyncStorage.getItem('userToken');
      fetchGeoInfo(ipAddress, token);
    } else {
      Alert.alert('Invalid IP', 'Please enter a valid IP address.');
    }
  };

  const isValidIp = (ip) => {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ip
    );
  };

  return (
    <View style={styles.container}>
      {geoInfo && (
        <View>
          <Text>IP: {geoInfo.ip}</Text>
          <Text>
            Location: {geoInfo.city}, {geoInfo.region}, {geoInfo.country}
          </Text>
        </View>
      )}
      <TextInput
        placeholder='Enter IP address'
        value={ipAddress}
        onChangeText={setIpAddress}
        style={styles.input}
        keyboardType='numeric'
      />
      <Button title='Search' onPress={handleSearch} />
      <Button title='Clear' onPress={() => setIpAddress('')} />
      <View>
        <Text>Search History:</Text>
        {history.map((ip, index) => (
          <Text key={index}>{ip}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default HomeScreen;
