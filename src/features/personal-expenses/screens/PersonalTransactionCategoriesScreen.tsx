import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Plus } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";

import type { RootStackParamList } from "../../../app/navigation/types";
import { colors } from "../../../shared/theme/colors";
import { InternalScreenHeader } from "../../../shared/ui/InternalScreenHeader";
import { ScreenContainer } from "../../../shared/ui/ScreenContainer";
import { personalCategoryToConfig } from "../constants/personalTransactionCategoryVisuals";
import {
	selectPersonalCategory,
	setPersonalCategoryCatalog,
} from "../constants/personalTransactionCategoryVisibility";
import { usePersonalCategories } from "../hooks/usePersonalCategories";
import type { PersonalTransactionType } from "../types";

type Navigation = NativeStackNavigationProp<
	RootStackParamList,
	"PersonalTransactionCategories"
>;

export function PersonalTransactionCategoriesScreen() {
	const navigation = useNavigation<Navigation>();
	const { params } =
		useRoute<
			import("@react-navigation/native").RouteProp<
				RootStackParamList,
				"PersonalTransactionCategories"
			>
		>();
	const type: PersonalTransactionType = params?.type ?? "expense";
	const { categories, isLoading, isError } = usePersonalCategories();
	const typedCategories = useMemo(
		() => categories.filter((category) => category.type === type),
		[categories, type],
	);
	const configs = useMemo(
		() =>
			typedCategories.map((category, index) =>
				personalCategoryToConfig(category, index),
			),
		[typedCategories],
	);

	useEffect(() => {
		if (configs.length > 0) setPersonalCategoryCatalog(type, configs);
	}, [configs, type]);

	const visibleCatalog = configs;

	return (
		<ScreenContainer style={{ backgroundColor: "#f3f4f6" }}>
			<InternalScreenHeader
				title={
					type === "expense" ? "Categorías de Gastos" : "Categorías de Ingresos"
				}
			/>
			<ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
				<View style={{ gap: 6 }}>
					<Text
						style={{
							fontSize: 24,
							fontWeight: "700",
							color: colors.neutral900,
						}}
					>
						Tus categorías
					</Text>
					<Text style={{ fontSize: 14, color: colors.neutral500 }}>
						Organizá tus movimientos con categorías personalizadas.
					</Text>
				</View>
				{isLoading ? (
					<ActivityIndicator testID="personal-categories-loading" />
				) : null}
				{isError ? (
					<Text accessibilityRole="alert">
						No pudimos cargar tus categorías. Intentá de nuevo.
					</Text>
				) : null}
				<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
					{visibleCatalog.map((category) => {
						const Icon = category.Icon;
						return (
							<Pressable
								key={category.name}
								accessibilityRole="button"
								accessibilityLabel={`Seleccionar categoría ${category.name}`}
								onPress={() => {
									selectPersonalCategory(type, category.name);
									if (params?.returnToAddPersonalTransaction)
										navigation.popTo("AddPersonalTransaction", { type });
									else navigation.goBack();
								}}
								testID={`personal-full-category-${category.name}`}
								style={{
									width: "48%",
									minHeight: 132,
									alignItems: "center",
									justifyContent: "center",
									gap: 10,
									borderRadius: 18,
									borderWidth: 1,
									borderColor: "#e5e7eb",
									backgroundColor: "#ffffff",
								}}
							>
								<View
									style={{
										width: 52,
										height: 52,
										borderRadius: 26,
										backgroundColor: category.color,
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Icon color="#ffffff" size={24} strokeWidth={1.8} />
								</View>
								<Text
									numberOfLines={1}
									style={{
										fontSize: 14,
										fontWeight: "600",
										color: colors.neutral900,
									}}
								>
									{category.name}
								</Text>
							</Pressable>
						);
					})}
					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Más"
						onPress={() =>
							navigation.navigate("CreatePersonalTransactionCategory", {
								type,
								...(params?.returnToAddPersonalTransaction
									? { returnToAddPersonalTransaction: true }
									: {}),
							})
						}
						testID="personal-category-create-button"
						style={{
							width: "48%",
							minHeight: 132,
							alignItems: "center",
							justifyContent: "center",
							gap: 10,
							borderRadius: 18,
							borderWidth: 1.5,
							borderStyle: "dashed",
							borderColor: "#9ca3af",
						}}
					>
						<Plus color={colors.neutral500} size={28} />
						<Text
							style={{
								fontSize: 14,
								fontWeight: "600",
								color: colors.neutral900,
							}}
						>
							Más
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</ScreenContainer>
	);
}
