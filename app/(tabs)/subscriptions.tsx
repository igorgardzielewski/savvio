import { Image } from 'expo-image';
import {Platform, ScrollView, StyleSheet, View, TouchableOpacity} from 'react-native';
import {Text} from '@/components/ui/Text'
import {IconSymbol} from "@/components/ui/icon-symbol";
type Period = "monthly" | "yearly" | "one-time";
type Subscription = {
    id: number,
    brand: string,
    nextPayment: string,
    period: Period,
    image: any,
    color: string,
}
const subscriptions = [
    {
        id:1,
        brand: "AppleTV",
        nextPayment: "12.01.2025",
        price: 34.99,
        period: "monthly",
        image: require("@/assets/images/appletv.jpeg"),
        color: "#434343",
    },
    {
        id:2,
        brand: "Netflix",
        nextPayment: "12.01.2025",
        price: 69.69,
        period: "monthly",
        image: require("@/assets/images/netflix.jpeg"),
        color: "#5aedba",
    },
    {
        id:3,
        brand: "Spotify",
        nextPayment: "12.01.2025",
        price: 28.99,
        period: "monthly",
        image: require("@/assets/images/spotify.png"),
        color: "#a7f871",
    }
]
export default function Subscriptions() {

    return (
        <ScrollView
            className="flex-1 bg-[#f2f0ff]"
            contentContainerStyle={{
                height: '100%',
                paddingHorizontal: 8,
                paddingTop: 12,
                paddingBottom: 100,
                gap: 12,
                justifyContent: 'center'
            }}
            showsVerticalScrollIndicator={false}
        >
            <View>
                <View className={'bg-[#6b5aed] rounded-[24px]'}>
                    <View className="flex-row items-center justify-between pt-6 px-6 pb-16">
                        <Text className="text-white text-2xl font-semibold">Add a subscription</Text>
                        <View className="bg-white rounded-full p-6">
                            <IconSymbol name="plus" color="#6b5aed" weight={'semibold'} size={24} />
                        </View>
                    </View>
                </View>
                {subscriptions.map((subscription,index) => (
                    <TouchableOpacity key={`subscription-${subscription.id}`} onLongPress={()=>console.log('onlongpress')} activeOpacity={0.7}>
                    <View  className={'rounded-[24px] -mt-10'} style={{backgroundColor: subscription.color}}>
                        <View className={`flex-row justify-between pt-6 px-6 ${index===subscriptions.length-1 ? 'pb-6': 'pb-12'}`}>
                            <View className={'flex flex-col gap-2 justify-between'}>
                                <Text className="text-white text-2xl font-bold">{subscription.brand}</Text>
                                <Text className={'bg-white text-black px-4 py-2 rounded-full font-semibold'}>
                                    <Text className={'text-lg'}>{subscription.price} / </Text>
                                    <Text className={'text-sm'}>month</Text>
                                </Text>
                            </View>
                            {/*dotted circle with plus*/}
                            <View className={'flex flex-col gap-2 items-end'}>
                                <View className={'bg-white p-2 rounded-full items-center justify-center'}>
                                    <View className="bg-white rounded-full items-center justify-center overflow-hidden" style={{ width: 48, height: 48 }}>
                                        <Image
                                            source={subscription.image}
                                            style={{ width: 48, height: 48 }}
                                            contentFit="cover"
                                        />
                                    </View>
                                </View>
                                <Text className={'bg-white/80 text-black p-2 rounded-full font-semibold'}>
                                    <Text className={'text-xs'}>{subscription.nextPayment}</Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}
