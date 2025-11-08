// lib/playerStore.js
import { create } from 'zustand'

/**
 * Track shape we’ll use across the app:
 * {
 *   id,            // your internal id (optional)
 *   title,
 *   videoId,       // YouTube id
 *   start,         // seconds (optional)
 *   end,           // seconds (optional)
 *   thumbnail,     // URL
 *   djName         // optional subtitle
 * }
 */

export const usePlayer = create((set, get) => ({
  current: null,        // current track object
  isPlaying: false,

  setTrack: (track) => set({ current: track, isPlaying: true }),
  play:      () => set({ isPlaying: true }),
  pause:     () => set({ isPlaying: false }),
  clear:     () => set({ current: null, isPlaying: false }),

  // optional helpers if you add a queue later:
  queue: [],
  setQueue: (q) => set({ queue: q }),
}))
