import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { useAppContext } from '../AppContext';

import {
  sortSetsByNewest,
  formatPostedDate,
  keyForSet,
} from '../services/newSetsService';

function NewSetsScreen() {
  const { newSets } = useAppContext();

  const sortedSets = sortSetsByNewest(newSets);

  const renderSet = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>{item.djName}</Text>
        <Text style={styles.meta}>Posted: {formatPostedDate(item.publishDate)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>New Sets</Text>
      <FlatList
        data={sortedSets}
        keyExtractor={keyForSet}
        renderItem={renderSet}
        ListEmptyComponent={<Text style={styles.empty}>No new sets yet</Text>}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  item: { flexDirection: 'row', marginBottom: 15 },
  thumbnail: { width: 120, height: 67, borderRadius: 6, marginRight: 10 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', fontSize: 14, marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },
});

export default NewSetsScreen;
