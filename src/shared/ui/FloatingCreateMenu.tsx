import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Plus, ReceiptText, UserPlus, X } from "lucide-react-native";

import { colors } from "../theme/colors";

type FloatingCreateMenuProps = {
  disabled?: boolean;
  onCreateGroup: () => void;
  onCreateExpense: () => void;
};

export function FloatingCreateMenu({
  disabled = false,
  onCreateGroup,
  onCreateExpense,
}: FloatingCreateMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.7,
    }).start();
  }, [animation, isOpen]);

  const menuTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  const menuScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  const iconScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

  const handleActionPress = (action: () => void) => {
    if (disabled) return;
    setIsOpen(false);
    action();
  };

  return (
    <View className="absolute inset-0" pointerEvents="box-none">
      {isOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú de creación"
          className="absolute inset-0 bg-neutral900/60"
          onPress={() => setIsOpen(false)}
        />
      ) : null}

      <View className="absolute bottom-8 right-6 items-end gap-3">
        {isOpen ? (
          <Animated.View
            className="gap-3"
            style={{
              opacity: animation,
              transform: [{ translateY: menuTranslateY }, { scale: menuScale }],
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Crear nuevo grupo, divide gastos con amigos"
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={() => handleActionPress(onCreateGroup)}
              className={`min-h-16 flex-row items-center gap-4 rounded-full bg-white px-5 py-3 ${disabled ? 'opacity-60' : ''}`}
            >
              <UserPlus color={colors.primary} size={22} strokeWidth={2.4} />
              <View>
                <Text className="text-base font-bold text-neutral900">
                  Crear nuevo grupo
                </Text>
                <Text className="text-sm text-neutral500">
                  Divide gastos con amigos
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Crear nuevo gasto, registra un pago rápido"
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={() => handleActionPress(onCreateExpense)}
              className={`min-h-16 flex-row items-center gap-4 rounded-full bg-white px-5 py-3 ${disabled ? 'opacity-60' : ''}`}
            >
              <ReceiptText color={colors.primary} size={22} strokeWidth={2.4} />
              <View>
                <Text className="text-base font-bold text-neutral900">
                  Crear nuevo gasto
                </Text>
                <Text className="text-sm text-neutral500">
                  Registra un pago rápido
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isOpen ? "Cerrar menú de creación" : "Abrir menú de creación"}
          accessibilityState={{ expanded: isOpen, disabled }}
          disabled={disabled}
          onPress={() => setIsOpen((current) => !current)}
          className={`h-16 w-16 items-center justify-center rounded-full ${disabled ? 'bg-neutral300' : 'bg-primary'}`}
        >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            {isOpen ? (
              <X color={colors.white} size={30} strokeWidth={2.6} />
            ) : (
              <Plus color={colors.white} size={30} />
            )}
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
