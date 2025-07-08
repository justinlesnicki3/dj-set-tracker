import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { Picker } from '@react-native-picker/picker'; 

const ClipScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { title, videoId } = route.params;
    const { addLeak, playlists, addPlaylist, addClipToPlaylist } = useAppContext();

    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [selectedPlaylist, setSelectedPlaylist] = useState('');

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

        const playlistName = newPlaylistName.trim() || selectedPlaylist;
        if (playlistName) {
            if(!playlists.some(p => p.name === playlistName)) {
                addPlaylist(playlistName);
            }
            addClipToPlaylist(playlistName, leak);
        }

        Alert.alert('Saved', `Clip saved${playlistName ?  ` to "${playlistName}"` : ''}`);
        navigation.goBack();

    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <WebView source={{ uri: `https://www.youtube.com/embed/${videoId}` }} style={styles.video} />

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

            <Text style={styles.subHeader}>Add to Playlist</Text>

            <TextInput
                style={styles.input}
                placeholder="New playlist name (optional)"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
            />

            {playlists.length > 0 && (
                <>
                <Text style={styles.or}>OR select existing:</Text>
                <Picker
                    selectedValue={selectedPlaylist}
                    onValueChange={(itemValue) => setSelectedPlaylist(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select a playlist..." value="" />
                    {playlists.map((p) => (
                        <Picker.Item key={p.name} label={p.name} value={p.name} />
                    ))}
                </Picker>
            </>
        )}

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
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  or: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#888',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
});

export default ClipScreen;
