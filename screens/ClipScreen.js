import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useAppContext } from '../AppContext';
import YoutubePlayer from "react-native-youtube-iframe";
import { useRef } from 'react';


const ClipScreen = ({ route, navigation }) => {
    const { title, videoId } = route.params;
    const playerRef = useRef();
    const [start, setStart] = useState('');

    const [end, setEnd] = useState('');
    const { addLeak } = useAppContext();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Clipping from: {title}</Text>
            <YoutubePlayer ref={playerRef} height={200} play={false} videoId={videoId} />
            <TextInput placeholder='Start Time (e.g. 3:24)' value={start} onChangeText={setStart} style={styles.input} />
            <TextInput placeholder='End Time (e.g. 5:36)' value={end} onChangeText={setEnd} style={styles.input} />
            <Button
                title="Set Start"
                onPress={async () => {
                    const currentTime = await playerRef.current?.getCurrentTime();
                    setStart(formatTime(currentTime));
                }} 
            />

            <Button
                title="Set End"
                onPress={async () => {
                    const currentTime = await playerRef.current?.getCurrentTime();
                    setEnd(formatTime(currentTime));
                }}
            />               

            <Button title="Save to My Leaks" onPress={() => {
                addLeak({
                    id: Date.now().toString(),
                    djSetTitle: title,
                    start,
                    end
                });
                navigation.goBack();
            }} 
        />
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

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default ClipScreen;