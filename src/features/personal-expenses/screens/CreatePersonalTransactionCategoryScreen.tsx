import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import type { RootStackParamList } from "../../../app/navigation/types";
import { colors } from "../../../shared/theme/colors";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { PERSONAL_CATEGORY_ICON_COMPONENTS } from "../constants/personalTransactionCategoryVisuals";
import { useCreatePersonalCategory } from "../hooks/usePersonalCategories";
import type { PersonalCategoryCreateIcon } from "../schemas/personalCategorySchema";

const ICON_OPTIONS: Array<{ key: PersonalCategoryCreateIcon; label: string }> =
	[
		{ key: "Heart", label: "Salud" },
		{ key: "Tv", label: "Ocio" },
		{ key: "Building2", label: "Hogar" },
		{ key: "Coffee", label: "Café" },
		{ key: "BookOpen", label: "Educación" },
		{ key: "Gift", label: "Regalos" },
		{ key: "Bus", label: "Transporte" },
		{ key: "MoreHorizontal", label: "Otros" },
		{ key: "Wrench", label: "Reparaciones" },
		{ key: "CreditCard", label: "Tarjetas" },
		{ key: "Car", label: "Auto" },
		{ key: "Shirt", label: "Ropa" },
		{ key: "ShoppingBasket", label: "Compras" },
		{ key: "Banknote", label: "Dinero" },
		{ key: "TrendingUp", label: "Ingresos" },
		{ key: "BriefcaseBusiness", label: "Trabajo" },
		{ key: "Dumbbell", label: "Deporte" },
		{ key: "House", label: "Casa" },
		{ key: "Landmark", label: "Banco" },
		{ key: "Laptop", label: "Tecnología" },
		{ key: "Plane", label: "Viajes" },
		{ key: "WalletCards", label: "Billetera" },
		{ key: "CardSim", label: "Chip" },
		{ key: "Utensils", label: "Comida" },
		{ key: "ShoppingCart", label: "Carrito" },
		{ key: "Gamepad2", label: "Juegos" },
		{ key: "GraduationCap", label: "Estudios" },
		{ key: "PiggyBank", label: "Ahorro" },
		{ key: "Stethoscope", label: "Salud" },
		{ key: "Baby", label: "Bebé" },
	];
const COLOR_OPTIONS = [
	"#ef4444",
	"#22c55e",
	"#3b82f6",
	"#f59e0b",
	"#ec4899",
	"#8b5cf6",
	"#14b8a6",
	"#06b6d4",
	"#64748b",
	"#84cc16",
	"#f97316",
	"#6366f1",
	"#d946ef",
	"#a855f7",
	"#0ea5e9",
];
type Navigation = NativeStackNavigationProp<
	RootStackParamList,
	"CreatePersonalTransactionCategory"
>;

export function CreatePersonalTransactionCategoryScreen() {
	const navigation = useNavigation<Navigation>();
	const { params } =
		useRoute<
			import("@react-navigation/native").RouteProp<
				RootStackParamList,
				"CreatePersonalTransactionCategory"
			>
		>();
	const mutation = useCreatePersonalCategory();
	const [name, setName] = useState("");
	const [icon, setIcon] = useState<PersonalCategoryCreateIcon>("Heart");
	const [color, setColor] = useState(COLOR_OPTIONS[1]);
	const Icon = PERSONAL_CATEGORY_ICON_COMPONENTS[icon];

	const canSubmit = Boolean(name.trim()) && !mutation.isPending;

	function submit() {
		if (!canSubmit) return;
		mutation.mutate(
			{ name: name.trim(), type: params.type, icon, color },
			{
				onSuccess: () =>
					navigation.replace("PersonalTransactionCategories", {
						type: params.type,
						...(params.returnToAddPersonalTransaction
							? { returnToAddPersonalTransaction: true }
							: {}),
					}),
			},
		);
	}

	return (
		<ScreenContainer style={{ backgroundColor: "#f3f4f6" }}>
			<InternalScreenHeader title="Crear Nueva Categoría" />
			<ScrollView
				contentContainerStyle={{ padding: 16, gap: 24 }}
				keyboardShouldPersistTaps="handled"
			>
				<View style={{ alignItems: "center", gap: 10 }}>
					<View
						testID="personal-category-preview"
						style={{
							width: 76,
							height: 76,
							borderRadius: 38,
							backgroundColor: color,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Icon color="#ffffff" size={34} />
					</View>
					<Text style={{ color: colors.neutral500 }}>Vista previa</Text>
					<Text
						style={{
							fontSize: 18,
							fontWeight: "700",
							color: colors.neutral900,
						}}
					>
						{name.trim() || "Nueva categoría"}
					</Text>
				</View>
				<View style={{ gap: 8 }}>
					<Text style={{ fontWeight: "700", color: colors.neutral900 }}>
						Nombre de la categoría
					</Text>
					<TextInput
						accessibilityLabel="Nombre de la categoría"
						autoFocus
						maxLength={30}
						onChangeText={setName}
						placeholder="Ej. Viajes"
						testID="personal-new-category-name"
						value={name}
						style={{
							borderRadius: 12,
							borderWidth: 1,
							borderColor: "#d1d5db",
							backgroundColor: "#ffffff",
							padding: 14,
							fontSize: 16,
						}}
					/>
				</View>
				<View style={{ gap: 12 }}>
					<Text style={{ fontWeight: "700", color: colors.neutral900 }}>
						Elegí un ícono
					</Text>
					<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
						{ICON_OPTIONS.map(({ key, label }) => {
							const OptionIcon = PERSONAL_CATEGORY_ICON_COMPONENTS[key];
							return (
								<Pressable
									key={key}
									accessibilityRole="button"
									accessibilityLabel={`Ícono ${label}`}
									accessibilityState={{ selected: icon === key }}
									onPress={() => setIcon(key)}
									testID={`personal-category-icon-${key}`}
									style={{
										width: 48,
										height: 48,
										borderRadius: 12,
										backgroundColor: color,
										opacity: icon === key ? 1 : 0.45,
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<OptionIcon color="#ffffff" size={22} />
								</Pressable>
							);
						})}
					</View>
				</View>
				<View style={{ gap: 12 }}>
					<Text style={{ fontWeight: "700", color: colors.neutral900 }}>
						Elegí un color
					</Text>
					<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
						{COLOR_OPTIONS.map((option) => (
							<Pressable
								key={option}
								accessibilityRole="button"
								accessibilityLabel={`Color ${option}`}
								accessibilityState={{ selected: color === option }}
								onPress={() => setColor(option)}
								testID={`personal-category-color-${option}`}
								style={{
									width: 40,
									height: 40,
									borderRadius: 20,
									backgroundColor: option,
									borderWidth: color === option ? 3 : 0,
									borderColor: colors.neutral900,
								}}
							/>
						))}
					</View>
				</View>
				<Pressable
					accessibilityRole="button"
					accessibilityState={{ disabled: !canSubmit }}
					disabled={!canSubmit}
					onPress={submit}
					testID="personal-save-category-button"
					style={{
						height: 52,
						borderRadius: 14,
						backgroundColor: colors.primary,
						alignItems: "center",
						justifyContent: "center",
						opacity: canSubmit ? 1 : 0.5,
					}}
				>
					<Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
						{mutation.isPending ? "Guardando…" : "Guardar categoría"}
					</Text>
				</Pressable>
				{mutation.isError ? (
					<Text accessibilityRole="alert" style={{ color: colors.error }}>
						No pudimos guardar la categoría. Intentá de nuevo.
					</Text>
				) : null}
			</ScrollView>
		</ScreenContainer>
	);
}
