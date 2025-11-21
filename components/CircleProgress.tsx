// File: `components/CircleProgress.tsx`
import React, { ReactNode } from "react";
import { View } from "react-native";
import { Svg, Circle, Text as SVGText } from "react-native-svg";

type Props = {
    size: number;
    strokeWidth: number;
    progressPercent: number; // 0-100
    text?: string | number;
    textSize?: number;
    textColor?: string;
    bgColor?: string; // stroke color for background ring
    pgColor?: string; // progress stroke color
    fillColor?: string | null; // interior fill color; pass null for transparent
    children?: ReactNode;
    style?: any;
};

const CircularProgress = (props: Props) => {
    const {
        size,
        strokeWidth,
        text,
        textSize,
        textColor,
        progressPercent,
        bgColor,
        pgColor,
        fillColor = null,
        children,
        style,
    } = props;

    const radius = (size - strokeWidth) / 2;
    const circum = radius * 2 * Math.PI;
    const svgProgress = 100 - Math.max(0, Math.min(100, progressPercent));

    return (
        <View style={[{ width: size, height: size, margin: 10 }, style]}>
            <Svg width={size} height={size}>
                {/* Background circle (can have interior fill via fillColor) */}
                <Circle
                    stroke={bgColor ?? "#f2f2f2"}
                    fill={fillColor ?? "none"}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <Circle
                    stroke={pgColor ?? "#3b5998"}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeDasharray={`${circum} ${circum}`}
                    strokeDashoffset={circum * (svgProgress / 100)}
                    strokeLinecap="round"
                    transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                    strokeWidth={strokeWidth}
                />

                {/* Optional SVG Text (keeps original behaviour) */}
                {text !== undefined && (
                    <SVGText
                        fontSize={textSize ?? 10}
                        x={size / 2}
                        y={size / 2 + (textSize ? textSize / 2 - 1 : 5)}
                        textAnchor="middle"
                        fill={textColor ?? "#333333"}
                    >
                        {text}
                    </SVGText>
                )}
            </Svg>

            {/* Centered children overlay */}
            <View
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: size,
                    height: size,
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "box-none",
                }}
            >
                {children}
            </View>
        </View>
    );
};

export default CircularProgress;
