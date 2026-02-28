import React, { useState, useEffect } from 'react';
import { 
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 🔥 FIREBASE
import { auth, db } from './firebaseConfig'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUpScreen = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Zayıf Şifre', 'Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    setLoading(true);

    try {
      // 1️⃣ AUTH KAYDI
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 2️⃣ FIRESTORE KAYDI
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        isAdmin: false,
        createdAt: new Date(),
      });

      setLoading(false);

      // 3️⃣ BAŞARILI
      Alert.alert(
        'Tebrikler! 🎉',
        'Hesabınız başarıyla oluşturuldu.',
        [
          {
            text: 'Başla',
            onPress: () => {
              const returnScreen = route.params?.returnTo;
              const savedEventData = route.params?.eventData;

              if (returnScreen) {
                navigation.replace(returnScreen, { event: savedEventData });
              } else {
                navigation.replace('MainTabs');
              }
            },
          },
        ]
      );

    } catch (error) {
      setLoading(false);

      let message = 'Kayıt oluşturulamadı.';
      if (error.code === 'auth/email-already-in-use')
        message = 'Bu e-posta adresi zaten kullanımda.';
      if (error.code === 'auth/invalid-email')
        message = 'Geçersiz e-posta adresi.';
      if (error.code === 'auth/weak-password')
        message = 'Şifre çok zayıf.';

      Alert.alert('Hata', message);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
      }}
      style={styles.background}
      blurRadius={10}
    >
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.brandText}>
                KONYA<Text style={styles.brandVibe}>VIBE</Text>
              </Text>
              <Text style={styles.subText}>
                Aramıza Katıl, Eğlenceyi Kaçırma!
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#00f3ff" />
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  placeholderTextColor="#aaa"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#00f3ff" />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta Adresi"
                  placeholderTextColor="#aaa"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#00f3ff" />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre Belirle"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.signUpButton, loading && { opacity: 0.7 }]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? 'KAYDEDİLİYOR...' : 'KAYIT OL'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Login', {
                    returnTo: route.params?.returnTo,
                    eventData: route.params?.eventData,
                  })
                }
              >
                <Text style={styles.loginLink}> Giriş Yap</Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  backButton: { position: 'absolute', top: 50, left: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  brandText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  brandVibe: { color: '#00f3ff' },
  subText: { color: '#ccc', fontSize: 16, marginTop: 5 },
  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 60,
    marginBottom: 15,
  },
  input: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 10 },
  signUpButton: {
    backgroundColor: '#00f3ff',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#aaa' },
  loginLink: { color: '#00f3ff', fontWeight: 'bold' },
});

export default SignUpScreen;