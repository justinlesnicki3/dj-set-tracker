import React from 'react';
import {View, Text, FlatList, StyleSheet, Image, TouchableOpacity} from 'react-native';
import { useAppContext } from '../AppContext';



const DJLibraryScreen = ({ navigation }) => {
    
    const {djLibrary} = useAppContext();

    const renderItem = ({item}) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Clip', { title: item.title})}
        >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your DJ Library</Text>
            <FlatList
                data={djLibrary}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.empty}>No DJ sets saved yet.</Text>
            }
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