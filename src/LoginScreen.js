import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, ImageBackground, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './UserContext'; 
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig'; 

const LoginScreen = ({ navigation, route }) => {
  const { login } = useUser(); 
   
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim(); 

    if (cleanEmail === '' || cleanPassword === '') {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
        const response = await login(cleanEmail, cleanPassword);
        
        if (response.success) {
            const returnScreen = route.params?.returnTo;
            const savedEventData = route.params?.eventData;

            if (returnScreen && savedEventData) {
                navigation.replace(returnScreen, { event: savedEventData });
            } else {
                navigation.replace('MainTabs');
            }
        } else {
            let errorMessage = "Giriş yapılamadı.";
            const errString = String(response.error);
            if (errString.includes('user-not-found')) errorMessage = "Bu e-posta ile kayıtlı kullanıcı yok.";
            else if (errString.includes('wrong-password')) errorMessage = "Şifre hatalı.";
            else if (errString.includes('invalid-email')) errorMessage = "E-posta formatı hatalı.";
            else if (errString.includes('too-many-requests')) errorMessage = "Çok fazla deneme yaptınız. Lütfen biraz bekleyin.";
            else if (errString.includes('invalid-credential')) errorMessage = "E-posta veya şifre yanlış.";
            Alert.alert("Giriş Başarısız", errorMessage);
        }
    } catch (error) {
        Alert.alert("Hata", "Beklenmedik bir sorun oluştu.");
    } finally {
        setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
        Alert.alert("E-posta Gerekli", "Şifre sıfırlama bağlantısı gönderebilmemiz için lütfen yukarıya e-posta adresinizi yazın.");
        return;
    }
    try {
        setLoading(true);
        await sendPasswordResetEmail(auth, cleanEmail);
        setLoading(false);
        Alert.alert("E-posta Gönderildi 📩", "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    } catch (error) {
        setLoading(false);
        let msg = "Bir hata oluştu.";
        if (error.code === 'auth/user-not-found') msg = "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.";
        Alert.alert("Hata", msg);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.pexels.com/photos/1677710/pexels-photo-1677710.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }} 
      style={styles.background}
      blurRadius={10}
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                 <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.header}>
              <Text style={styles.brandText}>KONYA<Text style={styles.brandVibe}>VIBE</Text></Text>
              <Text style={styles.subText}>Tekrar Hoş Geldin!</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#00f3ff" style={styles.icon} />
                <TextInput style={styles.input} placeholder="E-posta Adresi" placeholderTextColor="#aaa" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#00f3ff" style={styles.icon} />
                <TextInput style={styles.input} placeholder="Şifre" placeholderTextColor="#aaa" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.loginButton, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassContainer}>
                  <Text style={styles.forgotPassText}>Şifreni mi unuttun?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Hesabın yok mu?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp', { returnTo: route.params?.returnTo, eventData: route.params?.eventData })}>
                <Text style={styles.signUpLink}> Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: 30 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  header: { alignItems: 'center', marginBottom: 50 },
  brandText: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  brandVibe: { color: '#00f3ff' },
  subText: { color: '#ccc', fontSize: 16, marginTop: 5 },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 30, paddingHorizontal: 20, height: 60, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  loginButton: { backgroundColor: '#00f3ff', borderRadius: 30, height: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#00f3ff', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5, marginTop: 10 },
  loginButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  forgotPassContainer: { alignItems: 'center', marginTop: 15, padding: 5 },
  forgotPassText: { color: '#aaa', fontSize: 14, textDecorationLine: 'underline' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#aaa', fontSize: 14 },
  signUpLink: { color: '#00f3ff', fontWeight: 'bold', fontSize: 14 },
});

export default LoginScreen;