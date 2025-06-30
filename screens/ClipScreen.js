import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

const ClipScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { title, videoId } = route.params;
    const { addLeak } = useAppContext();

    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    const handleSaveLeak = () => {
        if (!start || !end) {
            Alert.alert('Error', 'Start and End times are required');
            return;
        }

        const leak = {
            id: `${videoId}-${start}-${end}`,
            title: `${title} (Clip)`,
            djSetTitle: title,
            videoId,
            start,
            end,
        };

        addLeak(leak);
        Alert.alert('Saved', 'Clip saved to My Leaks');
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <WebView
                source={{ uri: `https://www.youtube.com/embed/${videoId}` }}
                style={styles.video}
            />
            <TextInput
                style={styles.input}
                placeholder="Start time (e.g. 3:24)"
                value={start}
                onChangeText={setStart}
            />
            <TextInput
                style={styles.input}
                placeholder="End time (e.g. 5:36)"
                value={end}
                onChangeText={setEnd}
            />
            <Button title="Save Clip" onPress={handleSaveLeak} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    video: { height: 200, marginBottom: 20 },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
});

export default ClipScreen;
