import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { useAppContext } from '../AppContext';
import { useNavigation } from '@react-navigation/native';

const djImages = {
  'disco lines': require('../assets/images/discolinesMYDJ.jpg'),
  'fisher': require('../assets/images/fisherMYDJ.jpg'),
  'vintage culture': require('../assets/images/vintagecultureMYDJ.jpg'),
  'odd mob': require('../assets/images/oddmobMYDJ.jpg'),
  'riordan': require('../assets/images/riordanMYDJ.jpg'),


};

const placeholder = require('../assets/images/placeholder.jpg');

const MyDJsScreen = () => {
    const { trackedDJs } = useAppContext();
    const navigation = useNavigation();

    const renderDJ = ({ item }) => {
    const image = djImages[item.name.toLowerCase()] || placeholder;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('DJDetail', { djName: item.name })}
        >
            <ImageBackground
                source={image}
                style={styles.djItem}
                imageStyle={{ borderRadius: 10 }}
            >
                <View style={styles.overlay}>
                    <Text style={styles.djName}>{item.name}</Text>
                    <Text style={styles.djDate}>
                        Subscribed: {new Date(item.subscribeDate).toLocaleDateString()}
                    </Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};


    return (
        <View style={styles.container}>
            <Text style={styles.header}>My DJs</Text>
            <FlatList
                data={trackedDJs}
                keyExtractor={(item) => item.name}
                renderItem={renderDJ}
                ListEmptyComponent={
                    <Text style={styles.empty}>You are not subscribed to any DJs yet.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    djItem: {
        height: 150,
        marginBottom: 15,
        justifyContent: 'flex-end',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    djName: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
    djDate: { fontSize: 14, color: '#ddd', marginTop: 2 },
    empty: { textAlign: 'center', marginTop: 50, color: '#888' },
});

export default MyDJsScreen; 
