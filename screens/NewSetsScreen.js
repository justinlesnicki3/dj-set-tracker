import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { useAppContext } from '../AppContext';

import {
  sortSetsByNewest,
  formatPostedDate,
  keyForSet,
  refreshNewSetsFlow,
} from '../services/newSetsService';

function NewSetsScreen() {
  const { newSets, trackedDJs, refreshTrackedDJs } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);

  const sortedSets = sortSetsByNewest(newSets);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshNewSetsFlow({ trackedDJs, refreshTrackedDJs });
    } finally {
      setRefreshing(false);
    }
  }, [trackedDJs, refreshTrackedDJs]);

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        style={styles.list} // makes list fill the screen
        data={sortedSets}
        keyExtractor={keyForSet}
        renderItem={renderSet}
        ListHeaderComponent={<Text style={styles.header}>New Sets</Text>}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>No new sets yet</Text>
          </View>
        }
        // ✅ pull-to-refresh
        refreshing={refreshing}
        onRefresh={onRefresh}
        // ✅ makes the "scroll area" the full page even when short/empty
        contentContainerStyle={styles.content}
        // ✅ iOS: allow pull even when not scrollable
        alwaysBounceVertical
        bounces
        // ✅ Android: allow overscroll/pull gesture even when short
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  list: { flex: 1 },

  // padding moved here so the FlatList owns the whole gesture surface
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 30,
  },

  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },

  item: { flexDirection: 'row', marginBottom: 15 },
  thumbnail: { width: 120, height: 67, borderRadius: 6, marginRight: 10 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', fontSize: 14, marginTop: 4 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#888' },
});

export default NewSetsScreen;
