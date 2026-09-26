import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../state/AuthContext';
import { AuthScreen } from './AuthScreen';
import { Button, Card, Loading } from '../ui/components';
import { space, useTheme } from '../ui/theme';

/**
 * Phase 1: auth gate only. Create/join/view team lands in the next step,
 * built on top of the RPCs already defined in the SQL migration.
 */
export function TeamsScreen() {
  const t = useTheme();
  const { loading, session, profile, signOut } = useAuth();

  if (loading) return <Loading />;
  if (!session) return <AuthScreen />;

  return (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingTop: space.xxl, gap: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>Teams</Text>

      <Card>
        <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>
          Signed in as {profile?.display_name ?? session.user.email}
        </Text>
        <Text style={{ color: t.textDim, marginTop: space.sm, fontSize: 13, lineHeight: 18 }}>
          Create/join a team, the weekly leaderboard, and team challenges land here next.
        </Text>
        <Button label="SIGN OUT" variant="ghost" style={{ marginTop: space.md }} onPress={signOut} />
      </Card>
    </ScrollView>
  );
}
