import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Settings as S, approxStorageBytes } from '../storage';
import { checkHealth } from '../api';
import { Btn, Card, Input, Txt, row } from '../components/ui';

export default function Settings(props: { settings: S; onSave: (s: S) => void; onBack: () => void }) {
  const [s, setS] = useState(props.settings);
  const [status, setStatus] = useState('');
  const [bytes, setBytes] = useState(0);
  useEffect(() => { approxStorageBytes().then(setBytes); }, []);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, maxWidth: 700, width: '100%', alignSelf: 'center' }}>
      <View style={row}>
        <Btn small kind="ghost" label="< Back" onPress={props.onBack} />
        <Txt bold size={20}>Settings</Txt>
      </View>
      <Card style={{ gap: 8 }}>
        <Txt bold>Server URL</Txt>
        <Txt sub size={12}>Your backend. Emulator Android: http://10.0.2.2:8787. Real phone: http://YOUR-PC-IP:8787 (same Wi-Fi).</Txt>
        <Input value={s.serverUrl} onChangeText={(v) => setS({ ...s, serverUrl: v })} autoCapitalize="none" autoCorrect={false} />
        <Txt bold>App token</Txt>
        <Txt sub size={12}>Must equal APP_TOKEN in server/.env. The AI key itself never lives in this app.</Txt>
        <Input value={s.appToken} onChangeText={(v) => setS({ ...s, appToken: v })} autoCapitalize="none" secureTextEntry />
        <View style={row}>
          <Btn label="Save" onPress={() => { props.onSave(s); setStatus('Saved.'); }} />
          <Btn kind="ghost" label="Test server" onPress={async () => {
            try {
              const h = await checkHealth(s);
              setStatus(h.hasKey ? `Server OK. Model: ${h.model}` : 'Server reachable but GEMINI_API_KEY is missing in server/.env');
            } catch { setStatus('Cannot reach server. Is it running? Is the URL right?'); }
          }} />
        </View>
        {!!status && <Txt>{status}</Txt>}
      </Card>
      <Card style={{ gap: 6 }}>
        <Txt bold>Theme</Txt>
        <Btn kind="ghost" label={s.dark ? 'Switch to light' : 'Switch to dark'} onPress={() => { const n = { ...s, dark: !s.dark }; setS(n); props.onSave(n); }} />
      </Card>
      <Card>
        <Txt bold>Storage used</Txt>
        <Txt sub>{(bytes / 1024 / 1024).toFixed(2)} MB of project data on this device. On web this uses IndexedDB (much larger than the old 5 MB limit, but still limited by your disk and browser). Clearing browser data removes it, so export ZIP backups regularly.</Txt>
      </Card>
    </ScrollView>
  );
}
