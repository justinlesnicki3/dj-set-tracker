import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function signUp() {
        const {error} = await supabase.auth.signUp({email, password});
        if (error) Alert.alert('Sign up error', error.message);
        else Alert.alert('Check your email to confirm your account');
    }

    async function signIn() {
        const {error} = await supabase.auth.signInWithPassword({email, password});
        if (error) Alert.alert('Sign in error', error.message);
    }

    return (
    <View style={styles.c}>
      <Text style={styles.h}>DJ Set Tracker</Text>
      <TextInput style={styles.i} placeholder="Email" autoCapitalize="none" onChangeText={setEmail} value={email}/>
      <TextInput style={styles.i} placeholder="Password" secureTextEntry onChangeText={setPassword} value={password}/>
      <TouchableOpacity style={styles.b} onPress={signIn}><Text style={styles.bt}>Sign In</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.b, styles.secondary]} onPress={signUp}><Text style={styles.bt}>Sign Up</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c:{flex:1,justifyContent:'center',padding:24,gap:12,backgroundColor:'#fff'},
  h:{fontSize:22,fontWeight:'700',textAlign:'center',marginBottom:12},
  i:{borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:12},
  b:{backgroundColor:'#33498e',borderRadius:10,padding:14,alignItems:'center'},
  bt:{color:'#fff',fontWeight:'700'},
  secondary:{backgroundColor:'#5569b8'}
});