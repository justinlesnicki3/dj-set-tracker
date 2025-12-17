import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

/**
 * Subscribe button that works from Search:
 * - Ensures the DJ exists in `djs` (by name)
 * - Toggles a row in `subscriptions` for the logged-in user
 */
export default function SubscribeButton({ djName, thumbnailUrl, style, onSubbed, onUnsubbed }) {

  const [djId, setDjId] = useState(null);
  const [isSubbed, setIsSubbed] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizedName = (djName || '').trim();

  // Ensure DJ row exists + get djId
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        if (!normalizedName) return;

        // 1) try find
        const { data: existing, error: selErr } = await supabase
          .from('djs')
          .select('id')
          .eq('name', normalizedName)
          .maybeSingle();

        if (selErr) throw selErr;

        if (existing?.id) {
          if (isMounted) setDjId(existing.id);
          return;
        }

        // 2) insert if missing
        const { data: inserted, error: insErr } = await supabase
          .from('djs')
          .insert({ name: normalizedName, image_url: thumbnailUrl ?? null })
          .select('id')
          .single();

        if (insErr) throw insErr;
        if (isMounted) setDjId(inserted.id);
      } catch (e) {
        console.log('SubscribeButton ensureDjRow error:', e?.message);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [normalizedName, thumbnailUrl]);

  // Check subscription state
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user || !djId) return;

        const { data, error } = await supabase
          .from('subscriptions')
          .select('dj_id')
          .eq('user_id', auth.user.id)
          .eq('dj_id', djId)
          .maybeSingle();

        if (error) throw error;
        if (isMounted) setIsSubbed(!!data);
      } catch {
        // ignore
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [djId]);

  const toggle = async () => {
  setLoading(true);
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      Alert.alert('Sign in required', 'Please sign in to subscribe.');
      return;
    }
    if (!djId) return;

    if (isSubbed) {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', auth.user.id)
        .eq('dj_id', djId);

      if (error) throw error;

      setIsSubbed(false);
      onUnsubbed?.(); // ✅ updates trackedDJs
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert({ user_id: auth.user.id, dj_id: djId });

      if (error) throw error;

      setIsSubbed(true);
      onSubbed?.(); // ✅ updates trackedDJs
    }
  } catch (e) {
    Alert.alert('Subscription error', e?.message ?? 'Unknown error');
  } finally {
    setLoading(false);
  }
};

  return (
    <TouchableOpacity
      onPress={toggle}
      disabled={loading || !normalizedName}
      style={[
        {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 10,
          backgroundColor: isSubbed ? '#999' : '#33498e',
          opacity: loading ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: '#fff', fontWeight: '700' }}>
        {isSubbed ? 'Subscribed' : 'Subscribe'}
      </Text>

    </TouchableOpacity>
  );
}
