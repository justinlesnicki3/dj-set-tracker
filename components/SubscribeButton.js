import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { ensureDjRow } from '../services/djDetailService';

export default function SubscribeButton({
  djName,
  thumbnailUrl,
  style,
  onSubbed,
  onUnsubbed,
}) {
  const canonicalName = useMemo(
    () => (djName || '').trim().toLowerCase(),
    [djName]
  );

  const [djId, setDjId] = useState(null);
  const [isSubbed, setIsSubbed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ensure DJ row exists + get djId (canonical name!)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!canonicalName) return;

        const id = await ensureDjRow({
          name: canonicalName,           // ✅ force canonical
          thumbnailUrl: thumbnailUrl ?? null,
        });

        if (alive) setDjId(id || null);
      } catch (e) {
        console.log('SubscribeButton ensureDjRow error:', e?.message ?? e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [canonicalName, thumbnailUrl]);

  // Check subscription state
  useEffect(() => {
    let alive = true;

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
        if (alive) setIsSubbed(!!data);
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
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
        onUnsubbed?.();
        return;
      }

      // ✅ upsert prevents "subscriptions_pkey" crash if something double-fires
      const { error } = await supabase
        .from('subscriptions')
        .upsert(
          { user_id: auth.user.id, dj_id: djId },
          { onConflict: 'user_id,dj_id' }
        );

      if (error) throw error;

      setIsSubbed(true);
      onSubbed?.();
    } catch (e) {
      Alert.alert('Subscription error', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={(e) => {
        e?.stopPropagation?.(); // prevents parent card press
        toggle();
      }}
      onPressIn={(e) => e?.stopPropagation?.()}
      disabled={loading || !canonicalName}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      style={[
        {
          alignSelf: 'flex-start',
          flexGrow: 0,
          flexShrink: 0,
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
