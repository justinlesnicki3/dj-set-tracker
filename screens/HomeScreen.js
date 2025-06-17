import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { Image } from 'react-native';
import { searchDJSets } from '../services/youtube';
import CustomButton from '../components/CustomButton'; 

const HomeScreen = () => {
    const [djName, setDjName] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { addTrackedDJ, trackedDJs } = useAppContext();

    const searchDJ = async () => {
        setLoading(true);
        console.log('Searching for:', djName);
        const results = await searchDJSets(djName);
        console.log("✅ YouTube API Results:", results);
        setResults(results);
        setLoading(false);

  };

    const renderResultItem = ({ item }) => (
  <TouchableOpacity
    style={styles.resultItem}
    onPress={() => navigation.navigate('Library', { videoId: item.videoId })}
  >
    {item.thumbnail && (
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.resultThumbnail}
      />
    )}
    <Text style={styles.resultText}>{item.title}</Text>
  </TouchableOpacity>
);

console.log("HomeScreen rendered");


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Find DJ Sets</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter DJ name"
            value={djName}
            onChangeText={setDjName}
            />
            <CustomButton title="Search" onPress={searchDJ} disabled={loading || !djName.trim()}/>
            <CustomButton
                title='Track this DJ'
                onPress={() => addTrackedDJ(djName)}
                disabled={!djName.trim() || trackedDJs.includes(djName.toLowerCase())} 
            />
            {trackedDJs.includes(djName.toLowerCase()) && (
                <Text style={{color: 'green', marginTop: 6}}>
                    You're tracking {djName}
                </Text>
            )}
            <View style={{marginVertical: 10}}>
                <CustomButton title='Go to Library' onPress={() => navigation.navigate('Library')} />
                <CustomButton title='Go to my Leaks' onPress={() => navigation.navigate('MyLeaks')} />
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" />
            ) : (
                <FlatList
                 data={results}
                 keyExtractor={(item) => item.id}
                 renderItem={renderResultItem}
                 ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No results found</Text>
                 )}
                />
             )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, backgroundColor: '#fff'},
    title: {fontSize: 24, fontWeight: 'bold', marginBottom: 10},
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 12,
        marginBottom: 10,
        borderRadius: 6,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
        marginBottom: 6,
    },
    resultThumbnail: {
        width: 100,
        height: 56,
        borderRadius: 6,
        marginRight: 10,
    },
    resultText: {
        fontSize: 16,
        flexShrink: 1,
    },

    emptyText: {textAlign: 'center', marginTop: 20, color: '#888'},

});

export default HomeScreen;