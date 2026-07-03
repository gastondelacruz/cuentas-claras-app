import { ComponentProps, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

type KeyboardAwareScrollViewProps = ComponentProps<typeof ScrollView> & {
  /**
   * Extra vertical offset applied on iOS to account for a fixed header rendered
   * above this scroll view. Defaults to 0 because headers are usually siblings
   * placed outside the avoiding view.
   */
  keyboardVerticalOffset?: number;
  /**
   * When true, the list scrolls to the bottom as the keyboard opens so the
   * final element (typically the submit button) stays visible without the user
   * having to dismiss the keyboard. Enable it on short forms where the primary
   * action sits right below the inputs (e.g. login).
   */
  autoScrollToEndOnKeyboardShow?: boolean;
};

/**
 * Drop-in replacement for a vertical `ScrollView` that keeps focused inputs and
 * the form's submit button visible while the on-screen keyboard is open.
 *
 * iOS relies on `KeyboardAvoidingView` with `padding` behavior. On Android —
 * where Expo's edge-to-edge layout lets the keyboard overlay the screen instead
 * of resizing it — a spacer the height of the keyboard is appended so the
 * content can scroll above the keyboard, and (optionally) the view scrolls to
 * the end when the keyboard appears. Both collapse back to normal on dismiss.
 */
export function KeyboardAwareScrollView({
  keyboardVerticalOffset = 0,
  keyboardShouldPersistTaps = 'handled',
  autoScrollToEndOnKeyboardShow = false,
  children,
  ...scrollViewProps
}: KeyboardAwareScrollViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);

  useEffect(() => {
    // iOS keyboard avoidance is handled by KeyboardAvoidingView below.
    if (Platform.OS !== 'android') {
      return;
    }

    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setAndroidKeyboardHeight(event.endCoordinates.height);
      if (autoScrollToEndOnKeyboardShow) {
        requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
      }
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setAndroidKeyboardHeight(0);
      if (autoScrollToEndOnKeyboardShow) {
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: true }));
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [autoScrollToEndOnKeyboardShow]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...scrollViewProps}
      >
        {children}
        {Platform.OS === 'android' ? <View style={{ height: androidKeyboardHeight }} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
