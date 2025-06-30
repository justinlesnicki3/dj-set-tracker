import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppContext } from '../AppContext';

const MyDJsScreen = () => {
    const { trackedDJs } = useAppContext();

    const renderDJ = ({ item }) => (
        <View style={styles.djItem}>
            <Text style={styles.djName}>{item.name}</Text>
            <Text style={styles.djDate}>Subscribed: {new Date(item.subscribeDate).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My DJs</Text>
            <FlatList
                data={trackedDJs}
                keyExtractor={(item) => item.name}
                renderItem={renderDJ}
                ListEmptyComponent={<Text style={styles.empty}>You are not subscribed to any DJs yet.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    djItem: {
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 6,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    djName: { fontSize: 18, fontWeight: 'bold' },
    djDate: { fontSize: 14, color: '#666', marginTop: 4 },
    empty: { textAlign: 'center', marginTop: 50, color: '#888' },
});

export default MyDJsScreen;
