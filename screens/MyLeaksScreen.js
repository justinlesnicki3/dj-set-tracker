import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppContext } from '../AppContext';


const sampleLeaks = [
    { id: '1', title: "Unreleased Track 1", djSet: 'Carl Cox Live Set', start: '3:24', end: '5.36' },
    { id: '2', title: 'Sneak Peek Track 2,', djSet: 'Charlotte de Witte Set', start: '12:10', end: '14:05'},
];

const MyLeaksScreen = () => {
    const renderLeak = ({ item }) => (
        <TouchableOpacity style={styles.leakItem} onPress={() => {/* Play clip or show details */}}>
            <Text style={styles.leakTitle}>{item.title}</Text>
            <Text style={styles.leakInfo}>{`${item.djSet} | ${item.start} - ${item.end}`}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Leaks</Text>
            <FlatList
            data={sampleLeaks}
            keyExtractor={(item) => item.id}
            renderItem={renderLeak}
            ListEmptyComponent={<Text style={styles.empty}>No leaks saved yet</Text>}
            />
        </View>
    );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  leakItem: { padding: 15, backgroundColor: '#f2f2f2', borderRadius: 8, marginBottom: 12 },
  leakTitle: { fontSize: 18, fontWeight: '600' },
  leakInfo: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },
});

export default MyLeaksScreen;

