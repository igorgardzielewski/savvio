import { View } from "react-native";

interface ReportPaginationProps {
    currentStep: number;
    maxSteps: number;
}
export default function ReportPagination({ currentStep, maxSteps }: ReportPaginationProps) {
    return (
        <View className={'flex flex-row items-center gap-0.5 justify-start'}>
            {Array.from({ length: maxSteps }).map((_, index) => (
                <View
                    key={index}
                    className={`w-6 rounded-full ${index === currentStep ? 'bg-[#6b5aed] h-3' : 'bg-[#f2f0ff] h-2'}`}
                />
            ))}
        </View>
    )
}