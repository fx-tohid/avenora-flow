import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { isSupabaseConfigured } from '../data/supabase';
import { useAuth } from '../state/AuthContext';
import { Button, Card } from '../ui/components';
import { radius, space, useTheme } from '../ui/theme';

/**
 * Gate shown in place of the Teams tab until the user signs in. Solo play
 * never touches this screen or requires an account.
 */
export function AuthScreen() {
  const t = useTheme();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit() {
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Teams is not set up in this build (Supabase settings are missing).');
      return;
    }
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (mode === 'signUp' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const message =
      mode === 'signIn' ? await signIn(email, password) : await signUp(email, password, displayName);
    setSubmitting(false);

    if (message) {
      setError(message);
    } else if (mode === 'signUp') {
      setCheckEmail(true);
    }
  }

  const inputStyle = {
    backgroundColor: t.cardAlt,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    color: t.text,
    fontSize: 15,
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingTop: space.xxl, gap: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>Teams</Text>
        <Text style={{ color: t.textDim, marginTop: space.xs, fontSize: 14, lineHeight: 20 }}>
          Sign in to build a team with up to 3 friends and compete on a weekly leaderboard. Solo
          play stays exactly as it is — this is only needed for Teams.
        </Text>
      </View>

      {checkEmail ? (
        <Card>
          <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>Check your email</Text>
          <Text style={{ color: t.textDim, marginTop: space.sm, fontSize: 13, lineHeight: 18 }}>
            We sent a confirmation link to {email.trim()}. Confirm it, then come back and sign in.
          </Text>
          <Button
            label="BACK TO SIGN IN"
            variant="ghost"
            style={{ marginTop: space.md }}
            onPress={() => {
              setCheckEmail(false);
              setMode('signIn');
            }}
          />
        </Card>
      ) : (
        <Card style={{ gap: space.md }}>
          {mode === 'signUp' ? (
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor={t.textFaint}
              autoCapitalize="words"
              style={inputStyle}
            />
          ) : null}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={t.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={inputStyle}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={t.textFaint}
            secureTextEntry
            style={inputStyle}
          />

          {error ? <Text style={{ color: t.danger, fontSize: 13 }}>{error}</Text> : null}

          {submitting ? (
            <ActivityIndicator color={t.accent} />
          ) : (
            <Button label={mode === 'signIn' ? 'SIGN IN' : 'CREATE ACCOUNT'} onPress={submit} />
          )}

          <Button
            label={mode === 'signIn' ? "DON'T HAVE AN ACCOUNT? SIGN UP" : 'ALREADY HAVE AN ACCOUNT? SIGN IN'}
            variant="ghost"
            onPress={() => {
              setError(null);
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
            }}
          />
        </Card>
      )}
    </ScrollView>
  );
}
