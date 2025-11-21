import {
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform
} from "react-native";
import { Text } from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

type ScannedItem = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  amount: string;
};

type Shop = {
  name: string;
  category: string;
  logo: any;
};

// Tymczasowe dane po zeskanowaniu
const MOCK_SCANNED_DATA = {
  shop: {
    name: 'Biedronka',
    category: 'Groceries',
    logo: require('@/assets/images/biedronka.png')
  },
  date: new Date(),
  time: { hours: 14, minutes: 32 },
  items: [
    { id: 1, name: 'Mleko 2%', quantity: '1', unit: 'pcs', amount: '3.49' },
    { id: 2, name: 'Chleb pszenny', quantity: '1', unit: 'pcs', amount: '4.99' },
    { id: 3, name: 'Jajka L', quantity: '10', unit: 'pcs', amount: '12.99' },
    { id: 4, name: 'Pomidory', quantity: '0.5', unit: 'kg', amount: '4.50' },
    { id: 5, name: 'Ser żółty', quantity: '0.25', unit: 'kg', amount: '8.75' },
  ],
  totalAmount: '34.72'
};

export default function ScanReceipt() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsScanning(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo) {
          setCapturedImage(photo.uri);
          processReceipt(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        setIsScanning(false);
      }
    }
  };

  const processReceipt = async (imageUri: string) => {
    setIsProcessing(true);

    // Symulacja przetwarzania OCR (2 sekundy)
    setTimeout(() => {
      setIsProcessing(false);
      // Przekierowanie do ManuallyAdd z danymi
      router.push({
        pathname: '/(addexpense)/ManuallyAdd',
        params: {
          scannedData: JSON.stringify(MOCK_SCANNED_DATA)
        }
      });
    }, 2000);
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setIsScanning(false);
    setIsProcessing(false);
  };

  if (!permission) {
    return (
        <LinearGradient
            colors={['#eae8ff', '#e2deff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.9 }}
            style={{ flex: 1 }}
        >
          <SafeAreaView className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6b5aed" />
          </SafeAreaView>
        </LinearGradient>
    );
  }

  if (!permission.granted) {
    return (
        <LinearGradient
            colors={['#eae8ff', '#e2deff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.9 }}
            style={{ flex: 1 }}
        >
          <SafeAreaView className="flex-1 px-6">
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity
                  className="bg-white p-4 rounded-full"
                  onPress={() => router.back()}
              >
                <IconSymbol name="arrow.left" size={24} weight="bold" color="#6b5aed" />
              </TouchableOpacity>
            </View>
            <View className="flex-1 items-center justify-center px-6">
              <View className="bg-white rounded-3xl p-8 items-center">
                <IconSymbol name="camera" size={64} color="#e37a9e" weight="bold" />
                <Text className="text-xl font-bold text-heading mt-6 text-center">
                  Camera Access Required
                </Text>
                <Text className="text-base text-headingMeta mt-3 text-center">
                  Please grant camera permissions to scan receipts.
                </Text>
                <TouchableOpacity
                    className="bg-accent rounded-full px-8 py-4 mt-6"
                    onPress={requestPermission}
                >
                  <Text className="text-white font-semibold">Grant Permission</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
    );
  }

  return (
        <SafeAreaView className="flex-1" edges={[]}>
          {/* Header */}

          {/* Camera View lub Captured Image */}
          <View className="flex-1">
            {capturedImage ? (
                    <View className={'flex-1'}>
                      <Image
                          source={{ uri: capturedImage }}
                          className="flex-1"
                          resizeMode="cover"
                      />
                      <View className="absolute top-10 left-0 right-0 z-10 px-6 pt-4">
                        <View className="flex-row justify-between items-center">
                          <TouchableOpacity
                              className="bg-white/90 p-3 rounded-full"
                              onPress={() => router.back()}
                          >
                            <IconSymbol name="xmark" size={24} weight="bold" color="#6b5aed" />
                          </TouchableOpacity>

                          {capturedImage && !isProcessing && (
                              <TouchableOpacity
                                  className="bg-white/90 p-3 rounded-full"
                                  onPress={retakePicture}
                              >
                                <IconSymbol name="arrow.counterclockwise" size={24} weight="bold" color="#6b5aed" />
                              </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
            ) : (
                <CameraView
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    facing="back"
                >
                  <SafeAreaView edges={[]} className="absolute top-10 left-0 right-0 z-20 px-6 pt-4">
                    <View className="flex-row justify-between items-center">
                      <TouchableOpacity
                          className="bg-white/90 p-3 rounded-full"
                          onPress={() => router.back()}
                      >
                        <IconSymbol name="xmark" size={24} weight="bold" color="#6b5aed" />
                      </TouchableOpacity>

                      {capturedImage && !isProcessing && (
                          <TouchableOpacity
                              className="bg-white/90 p-3 rounded-full"
                              onPress={retakePicture}
                          >
                            <IconSymbol name="arrow.counterclockwise" size={24} weight="bold" color="#6b5aed" />
                          </TouchableOpacity>
                      )}
                    </View>
                  </SafeAreaView>
                  {/* Overlay z ramką */}
                  <View className="flex-1 items-center justify-center">
                    <View
                        className="border-4 border-white/50 rounded-3xl"
                        style={{
                          width: Dimensions.get('window').width * 0.85,
                          height: Dimensions.get('window').height * 0.6,
                        }}
                    >
                      {/* Narożniki */}
                      <View className="absolute top-[-4] left-[-4] w-12 h-12 border-t-4 border-l-4 border-accent rounded-tl-3xl" />
                      <View className="absolute top-[-4] right-[-4] w-12 h-12 border-t-4 border-r-4 border-accent rounded-tr-3xl" />
                      <View className="absolute bottom-[-4] left-[-4] w-12 h-12 border-b-4 border-l-4 border-accent rounded-bl-3xl" />
                      <View className="absolute bottom-[-4] right-[-4] w-12 h-12 border-b-4 border-r-4 border-accent rounded-br-3xl" />
                    </View>
                  </View>
                </CameraView>
            )}

            {/* Processing Overlay */}
            {isProcessing && (
                <View className="absolute inset-0 bg-black/70 items-center justify-center">
                  <View className="bg-white rounded-3xl p-8 items-center mx-6">
                    <ActivityIndicator size="large" color="#6b5aed" />
                    <Text className="text-xl font-bold text-heading mt-6">
                      Processing Receipt
                    </Text>
                    <Text className="text-base text-headingMeta mt-2 text-center">
                      Extracting items and amounts...
                    </Text>
                  </View>
                </View>
            )}
          </View>

          {/* Instructions & Capture Button */}
          {!capturedImage && !isProcessing && (
              <View className="absolute bottom-0 left-0 right-0 pb-8 px-6">


                <TouchableOpacity
                    className="bg-accent rounded-full p-4 items-center shadow-lg"
                    onPress={takePicture}
                    disabled={isScanning}
                >
                  {isScanning ? (
                      <ActivityIndicator color="#ffffff" />
                  ) : (
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name="camera.fill" size={24} color="#ffffff" weight="bold" />
                        <Text className="text-white font-bold text-lg">Capture Receipt</Text>
                      </View>
                  )}
                </TouchableOpacity>
              </View>
          )}

          {capturedImage && !isProcessing && (
              <View className="absolute bottom-0 left-0 right-0 pb-8 px-6">
                <TouchableOpacity
                    className="bg-accent rounded-full p-4 items-center shadow-lg"
                    onPress={() => processReceipt(capturedImage)}
                >
                  <View className="flex-row items-center gap-2">
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#ffffff" weight="bold" />
                    <Text className="text-white font-bold text-lg">Process Receipt</Text>
                  </View>
                </TouchableOpacity>
              </View>
          )}
        </SafeAreaView>
  );
}