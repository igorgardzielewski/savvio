import {ImageSourcePropType} from "react-native";

export const getLogoSource = (logo: string | ImageSourcePropType) => {
    if (typeof logo === 'string') {
        if (logo.startsWith('http')) {
            return { uri: logo };
        }
        return { uri: `${process.env.EXPO_PUBLIC_API_URL}${logo}` };
    }
    return logo;
};