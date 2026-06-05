import { Text, TextInput, TextInputProps, View } from 'react-native';

type InputProps = TextInputProps & {
  errorMessage?: string;
  testID?: string;
};

export function Input({ errorMessage, testID, className, ...props }: InputProps) {
  return (
    <View className="w-full">
      <TextInput
        testID={testID}
        className={`rounded-md border border-neutral200 bg-white px-3 py-3 text-base text-neutral900 ${className ?? ''}`}
        placeholderTextColor="#6B7280"
        {...props}
      />
      {errorMessage ? <Text className="mt-1 text-sm text-error">{errorMessage}</Text> : null}
    </View>
  );
}
