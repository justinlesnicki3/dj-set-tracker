import React from 'react';
import {View, Text, FlatList, StyleSheet, Image} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

const DJDetailScreen = () => {
    const {params} = useRoute();
    const {djName} = params;
    const {djLibrary} = useAppContext();

    const pastSets = djLibrary.filter(set => set.title.toLowerCase().includes(djName.toLowerCase()));

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{djName}'s Past Sets</Text>
            <FlatList
                data={djSets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.setItem}>
                        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.date}>Posted: {new Date(item.publishDate).toLocaleDateString()}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No past sets found.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    setItem: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
    thumbnail: { width: 100, height: 60, marginRight: 10, borderRadius: 5 },
    title: { fontSize: 16 },
});

export default DJDetailScreen;