// components/MiniPlayer.js
import { View, Text, Pressable, Image } from 'react-native'
import { usePlayer } from '../lib/playerStore'

export default function MiniPlayer({ onOpen }) {
  const { current, isPlaying, play, pause } = usePlayer()

  if (!current) return null

  return (
    <Pressable
      onPress={onOpen}
      style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        paddingHorizontal: 14, paddingVertical: 10,
        backgroundColor: '#111',
        borderTopLeftRadius: 14, borderTopRightRadius: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        elevation: 12, 
        shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: -2 },
      }}
    >
      <Image
        source={{ uri: current.thumbnail }}
        style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#222' }}
      />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ color: '#fff', fontWeight: '700' }}>{current.title}</Text>
        {!!current.djName && (
          <Text numberOfLines={1} style={{ color: '#aaa', fontSize: 12 }}>{current.djName}</Text>
        )}
      </View>

      <Pressable
        onPress={(e) => { e.stopPropagation(); isPlaying ? pause() : play() }}
        style={{ padding: 8, minWidth: 40, alignItems: 'center' }}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      >
        <Text style={{ color: '#fff', fontSize: 18 }}>{isPlaying ? '⏸' : '▶️'}</Text>
      </Pressable>
    </Pressable>
  )
}
