import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { DJ_DATABASE } from '../djData';

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();
  const { addTrackedDJ, trackedDJs, loading, removeTrackedDJ } = useAppContext();

  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const resultsTranslate = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (searchTerm.trim().length === 0) return;

    resultsOpacity.setValue(0);
    resultsTranslate.setValue(12);

    Animated.parallel([
      Animated.timing(resultsOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(resultsTranslate, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [searchTerm]);

  const filteredDJs = DJ_DATABASE.filter((dj) =>
    dj.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleSubscribe = (djName) => {
    const djData = DJ_DATABASE.find(
      (dj) => dj.name.toLowerCase() === djName.toLowerCase()
    );
    if (djData) {
      addTrackedDJ(djData);
      Keyboard.dismiss();
    }
  };

  const handleUnsubscribe = (djName) => {
    removeTrackedDJ(djName.toLowerCase());
  };

  const isSubscribed = (djName) =>
    trackedDJs.some((dj) => dj.name === djName.trim().toLowerCase());

  const handleViewDJ = (djName) => {
    navigation.navigate('DJDetail', { djName });
  };

  const renderDJItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleViewDJ(item.name)}
      style={styles.card}
    >
      <Image source={item.image} style={styles.thumbnail} />
      <View style={{ flex: 1 }}>
        <Text style={styles.djName}>{item.name}</Text>
        <TouchableOpacity
            onPress={() =>
            isSubscribed(item.name)
            ? handleUnsubscribe(item.name)
            : handleSubscribe(item.name)
        }
    >
            <Text style={[styles.subscribeButton, isSubscribed(item.name) ? styles.unsubscribe : styles.subscribe]}>
                {isSubscribed(item.name) ? 'Unsubscribe' : 'Subscribe'}
            </Text>
        </TouchableOpacity>

      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#33498e" />
        <Text style={{ marginTop: 10, color: '#333' }}>Loading DJ data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenWrapper}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
      />

      <LinearGradient
        colors={["#dfe9f3", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>Search DJs</Text>

        <View style={styles.searchBarShadowWrapper}>
          <LinearGradient
            colors={["rgba(255,255,255,0.9)", "rgba(240,240,240,0.95)"]}
            style={styles.searchBar}
          >
            <TextInput
              placeholder="Type DJ name..."
              placeholderTextColor="#555"
              style={styles.input}
              value={searchTerm}
              onChangeText={setSearchTerm}
              returnKeyType="search"
            />
          </LinearGradient>
        </View>
      </LinearGradient>

      {searchTerm.trim().length === 0 ? (
        <View style={styles.instructionWrapper}>
          <Text style={styles.instructionText}>Start typing a DJ name…</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredDJs}
          keyExtractor={(item) => item.id}
          renderItem={renderDJItem}
          contentContainerStyle={{ padding: 20, paddingTop: 10 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No DJs found</Text>
          }
          style={{
            flex: 1,
            opacity: resultsOpacity,
            transform: [{ translateY: resultsTranslate }],
          }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  searchBarShadowWrapper: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderRadius: 25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 14,
  },
  djName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  djSubText: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  instructionWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#777',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  subscribeButton: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    textAlign: 'center',
    fontWeight: '600',
    overflow: 'hidden',
    alignSelf: 'flex-start',
    },
    subscribe: {
        backgroundColor: '#33498e',
        color: '#fff',
    },
    unsubscribe: {
        backgroundColor: '#ddd',
        color: '#333',
    },

});

export default SearchScreen;
