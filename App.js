import React, { useState, useEffect } from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// 🔥 DÜZELTME: src klasörünün içinden çağırıyoruz
import { CartProvider } from './src/CartContext';
import { UserProvider, useUser } from './src/UserContext'; 

// --- SPLASH SCREEN ---
import SplashScreen from './src/SplashScreen'; 

// Görevli sayfası
import ScannerScreen from './src/ScannerScreen';

// --- EKRANLAR ---
import HomeScreen from './src/HomeScreen';
import EventDetailScreen from './src/EventDetailScreen';
import TicketSelectionScreen from './src/TicketSelectionScreen';
import ProfileScreen from './src/ProfileScreen';
import CartScreen from './src/CartScreen';
import PaymentScreen from './src/PaymentScreen';
import DigitalTicketScreen from './src/DigitalTicketScreen';
import MyTicketsScreen from './src/MyTicketsScreen';
import PastEventsScreen from './src/PastEventsScreen';
import CouponsScreen from './src/CouponsScreen';
import ContactSupportScreen from './src/ContactSupportScreen';
import HelpScreen from './src/HelpScreen';
import LoginScreen from './src/LoginScreen';
import SignUpScreen from './src/SignUpScreen';
import AdminScreen from './src/AdminScreen';
import VenueEventsScreen from './src/VenueEventsScreen';
import LegalDocumentsScreen from './src/LegalDocumentsScreen';

LogBox.ignoreLogs(['setLayoutAnimationEnabledExperimental', 'Sending...']);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- ALT MENÜ ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: { 
            position: 'absolute', bottom: 25, left: 20, right: 20, 
            elevation: 0, backgroundColor: '#1A1A1A', borderTopWidth: 0, 
            borderRadius: 15, height: 75, ...styles.shadow 
        }
      }}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} 
        options={{ headerShown: false, tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={30} color={focused ? '#00f3ff' : '#666'} />
            </View>
          ),
        }} 
      />
      <Tab.Screen name="Sepetim" component={CartScreen} 
        options={{ headerShown: false, tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center',top:12 }}>
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={34} color={focused ? '#00f3ff' : '#666'} />
            </View>
          )
        }} 
      />
      <Tab.Screen name="Profil" component={ProfileScreen} 
        options={{ headerShown: false, tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center',top:11 }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={33} color={focused ? '#00f3ff' : '#666'} />
            </View>
          ),
        }} 
      />
    </Tab.Navigator>
  );
}

// --- NAVIGASYON YAPISI (Auth ve Rol Kontrolü Burada) ---
const AppContent = () => {
  const { initializing, isStaff } = useUser();
  const [isSplashFinished, setSplashFinished] = useState(false);

  // Splash ekranı en az 2 saniye görünsün istiyoruz
  useEffect(() => {
    if (!initializing) {
      const timer = setTimeout(() => {
        setSplashFinished(true);
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [initializing]);

  // Eğer yükleniyorsa veya süre dolmadıysa Splash göster
  if (initializing || !isSplashFinished) {
      return <SplashScreen />;
  }

  // EĞER GÖREVLİ İSE DİREKT KAMERAYI AÇ
  if (isStaff) {
      return <ScannerScreen />;
  }

  // NORMAL KULLANICI İSE STANDART UYGULAMA AÇILSIN
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* HERKESİN GÖRDÜĞÜ EKRANLAR */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="VenueEvents" component={VenueEventsScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="TicketSelection" component={TicketSelectionScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="PastEvents" component={PastEventsScreen} />
        <Stack.Screen name="Coupons" component={CouponsScreen} />
        <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
        <Stack.Screen name ="LegalDocuments" component={LegalDocumentsScreen}/>

        {/* GİRİŞ / KAYIT */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        {/* ÖZEL EKRANLAR */}
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
        <Stack.Screen name="DigitalTicket" component={DigitalTicketScreen} />
        <Stack.Screen name="AdminPanel" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <UserProvider>
      <CartProvider>
         <AppContent />
      </CartProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#00f3ff', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25, shadowRadius: 3.5, elevation: 5,
  }
});