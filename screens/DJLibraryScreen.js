import React from 'react';
import {View, Text, FlatList, StyleSheet, Image, TouchableOpacity} from 'react-native';

const sampleLibrary = [
    {
        id: 'abc123',
        title: 'Carl Cox Live Set - Ibiza 2024',
        thumbnail: 'https://i.ytimg.com/vi/abc123/hqdefault.jpg',
    },
    {
        id: 'def456',
        title: 'Charlotte de Witte - Boiler Room',
        thumbnail: 'https://i.ytimg.com/vi/def456/hqdefault.jpg',
    },
];

const DJLibraryScreen = ({ navigation }) => {
    const renderItem = ({ item }) => (
        <TouchableOpacity style = {StyleSheet.item} onPress={() => {/* Navigate to details or player */}}>
            <Image source={{ uri: item.thumbnail }} style={StyleSheet.thumbnail} />
            <Text style={StyleSheet.title}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={StyleSheet.container}>
            <Text style={StyleSheet.header}>Your DJ Library</Text>
            <FlatList
            data={sampleLibrary}
            keyExtractor={(Item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={StyleSheet.empty}>No DJ sets saved yet</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20, backgroundColor: '#fff'},
    header: {fontSize: 24, fontWeight: 'bold', marginBottom: 15},
    item: {flexDirection: 'row', marginBottom: 15, alignItems: 'center'},
    thumbnail: {width: 120, height: 67, marginRight: 10, borderRadius: 6},
    title: {flex: 1, fontSize: 16},
    empty: {textAlign: 'center', marginTop: 50, color: '#888'},
});

export default DJLibraryScreen;