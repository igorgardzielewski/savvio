import {View} from "react-native";

interface AiTutorialPaginationProps {
    currentStep: number;
    maxSteps: number;
}
export default function AiTutorialPagination({currentStep, maxSteps}: AiTutorialPaginationProps) {
    return (
        <View className={'flex flex-row items-center gap-0.5 justify-start'}>
            {Array.from({length: maxSteps -1}).map((_, index) => (
                <View
                    key={index}
                    className={`w-6 rounded-full ${index+1 === currentStep ? 'bg-white h-3' : 'bg-[#f2f0ff] h-2'}`}
                />
            ))}
        </View>
    )
}