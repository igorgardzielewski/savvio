import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface LoadingEllipsisProps {
    color?: string;
    size?: number;
}

const LoadingEllipsis = ({ color = "#ffffff50", size = 8 }: LoadingEllipsisProps) => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createBounce = (dot: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: -8,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const anim1 = createBounce(dot1, 0);
        const anim2 = createBounce(dot2, 150);
        const anim3 = createBounce(dot3, 300);

        anim1.start();
        anim2.start();
        anim3.start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, [dot1, dot2, dot3]);

    const dotStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        marginHorizontal: 3,
    };

    return (
        <View className="self-start flex-row items-center py-2">
            <Animated.View style={[dotStyle, { transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[dotStyle, { transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[dotStyle, { transform: [{ translateY: dot3 }] }]} />
        </View>
    );
}

export default LoadingEllipsis;
