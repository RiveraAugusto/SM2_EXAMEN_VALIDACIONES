import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, StatusBar, Platform, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginWithGoogle } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_WEB_CLIENT_ID } from '../config/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let nativeGoogleSignin;
let nativeStatusCodes;
if (Platform.OS !== 'web') {
  const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');
  nativeGoogleSignin = GoogleSignin;
  nativeStatusCodes = statusCodes;
  nativeGoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });

  const validateEmail = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'El correo es obligatorio.';
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(trimmed)) return 'Ingresa un correo válido (ej. usuario@dominio.com).';
    return '';
  };

  const validatePassword = (value) => {
    const password = value || '';
    if (!password) return 'La contraseña es obligatoria.';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return 'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.';
    }
    return '';
  };

  const validateForm = ({ email, password }) => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nextErrors = { email: emailError, password: passwordError };
    setFormErrors(nextErrors);
    return !emailError && !passwordError;
  };

  const handleEmailChange = (value) => {
    setFormEmail(value);
    if (!submitAttempted) return;
    setFormErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (value) => {
    setFormPassword(value);
    if (!submitAttempted) return;
    setFormErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const ok = validateForm({ email: formEmail, password: formPassword });
    if (!ok) return;

    setFormSubmitting(true);
    setTimeout(() => {
      setFormSubmitting(false);
      Alert.alert('Listo', 'Validación exitosa. Envío simulado por 2 segundos.', [{ text: 'OK' }]);
    }, 2000);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      let firebaseUser;

      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        firebaseUser = await signInWithPopup(auth, provider);
      } else {
        await nativeGoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const userInfo = await nativeGoogleSignin.signIn();
        const idToken = userInfo.data?.idToken || userInfo.idToken;
        if (!idToken) throw new Error('No se recibió token de Google');

        const credential = GoogleAuthProvider.credential(idToken);
        firebaseUser = await signInWithCredential(auth, credential);
      }

      const firebaseIdToken = await firebaseUser.user.getIdToken();
      const userData = await loginWithGoogle(firebaseIdToken);
      await signIn(userData);
    } catch (error) {
      console.error('Login error:', error);
      const ignoredCodes = nativeStatusCodes
        ? [nativeStatusCodes.SIGN_IN_CANCELLED, nativeStatusCodes.IN_PROGRESS]
        : [];
      const webIgnoredCodes = Platform.OS === 'web'
        ? ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']
        : [];
      if (!ignoredCodes.includes(error.code) && !webIgnoredCodes.includes(error.code)) {
        let message = error.message || 'No se pudo iniciar sesión.';
        if (Platform.OS === 'web' && error.code === 'auth/unauthorized-domain') {
          message = 'Dominio no autorizado por Firebase Auth. Agrega localhost como dominio autorizado en Firebase Console.';
        }
        Alert.alert('Error de Autenticación', message, [{ text: 'OK' }]);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Top gradient section */}
      <View style={[styles.topSection, { paddingTop: insets.top + 40 }]}>
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={44} color={COLORS.textLight} />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={styles.brandName}>
          RCE UPT
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.brandLine} />
        <Animated.Text entering={FadeInDown.delay(600).duration(400)} style={styles.brandSub}>
          Red Colaborativa Estudiantil
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(700).duration(400)} style={styles.brandInstitution}>
          Universidad Privada de Tacna
        </Animated.Text>
      </View>

      {/* Bottom card */}
      <Animated.View entering={FadeInUp.delay(300).duration(700)} style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <Text style={styles.welcomeTitle}>Bienvenido</Text>
        <Text style={styles.welcomeSub}>
          Conecta con la comunidad académica. Publica dudas, ofrece mentoría y gana experiencia.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Inicia sesión</Text>

          <Text style={styles.inputLabel}>Correo electrónico</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="usuario@dominio.com"
              placeholderTextColor={COLORS.textMuted}
              value={formEmail}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!formSubmitting && !googleLoading}
            />
          </View>
          {submitAttempted && !!formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}

          <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Contraseña</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="********"
              placeholderTextColor={COLORS.textMuted}
              value={formPassword}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!formSubmitting && !googleLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
              disabled={formSubmitting || googleLoading}
              activeOpacity={0.7}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          {submitAttempted && !!formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}

          <TouchableOpacity
            style={[styles.submitBtn, (formSubmitting || googleLoading) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={formSubmitting || googleLoading}
            activeOpacity={0.8}
          >
            {formSubmitting ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={COLORS.textLight} size="small" />
                <Text style={[styles.loadingText, { color: COLORS.textLight }]}>Enviando...</Text>
              </View>
            ) : (
              <View style={styles.submitBtnContent}>
                <Ionicons name="log-in-outline" size={18} color={COLORS.textLight} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnLabel}>Enviar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleBtn, googleLoading && styles.googleBtnDisabled]}
          onPress={handleGoogleLogin}
          disabled={googleLoading || formSubmitting}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={styles.loadingText}>Conectando...</Text>
            </View>
          ) : (
            <View style={styles.googleBtnContent}>
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleBtnLabel}>Continuar con Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.domainNotice}>
          <Ionicons name="lock-open-outline" size={14} color={COLORS.success} style={{ marginRight: 6 }} />
          <Text style={styles.domainText}>Acceso con cualquier cuenta Google</Text>
        </View>

        <Text style={styles.footerText}>
          Plataforma de mentoría académica P2P
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  topSection: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl,
    overflow: 'hidden', position: 'relative',
  },
  decorCircle1: {
    position: 'absolute', top: -60, right: -50,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  decorCircle2: {
    position: 'absolute', bottom: -30, left: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  logoContainer: { marginBottom: SPACING.lg },
  logoCircle: {
    width: 90, height: 90, borderRadius: RADIUS.full, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.large,
  },
  brandName: {
    fontSize: FONTS.sizes.display, fontWeight: '800', color: COLORS.textLight,
    textAlign: 'center', letterSpacing: 2, marginBottom: SPACING.sm,
  },
  brandLine: { width: 44, height: 3, borderRadius: 2, backgroundColor: COLORS.accent, marginBottom: SPACING.md },
  brandSub: { fontSize: FONTS.sizes.lg, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  brandInstitution: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginTop: SPACING.xs },
  bottomSection: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl,
    ...SHADOWS.large,
  },
  welcomeTitle: { fontSize: FONTS.sizes.hero, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  welcomeSub: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.xl },
  formCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  formTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
  inputLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  eyeBtn: { paddingLeft: 10, paddingVertical: 4 },
  errorText: { marginTop: 6, fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.error },
  submitBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.medium,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submitBtnLabel: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textLight },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderLight },
  dividerText: { marginHorizontal: 10, fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: '700' },
  googleBtn: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, paddingVertical: 16, paddingHorizontal: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.medium,
  },
  googleBtnDisabled: { opacity: 0.7 },
  googleBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  googleIcon: { width: 22, height: 22, marginRight: SPACING.md },
  googleBtnLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginLeft: SPACING.sm, fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.primary },
  domainNotice: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.lg,
  },
  domainText: { fontSize: FONTS.sizes.sm, color: COLORS.success, fontWeight: '600' },
  footerText: {
    fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl,
  },
});
