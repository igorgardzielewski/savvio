import React from "react";
import { Text, TextProps } from "react-native";

export function AppFontProvider({ children }: { children: React.ReactNode }) {
    const CustomText = (props: TextProps) => (
        <Text {...props} style={[{ fontFamily: "SixtyFour" }, props.style]}>
            {props.children}
        </Text>
    );

    // @ts-ignore – RN nie pozwala tego typować, ale działa
    Text.render = (props, ref) => <CustomText ref={ref} {...props} />;

    return <>{children}</>;
}
