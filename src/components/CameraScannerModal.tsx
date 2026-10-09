import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Alert,
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
  RefreshCw,
  SwitchCamera,
  ShieldAlert,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';
import { analyzeProductPhoto } from '../services/geminiService';

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
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      scanLoop.start();
      return () => scanLoop.stop();
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
    outputRange: [0, 140],
  });

  const scanOpacity = scanLineAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  // Toggle Camera Facing (Front / Back)
  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Process and analyze captured/selected image using real-time Gemini Vision + Search Grounding
  const processImageAnalysis = async (imageUri: string, base64Data?: string) => {
    setIsScanning(true);
    setScanningStep('EcoLens AI is reading label & retrieving live web facts...');

    try {
      // Call Gemini multimodal analysis with live Google Search Grounding
      const result = await analyzeProductPhoto(imageUri, base64Data);

      setIsScanning(false);
      setScanningStep('');
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
        'Live Web Audit Error',
        err.message ||
          'Unable to retrieve live web data for this product. Please check your connection or try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Real Shutter Snap
  const handleSnapPhoto = async () => {
    if (isScanning) return;

    try {
      setIsScanning(true);
      setScanningStep('EcoLens AI is reading label & retrieving live web facts...');

      if (Platform.OS === 'web') {
        // Capture frame from web video
        if (webVideoRef.current) {
          const video = webVideoRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            await processImageAnalysis(dataUrl, dataUrl);
            return;
          }
        }
      } else if (cameraRef.current) {
        // Native photo capture with base64 enabled
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        if (photo?.uri) {
          await processImageAnalysis(photo.uri, photo.base64);
          return;
        }
      }
    } catch (err: any) {
      setIsScanning(false);
      setScanningStep('');
      Alert.alert(
        'Camera Error',
        'Unable to capture product photo. Please try again or upload an image from gallery.'
      );
    }
  };

  // Pick Real Photo from Gallery
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
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
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Drag Pill */}
          <View style={styles.dragPill} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.cameraIconBadge}>
                <Camera size={18} color={COLORS.emerald[700]} strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Camera Photo Scanner</Text>
                <Text style={styles.headerSubtitle}>Live Viewfinder &bull; Packaging Sustainability</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
              accessibilityLabel="Close scanner"
            >
              <X size={18} color={COLORS.slate[600]} />
            </TouchableOpacity>
          </View>

          {/* Live Camera Viewfinder Screen */}
          <View style={styles.viewfinderCanvas}>
            {/* PERMISSION NOT GRANTED — show only permission prompt, nothing else */}
            {Platform.OS !== 'web' && !hasCameraPermission ? (
              <View style={styles.permissionBox}>
                <View style={styles.permissionIconRing}>
                  <ShieldAlert size={32} color={COLORS.amber[600]} />
                </View>
                <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
                <Text style={styles.permissionSubtitle}>
                  EcoLens needs camera access to photo scan product packaging and analyse sustainability.
                </Text>
                <TouchableOpacity
                  onPress={requestPermission}
                  style={styles.permissionButton}
                  activeOpacity={0.8}
                >
                  <Camera size={16} color={COLORS.white} />
                  <Text style={styles.permissionButtonText}>Enable Camera Access</Text>
                </TouchableOpacity>
                <Text style={styles.permissionHint}>
                  Or use the Upload button below to scan a saved photo
                </Text>
              </View>
            ) : (
              /* CAMERA ACTIVE — live feed + overlay frame */
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

                {/* Central Scanning Frame Overlay */}
                <View style={styles.centerFrame}>
                  <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
                  <View style={[styles.cornerBracket, styles.bracketTopRight]} />
                  <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
                  <View style={[styles.cornerBracket, styles.bracketBottomRight]} />

                  {/* Animated Laser Sweep */}
                  <Animated.View
                    style={[
                      styles.scanningLaserBeam,
                      { transform: [{ translateY }], opacity: scanOpacity },
                    ]}
                  >
                    <View style={styles.laserGlow} />
                  </Animated.View>

                  {/* Guidance / Scanning State */}
                  {isScanning ? (
                    <View style={styles.scanningStateBox}>
                      <ActivityIndicator size="small" color={COLORS.emerald[600]} />
                      <Text style={styles.scanningStepText}>{scanningStep}</Text>
                    </View>
                  ) : (
                    <View style={styles.guidanceBox}>
                      <Text style={styles.guidanceTitle}>Align Product in Frame</Text>
                      <Text style={styles.guidanceSubtitle}>
                        Point lens at product packaging or label
                      </Text>
                    </View>
                  )}
                </View>

                {/* Flip Camera Button */}
                <TouchableOpacity
                  onPress={toggleCameraFacing}
                  style={styles.floatingFlipButton}
                  activeOpacity={0.8}
                  accessibilityLabel="Flip camera"
                >
                  <SwitchCamera size={18} color={COLORS.white} />
                </TouchableOpacity>

                {/* Live Badge */}
                <View style={styles.cameraFeedBadge}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.cameraFeedText}>Live Lens • AI Powered</Text>
                </View>
              </>
            )}
          </View>

          {/* Bottom Action Controls: Flash Toggle, Shutter, and Upload Photo */}
          <View style={styles.bottomControlBar}>
            {/* 1. Flash Toggle Button */}
            <TouchableOpacity
              onPress={() => setFlashEnabled(!flashEnabled)}
              style={[
                styles.actionPillButton,
                flashEnabled && styles.actionPillButtonActive,
              ]}
              activeOpacity={0.8}
            >
              {flashEnabled ? (
                <Zap size={18} color={COLORS.amber[700]} strokeWidth={2.4} />
              ) : (
                <ZapOff size={18} color={COLORS.slate[600]} strokeWidth={2.2} />
              )}
              <Text
                style={[
                  styles.actionPillText,
                  flashEnabled && styles.actionPillTextActive,
                ]}
              >
                {flashEnabled ? 'Flash On' : 'Flash'}
              </Text>
            </TouchableOpacity>

            {/* 2. Main Center Shutter Trigger */}
            <TouchableOpacity
              onPress={handleSnapPhoto}
              disabled={isScanning}
              style={styles.shutterButtonOuter}
              activeOpacity={0.85}
              accessibilityLabel="Take Photo"
            >
              <View style={styles.shutterButtonInner}>
                <Camera size={24} color={COLORS.white} strokeWidth={2.4} />
              </View>
            </TouchableOpacity>

            {/* 3. Upload Photo Manually Button */}
            <TouchableOpacity
              onPress={handlePickFromGallery}
              style={styles.actionPillButton}
              activeOpacity={0.8}
            >
              <ImageIcon size={18} color={COLORS.emerald[700]} strokeWidth={2.2} />
              <Text style={[styles.actionPillText, { color: COLORS.emerald[800] }]}>
                Upload
              </Text>
            </TouchableOpacity>
          </View>

          {/* Real-time Camera Scan Guidance Card */}
          <View style={styles.simulationTray}>
            <View style={styles.trayHeaderRow}>
              <Text style={styles.trayTitle}>Real-Time Vision &amp; Web Grounding</Text>
              <View style={styles.instantTag}>
                <Sparkles size={11} color={COLORS.emerald[700]} />
                <Text style={styles.instantTagText}>Live Gemini Engine</Text>
              </View>
            </View>

            <View style={styles.guidanceCard}>
              <Text style={styles.guidanceText}>
                Point your camera directly at the product packaging or nutrition label and tap the shutter button. EcoLens will read the packaging material and retrieve live sustainability facts from the web.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '94%',
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  dragPill: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: COLORS.slate[300],
    alignSelf: 'center',
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  cameraIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.emerald[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.slate[900],
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.slate[500],
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderCanvas: {
    height: 250,
    backgroundColor: COLORS.slate[900],
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  centerFrame: {
    width: 260,
    height: 150,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 14,
    overflow: 'hidden',
    zIndex: 10,
  },
  cornerBracket: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: COLORS.emerald[400],
  },
  bracketTopLeft: {
    top: -1.5,
    left: -1.5,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 6,
  },
  bracketTopRight: {
    top: -1.5,
    right: -1.5,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 6,
  },
  bracketBottomLeft: {
    bottom: -1.5,
    left: -1.5,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 6,
  },
  bracketBottomRight: {
    bottom: -1.5,
    right: -1.5,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 6,
  },
  scanningLaserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: COLORS.emerald[400],
  },
  laserGlow: {
    height: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    marginTop: -4.5,
  },
  scanningStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.emerald[300],
    gap: 7,
    ...SHADOWS.card,
  },
  scanningStepText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.slate[800],
    textAlign: 'center',
  },
  guidanceBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  guidanceSubtitle: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 14,
  },
  floatingFlipButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  cameraFeedBadge: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 20,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald[400],
  },
  cameraFeedText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  permissionBox: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 10,
  },
  permissionIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.amber[50],
    borderWidth: 2,
    borderColor: COLORS.amber[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate[900],
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  permissionSubtitle: {
    fontSize: 12.5,
    color: COLORS.slate[500],
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 4,
    maxWidth: 240,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.emerald[600],
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 4,
    ...SHADOWS.glow,
  },
  permissionButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  permissionHint: {
    fontSize: 11,
    color: COLORS.slate[400],
    textAlign: 'center',
    marginTop: 6,
  },
  bottomControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  actionPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.slate[100],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    minHeight: 44,
  },
  actionPillButtonActive: {
    backgroundColor: COLORS.amber[50],
    borderColor: COLORS.amber[300],
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate[700],
  },
  actionPillTextActive: {
    color: COLORS.amber[900],
  },
  shutterButtonOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.emerald[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.emerald[300],
    ...SHADOWS.glow,
  },
  shutterButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.emerald[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulationTray: {
    padding: 14,
    backgroundColor: COLORS.slate[50],
    maxHeight: 250,
  },
  trayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  trayTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate[700],
  },
  instantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    backgroundColor: COLORS.emerald[100],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.emerald[200],
  },
  instantTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.emerald[800],
  },
  guidanceCard: {
    backgroundColor: COLORS.slate[50],
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 14,
    padding: 12,
  },
  guidanceText: {
    fontSize: 12,
    color: COLORS.slate[600],
    lineHeight: 17,
  },
  samplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 10,
  },
  sampleCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    minHeight: 52,
    ...SHADOWS.card,
  },
  sampleName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.slate[900],
  },
  sampleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  sampleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sampleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
