import ModalUsedLimit from "@/components/ModalUsedLimit";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/Text";
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from "@/store/userStore";
import { Transaction } from '@/types';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_SCANNED_DATA: Partial<Transaction> = {
  shop: {
    id: 1,
    name: 'Biedronka',
    logoUrl: 'biedronka.png',
    categoryName: 'Groceries',
    categoryColor: '#00A651'
  },
  date: new Date(),
  time: '14:32',
  amount: 34.72,
  receiptPositions: [
    { id: 1, name: 'Mleko 2%', quantity: '1', unit: 'pcs', totalItemPrice: 3.49 },
    { id: 2, name: 'Chleb pszenny', quantity: '1', unit: 'pcs', totalItemPrice: 4.99 },
    { id: 3, name: 'Jajka L', quantity: '10', unit: 'pcs', totalItemPrice: 12.99 },
    { id: 4, name: 'Pomidory', quantity: '0.5', unit: 'kg', totalItemPrice: 4.50 },
    { id: 5, name: 'Ser żółty', quantity: '0.25', unit: 'kg', totalItemPrice: 8.75 },
  ]
};

export default function ScanReceipt() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showModalUsedLimit, setShowModalUsedLimit] = useState(false);
  const { user, updateUsedOcrLimitAt } = useUserStore();

  useEffect(() => {
    if (!user?.premium && user?.usedOcrLimitAt) {
      const usedDate = new Date(user.usedOcrLimitAt);
      const now = new Date();
      if (usedDate.toDateString() === now.toDateString()) {
        setShowModalUsedLimit(true);
      } else {
        updateUsedOcrLimitAt(null);
      }
    }
  }, []);
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

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const mimeType = blob.type || 'image/jpeg';

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64String = base64data.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const getFileExtension = (mime: string) => {
        const mimeMap: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/heic': 'heic',
          'image/heif': 'heif',
          'image/webp': 'webp'
        };
        return mimeMap[mime] || 'jpg';
      };

      const extension = getFileExtension(mimeType);

      const apiResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/transactions/process-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          base64: base64,
          filename: `receipt_${Date.now()}.${extension}`,
          mimeType: mimeType
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        if (errorData?.field === 'ocrLimit') {
          updateUsedOcrLimitAt(new Date().toISOString());
          setShowModalUsedLimit(true);
          setCapturedImage(null);
          setIsScanning(false);
          setIsProcessing(false);
          return;
        }
        setShowErrorToast(true);
        setCapturedImage(null);
        setIsScanning(false);
        return;
      }
      const data = await apiResponse.json();
      setIsProcessing(false);

      router.push({
        pathname: '/(addexpense)/ManuallyAdd',
        params: {
          transactionData: JSON.stringify(data)
        }
      });

    } catch (error) {
      console.error('Error processing receipt:', error);
      setShowErrorToast(true);
    }
    finally {
      setIsProcessing(false);
    }
  };
  useEffect(() => {
    if (showErrorToast) {
      setTimeout(() => {
        setShowErrorToast(false);
      }, 5000);
    }
  }, [showErrorToast]);
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
            <View className="flex-1 items-center justify-center">
              <View
                className="border-4 border-accent rounded-3xl"
                style={{
                  width: Dimensions.get('window').width * 0.85,
                  height: Dimensions.get('window').height * 0.6,
                }}
              >
                <View className="absolute top-[-4] left-[-4] w-12 h-12 border-t-4 border-l-4 border-accent rounded-tl-3xl" />
                <View className="absolute top-[-4] right-[-4] w-12 h-12 border-t-4 border-r-4 border-accent rounded-tr-3xl" />
                <View className="absolute bottom-[-4] left-[-4] w-12 h-12 border-b-4 border-l-4 border-accent rounded-bl-3xl" />
                <View className="absolute bottom-[-4] right-[-4] w-12 h-12 border-b-4 border-r-4 border-accent rounded-br-3xl" />
              </View>
            </View>
          </CameraView>
        )}

      </View>
      {showErrorToast ? (
        <View className="absolute bottom-0 left-0 right-0 pb-8 px-6">
          <View className="bg-red-500 rounded-3xl px-4 py-4 items-center shadow-lg gap-6">
            <View className={'flex flex-row justify-between items-center w-full'}>
              <Text className="text-white font-bold text-xl">Error processing receipt</Text>
              <TouchableOpacity className={'self-end'} onPress={() => setShowErrorToast(false)}>
                <IconSymbol name="xmark" size={24} color="white" weight="bold" />
              </TouchableOpacity>
            </View>
            <View className={'flex justify-center items-center px-8'}>
              <Text className="text-white font-semibold text-xl text-center">Make sure the receipt is visible</Text>
              <Text className="text-white font-semibold text-xl mb-8 text-center">and shadows do not make it unreadable</Text>
            </View>
          </View>
        </View>
      ) : (!capturedImage && !isProcessing) ? (
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
      ) : (capturedImage && !isProcessing) ? (
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
      ) : null
      }

      <Modal visible={isProcessing} animationType="fade" presentationStyle={'fullScreen'} transparent={true}>
        <View className="bg-white rounded-3xl p-8 items-center h-full w-full justify-center">
          <ActivityIndicator size="large" color="#6b5aed" />
          <Text className="text-xl font-bold text-heading mt-6">
            Processing Receipt
          </Text>
        </View>
      </Modal>
      <ModalUsedLimit visible={showModalUsedLimit} onClose={() => setShowModalUsedLimit(false)} type={'ocr'} />
    </SafeAreaView>
  );
}