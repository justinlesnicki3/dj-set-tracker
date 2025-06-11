import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

const HomeScreen = () => {
    const [djName, setDjName] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { addTrackedDJ, trackedDJs } = useAppContext();

    const searchDJ = async () => {
        setLoading(true);
        console.log('Searching for:', djName);
        setTimeout(() => {
            setResults([
        { id: '1', title: `Sample set from ${djName}`, videoId: 'abc123' },
        { id: '2', title: `Another set by ${djName}`, videoId: 'def456' },
      ]);
      setLoading(false);
    }, 1500);
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity
        style={styles.resultItem}
        onPress={() => navigation.navigate('Library', { videoId: item.videoId})}>
            <Text style={styles.resultText}>{item.title}</Text>
        </TouchableOpacity>
  );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Find DJ Sets</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter DJ name"
            value={djName}
            onChangeText={setDjName}
            />
            <Button title="Search" onPress={searchDJ} disabled={loading || !djName.trim()}/>
            <Button
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
                <Button title='Go to Library' onPress={() => navigation.navigate('Library')} />
                <Button title='Go to my Leaks' onPress={() => navigation.navigate('MyLeaks')} />
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
        padding: 12,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
        marginBottom: 6,
    },
    resultText: {fontSize: 16},
    emptyText: {textAlign: 'center', marginTop: 20, color: '#888'},
});

export default HomeScreen;