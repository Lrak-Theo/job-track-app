import { Keyboard, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
};

export default function FormField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  returnKeyType,
}: Props) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        onSubmitEditing={Keyboard.dismiss}
        mode="outlined"
        style={{ backgroundColor: theme.colors.surface }}
        accessibilityLabel={label}
      />
    </View>
  );
}
