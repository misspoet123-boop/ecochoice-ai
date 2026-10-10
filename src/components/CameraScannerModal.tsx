import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  X,
  Zap,
  ZapOff,
  Image as ImageIcon,
  Sparkles,
  SwitchCamera,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';
import { analyzeProductPhoto } from '../services/geminiService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onProductIdentified: (
    product: Product | { unlistedName: string; rawAnalysis?: string; brand?: string; photoResult?: any }
  ) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  visible,
  onClose,
  onProductIdentified,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStep, setScanningStep] = useState<string>('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

  const cameraRef = useRef<any>(null);
  const webVideoRef = useRef<any>(null);
  const webStreamRef = useRef<any>(null);

  // Animated laser scan sweep
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const scanLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      scanLoop.start();
      return () => scanLoop.stop();
    } else {
      setCapturedPhotoUri(null);
      setIsScanning(false);
      setScanningStep('');
    }
  }, [visible, scanLineAnim]);

  // Handle Web Camera Stream
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      const startWebCamera = async () => {
        try {
          if (navigator?.mediaDevices?.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: facing === 'back' ? 'environment' : 'user' },
              audio: false,
            });
            webStreamRef.current = stream;
            if (webVideoRef.current) {
              webVideoRef.current.srcObject = stream;
              webVideoRef.current.play().catch(() => {});
            }
          }
        } catch (err) {
          console.warn('Web camera stream access error:', err);
        }
      };

      startWebCamera();

      return () => {
        if (webStreamRef.current) {
          webStreamRef.current.getTracks().forEach((track: any) => track.stop());
          webStreamRef.current = null;
        }
      };
    }
  }, [visible, facing]);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const scanOpacity = scanLineAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  // Toggle Camera Facing (Front / Back)
  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Process and analyze captured/selected image using real-time Gemini Vision
  const processImageAnalysis = async (imageUri: string, base64Data?: string) => {
    setIsScanning(true);
    setCapturedPhotoUri(imageUri);
    setScanningStep('✓ Photo Captured! Reading label & packaging...');

    try {
      const result = await analyzeProductPhoto(imageUri, base64Data);

      setIsScanning(false);
      setScanningStep('');
      setCapturedPhotoUri(null);
      onClose();

      onProductIdentified({
        unlistedName: result.productName || 'Scanned Retail Product',
        brand: result.brand,
        rawAnalysis: result.analysisText,
        photoResult: result,
      });
    } catch (err: any) {
      setIsScanning(false);
      setScanningStep('');
      Alert.alert(
        'Scan Notice',
        err.message ||
          'Unable to retrieve live data for this product. Please try again with a clearer photo.',
        [
          {
            text: 'Retake Photo',
            onPress: () => setCapturedPhotoUri(null),
          },
        ]
      );
    }
  };

  // Real Shutter Snap
  const handleSnapPhoto = async () => {
    if (isScanning) return;

    try {
      if (Platform.OS === 'web') {
        if (webVideoRef.current) {
          const video = webVideoRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            setCapturedPhotoUri(dataUrl);
            await processImageAnalysis(dataUrl, dataUrl);
            return;
          }
        }
      } else if (cameraRef.current) {
        // High-speed, optimized capture with 0.6 quality for instant upload & crisp visual recognition
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.6,
          base64: true,
          skipProcessing: true,
        });
        if (photo?.uri) {
          setCapturedPhotoUri(photo.uri);
          await processImageAnalysis(photo.uri, photo.base64);
          return;
        }
      }
    } catch (err: any) {
      setIsScanning(false);
      setCapturedPhotoUri(null);
      Alert.alert(
        'Camera Notice',
        'Could not capture photo. Please try again or upload an image from your gallery.'
      );
    }
  };

  // Pick Real Photo from Gallery
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setCapturedPhotoUri(asset.uri);
        await processImageAnalysis(asset.uri, asset.base64 || undefined);
      }
    } catch (err: any) {
      Alert.alert('Gallery Picker', 'Could not open image gallery.');
    }
  };

  const hasCameraPermission = permission?.granted;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenContainer}>
        {/* Top Floating App Bar */}
        <View style={styles.topAppBar}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.circleActionButton}
            activeOpacity={0.7}
            accessibilityLabel="Close scanner"
          >
            <X size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleBadge}>
            <Sparkles size={14} color={COLORS.emerald[400]} />
            <Text style={styles.headerTitleText}>AI Photo Scanner</Text>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => setFlashEnabled(!flashEnabled)}
              style={styles.circleActionButton}
              activeOpacity={0.7}
              accessibilityLabel="Toggle flash"
            >
              {flashEnabled ? (
                <Zap size={18} color={COLORS.amber[400]} />
              ) : (
                <ZapOff size={18} color={COLORS.white} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleCameraFacing}
              style={styles.circleActionButton}
              activeOpacity={0.7}
              accessibilityLabel="Flip camera"
            >
              <SwitchCamera size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Viewfinder Area (Full Available Viewport) */}
        <View style={styles.viewfinderCanvas}>
          {Platform.OS !== 'web' && !hasCameraPermission ? (
            <View style={styles.permissionBox}>
              <View style={styles.permissionIconRing}>
                <ShieldAlert size={36} color={COLORS.amber[500]} />
              </View>
              <Text style={styles.permissionTitle}>Camera Permission Required</Text>
              <Text style={styles.permissionSubtitle}>
                EcoLens needs camera access to photograph product packaging and calculate sustainability scores.
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                style={styles.permissionButton}
                activeOpacity={0.8}
              >
                <Camera size={16} color={COLORS.white} />
                <Text style={styles.permissionButtonText}>Enable Camera Access</Text>
              </TouchableOpacity>
            </View>
          ) : capturedPhotoUri ? (
            /* REFLECT CAPTURED PHOTO ON SCREEN IMMEDIATELY */
            <View style={StyleSheet.absoluteFillObject}>
              <Image
                source={{ uri: capturedPhotoUri }}
                style={styles.capturedPhotoPreview}
                resizeMode="cover"
              />
              <View style={styles.darkBackdropOverlay} />

              {/* Scanning Laser Beam over Captured Photo */}
              <Animated.View
                style={[
                  styles.scanningLaserBeam,
                  { transform: [{ translateY }], opacity: scanOpacity },
                ]}
              >
                <View style={styles.laserGlow} />
              </Animated.View>

              {/* Capture Success Badge & Status Overlay */}
              <View style={styles.captureSuccessOverlay}>
                <View style={styles.captureSuccessBadge}>
                  <CheckCircle2 size={20} color={COLORS.emerald[500]} />
                  <Text style={styles.captureSuccessBadgeText}>
                    Photo Captured Successfully!
                  </Text>
                </View>

                <View style={styles.captureStatusCard}>
                  <ActivityIndicator size="small" color={COLORS.emerald[600]} />
                  <Text style={styles.captureStatusText}>
                    EcoLens AI is reading label & packaging...
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setCapturedPhotoUri(null)}
                  disabled={isScanning}
                  style={styles.retakeButton}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={13} color={COLORS.slate[600]} />
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* LIVE CAMERA STREAM */
            <>
              {Platform.OS === 'web' ? (
                <View style={StyleSheet.absoluteFillObject}>
                  {/* @ts-ignore */}
                  <video
                    ref={webVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </View>
              ) : (
                <CameraView
                  ref={cameraRef}
                  style={StyleSheet.absoluteFillObject}
                  facing={facing}
                  enableTorch={flashEnabled}
                />
              )}

              {/* Centered Framing Reticle */}
              <View style={styles.centerReticleFrame}>
                <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
                <View style={[styles.cornerBracket, styles.bracketTopRight]} />
                <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
                <View style={[styles.cornerBracket, styles.bracketBottomRight]} />

                {/* Animated Laser Beam */}
                <Animated.View
                  style={[
                    styles.scanningLaserBeam,
                    { transform: [{ translateY }], opacity: scanOpacity },
                  ]}
                >
                  <View style={styles.laserGlow} />
                </Animated.View>

                <View style={styles.reticleHintBox}>
                  <Text style={styles.reticleHintTitle}>Fit Product Inside Frame</Text>
                  <Text style={styles.reticleHintSubtitle}>
                    Point directly at packaging or front label
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Bottom Floating Shutter Controls */}
        <View style={styles.bottomControlTray}>
          {/* Gallery Upload Button */}
          <TouchableOpacity
            onPress={handlePickFromGallery}
            style={styles.traySideButton}
            activeOpacity={0.8}
            accessibilityLabel="Upload from gallery"
          >
            <View style={styles.traySideIconCircle}>
              <ImageIcon size={22} color={COLORS.white} strokeWidth={2.2} />
            </View>
            <Text style={styles.traySideLabel}>Upload</Text>
          </TouchableOpacity>

          {/* Shutter Button (72px touch target) */}
          <TouchableOpacity
            onPress={handleSnapPhoto}
            disabled={isScanning || !!capturedPhotoUri}
            style={[
              styles.shutterButtonOuter,
              (isScanning || !!capturedPhotoUri) && styles.shutterButtonDisabled,
            ]}
            activeOpacity={0.85}
            accessibilityLabel="Capture photo"
          >
            <View style={styles.shutterButtonInner}>
              {isScanning ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Camera size={26} color={COLORS.white} strokeWidth={2.5} />
              )}
            </View>
          </TouchableOpacity>

          {/* Retake or Instruction Button */}
          <TouchableOpacity
            onPress={capturedPhotoUri ? () => setCapturedPhotoUri(null) : toggleCameraFacing}
            style={styles.traySideButton}
            activeOpacity={0.8}
            accessibilityLabel="Flip camera"
          >
            <View style={styles.traySideIconCircle}>
              {capturedPhotoUri ? (
                <RefreshCw size={20} color={COLORS.white} />
              ) : (
                <SwitchCamera size={20} color={COLORS.white} />
              )}
            </View>
            <Text style={styles.traySideLabel}>
              {capturedPhotoUri ? 'Retake' : 'Flip'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#0a0f1d',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topAppBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 24,
    left: 0,
    right: 0,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  circleActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  headerTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewfinderCanvas: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0a0f1d',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedPhotoPreview: {
    width: '100%',
    height: '100%',
  },
  darkBackdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 29, 0.45)',
  },
  captureSuccessOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
    gap: 10,
    zIndex: 25,
  },
  captureSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.emerald[400],
    ...SHADOWS.card,
  },
  captureSuccessBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.slate[900],
  },
  captureStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  captureStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginTop: 4,
  },
  retakeButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.slate[800],
  },
  centerReticleFrame: {
    width: SCREEN_WIDTH * 0.78,
    height: SCREEN_WIDTH * 0.78,
    maxWidth: 320,
    maxHeight: 320,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: 16,
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.emerald[400],
  },
  bracketTopLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  bracketTopRight: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bracketBottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bracketBottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanningLaserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: COLORS.emerald[400],
    zIndex: 10,
  },
  laserGlow: {
    height: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
    marginTop: -6.5,
  },
  reticleHintBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  reticleHintTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  reticleHintSubtitle: {
    fontSize: 10,
    color: COLORS.slate[300],
    marginTop: 1,
  },
  bottomControlTray: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  traySideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    minHeight: 60,
  },
  traySideIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  traySideLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  shutterButtonOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  shutterButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.emerald[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButtonDisabled: {
    opacity: 0.6,
  },
  permissionBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 24,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  permissionIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 12,
    color: COLORS.slate[300],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.emerald[600],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 44,
  },
  permissionButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
});
