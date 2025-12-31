import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SubscribeButton({
  djName,
  thumbnailUrl,
  style,
  onSubbed,
  onUnsubbed,
}) {
  const [djId, setDjId] = useState(null);
  const [isSubbed, setIsSubbed] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizedName = (djName || '').trim();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        if (!normalizedName) return;

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
        onUnsubbed?.();
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert({ user_id: auth.user.id, dj_id: djId });

        if (error) throw error;

        setIsSubbed(true);
        onSubbed?.();
      }
    } catch (e) {
      Alert.alert('Subscription error', e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={(e) => {
        e?.stopPropagation?.(); // ✅ prevents triggering parent card press
        toggle();
      }}
      onPressIn={(e) => e?.stopPropagation?.()} // ✅ extra safety
      disabled={loading || !normalizedName}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }} // ✅ tiny tap area (not huge)
      style={[
        {
          alignSelf: 'flex-start', // ✅ keeps it tight
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
