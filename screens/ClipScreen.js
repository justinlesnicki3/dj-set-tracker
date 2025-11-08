import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { Picker } from '@react-native-picker/picker';

function ClipScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { title, videoId } = route.params;
  const { addLeak, playlists, addPlaylist, addClipToPlaylist } = useAppContext();

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [clipTitle, setClipTitle] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [showForm, setShowForm] = useState(false);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(-20)).current;

  const animateFormIn = () => {
    setShowForm(true);
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formTranslate, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateFormOut = () => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslate, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowForm(false);
      setStart('');
      setEnd('');
      setClipTitle('');
      setNewPlaylistName('');
      setSelectedPlaylist('');
    });
  };

  const handleSaveLeak = () => {
    if (!start || !end || !clipTitle.trim()) {
      Alert.alert('Error', 'Please enter a title, start time, and end time');
      return;
    }

    const leak = {
      id: `${videoId}-${start}-${end}`,
      title: clipTitle.trim(),
      djSetTitle: title,
      videoId,
      start,
      end,
    };

    addLeak(leak);

    const playlistName = newPlaylistName.trim() || selectedPlaylist;
    if (playlistName) {
      if (!playlists.some(p => p.name === playlistName)) {
        addPlaylist(playlistName);
      }
      addClipToPlaylist(playlistName, leak);
    }

    Alert.alert('Saved', `Clip saved${playlistName ? ` to "${playlistName}"` : ''}`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* Thumbnail */}
      <Image
        source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
        style={styles.thumbnail}
      />

      {!showForm && (
        <TouchableOpacity style={styles.makeClipButton} onPress={animateFormIn}>
          <Text style={styles.makeClipText}>+ Make Clip</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <Animated.View
          style={{
            opacity: formOpacity,
            transform: [{ translateY: formTranslate }],
          }}
        >
          <Text style={styles.label}>Clip Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter song or clip name"
            value={clipTitle}
            onChangeText={setClipTitle}
          />

          <Text style={styles.label}>Start Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3:24"
            value={start}
            onChangeText={setStart}
          />

          <Text style={styles.label}>End Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5:36"
            value={end}
            onChangeText={setEnd}
          />

          <Text style={styles.label}>New Playlist Name (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. My Favorites"
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
          />

          {playlists.length > 0 && (
            <>
              <Text style={styles.or}>or select existing playlist</Text>

              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={styles.compactSelect}
                  onPress={() => {
                    const names = playlists.map(p => p.name);
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        title: 'Select a playlist',
                        options: [...names, 'Cancel'],
                        cancelButtonIndex: names.length,
                      },
                      (buttonIndex) => {
                        if (buttonIndex < names.length) {
                          setSelectedPlaylist(names[buttonIndex]);
                          setNewPlaylistName('');
                        }
                      }
                    );
                  }}
                >
                  <Text style={styles.compactSelectText}>
                    {selectedPlaylist || 'Select a playlist...'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Picker
                  selectedValue={selectedPlaylist}
                  onValueChange={(v) => {
                    setSelectedPlaylist(v);
                    setNewPlaylistName('');
                  }}
                  mode="dropdown"
                  style={styles.androidPicker}
                  dropdownIconColor="#555"
                >
                  <Picker.Item label="Select a playlist..." value="" />
                  {playlists.map(p => (
                    <Picker.Item key={p.name} label={p.name} value={p.name} />
                  ))}
                </Picker>
              )}
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveLeak}>
            <Text style={styles.saveButtonText}>Save Clip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={animateFormOut}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  thumbnail: { width: '100%', height: 200, borderRadius: 12, marginBottom: 20 },
  makeClipButton: {
    backgroundColor: '#33498e',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  makeClipText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  or: { textAlign: 'center', marginVertical: 10, color: '#888' },
  saveButton: {
    backgroundColor: '#33498e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { paddingVertical: 10, alignItems: 'center', marginTop: 10 },
  cancelText: { color: '#888', fontSize: 15 },
  compactSelect: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 20,
  },
  compactSelectText: { fontSize: 16, color: '#333' },
  androidPicker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 20,
    height: 44,
  },
});

export default ClipScreen;