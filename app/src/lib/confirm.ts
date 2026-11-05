import { Alert, Platform } from 'react-native';

export function confirmAction(title: string, msg: string, okLabel: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${msg}`)) onOk();
    return;
  }
  Alert.alert(title, msg, [{ text: 'Cancel', style: 'cancel' }, { text: okLabel, style: 'destructive', onPress: onOk }]);
}
