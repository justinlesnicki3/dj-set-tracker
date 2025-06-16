import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const ClipScreen = ({ route, navigation }) => {
    const { title } = route.params;
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Clipping from: {title}</Text>
            <TextInput placeholder='Start Time (e.g. 3:24)' value={start} onChangeText={setStart} style={styles.input} />
            <TextInput placeholder='End Time (e.g. 5:36)' value={end} onChangeText={setEnd} style={styles.input} />
            <Button title="Save to My Leaks" onPress={() => {
                // Save to context or console.log for now
                navigation.goBack();
            }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {padding: 20},
    title: {fontSize: 20, fontWeight: 'bold', marginBottom: 20},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 6,
    },
});

export default ClipScreen;