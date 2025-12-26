import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
} from 'react-native';
import { useAppContext } from '../AppContext';

import {
  buildClipNavParams,
  removeSavedSetById,
  keyForSavedSet,
} from '../services/djLibraryService';

function DJLibraryScreen({ navigation }) {
  const { savedSets, removeSavedSet } = useAppContext();

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Clip', buildClipNavParams(item))}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeSavedSetById(removeSavedSet, item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Your DJ Library</Text>
      <FlatList
        data={savedSets}
        keyExtractor={keyForSavedSet}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No DJ sets saved yet.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  item: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  thumbnail: {
    width: 120,
    height: 67,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  title: { fontSize: 16, fontWeight: '500' },
  removeButton: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  removeButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },
});

export default DJLibraryScreen;
