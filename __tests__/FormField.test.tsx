import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FormField from '../components/ui/form-field';

jest.mock('react-native-paper', () => {
  const { View, Text, TextInput } = require('react-native');
  return {
    Text: ({ children }: any) => <Text>{children}</Text>,
    TextInput: ({ value, onChangeText, accessibilityLabel }: any) => (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={accessibilityLabel}
      />
    ),
    useTheme: () => ({ colors: { surface: '#FFFFFF' } }),
  };
});

describe('FormField', () => {
  it('renders the label and fires onChangeText', () => {
    const onChangeTextMock = jest.fn();

    const { getByText, getByLabelText } = render(
      <FormField label="Name" value="" onChangeText={onChangeTextMock} />
    );

    expect(getByText('Name')).toBeTruthy();
    expect(getByLabelText('Name')).toBeTruthy();

    fireEvent.changeText(getByLabelText('Name'), 'Alice');

    expect(onChangeTextMock).toHaveBeenCalledWith('Alice');
  });
});
