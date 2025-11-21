import { Stack } from "expo-router";

export default function AiAssistantLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="howitworks" />
            <Stack.Screen name="AiMain" />
        </Stack>
    );
}