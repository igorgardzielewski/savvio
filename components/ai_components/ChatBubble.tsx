import { Text } from '@/components/ui/Text';
import { View } from "react-native";

interface ChatBubbleProps {
    isUser: boolean;
    children: React.ReactNode;
    isText?: boolean;
}

const ChatBubble = ({ isUser, children, isText = true }: ChatBubbleProps) => {
    return (
        <View
            className={`max-w-[85%] px-5 py-4 rounded-3xl ${isUser
                ? "self-end bg-[#8b7cfb] rounded-tr-md"
                : "self-start bg-white rounded-tl-md"
                }`}
            style={{
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            {isText ? (
                <Text
                    className={`font-medium text-base ${isUser ? "text-white" : "text-[#7b62f6]"}`}
                >
                    {children}
                </Text>
            ) : (
                children
            )}
        </View>
    );
}

export default ChatBubble;
