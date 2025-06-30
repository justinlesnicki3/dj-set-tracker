import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Keyboard,
    ActivityIndicator, // ✅ Import this
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { DJ_DATABASE } from '../djData';

const SearchScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigation = useNavigation();
    const { addTrackedDJ, trackedDJs, loading } = useAppContext(); // ✅ include loading

    const filteredDJs = DJ_DATABASE.filter(dj =>
        dj.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const handleSubscribe = (djName) => {
        const djData = DJ_DATABASE.find(dj => dj.name.toLowerCase() === djName.toLowerCase());
        if (djData) {
            addTrackedDJ(djData);
            Keyboard.dismiss();
        }
    };

    const isSubscribed = (djName) => {
        return trackedDJs.some(dj => dj.name === djName.trim().toLowerCase());
    };

    const renderDJItem = ({ item }) => (
        <View style={styles.djCard}>
            <Image source={item.image} style={styles.thumbnail} />
            <Text style={styles.djName}>{item.name}</Text>
            <TouchableOpacity
                style={[styles.subscribeButton, isSubscribed(item.name) && styles.disabledButton]}
                onPress={() => handleSubscribe(item.name)}
                disabled={isSubscribed(item.name)}
            >
                <Text style={styles.subscribeButtonText}>
                    {isSubscribed(item.name) ? 'Subscribed' : 'Subscribe'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    // ✅ Show loading screen while AppContext is still initializing
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10 }}>Loading DJ data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search for a DJ</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter DJ name"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            {searchTerm.trim().length > 0 ? (
                <FlatList
                    data={filteredDJs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDJItem}
                    ListEmptyComponent={<Text style={styles.empty}>No DJs found</Text>}
                />
            ) : (
                <Text style={styles.instruction}>Start typing a DJ name to search.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 12,
        marginBottom: 20,
        borderRadius: 6,
    },
    djCard: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    djName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subscribeButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    subscribeButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: '#888',
        fontSize: 16,
    },
    instruction: {
        textAlign: 'center',
        marginTop: 40,
        color: '#aaa',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default SearchScreen;
