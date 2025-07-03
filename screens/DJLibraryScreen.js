import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import { useAppContext } from '../AppContext';

const DJLibraryScreen = ({ navigation }) => {
    const { savedSets, removeSavedSet } = useAppContext();

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('Clip', {
                        title: item.title,
                        videoId: item.videoId,
                    })
                }
            >
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSavedSet(item.id)}
                >
                    <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your DJ Library</Text>
            <FlatList
                data={savedSets}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.empty}>No DJ sets saved yet.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    item: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
    thumbnail: { width: 120, height: 67, marginRight: 10, borderRadius: 6 },
    title: { fontSize: 16, fontWeight: '500' },
    removeButton: {
        marginTop: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#FF3B30',
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 13,
    },
    empty: { textAlign: 'center', marginTop: 50, color: '#888' },
});

export default DJLibraryScreen;
