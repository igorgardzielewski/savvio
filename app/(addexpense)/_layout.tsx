import { Stack } from "expo-router";

export default function AddExpenseLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ManuallyAdd" />
            <Stack.Screen name="ScanReceipt" />
        </Stack>
    );
}