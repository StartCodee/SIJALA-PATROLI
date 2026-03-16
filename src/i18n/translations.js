import { DEFAULT_LANGUAGE } from "./localeConfig";

const commonDictionaries = {
  id: {
    "Bahasa": "Bahasa",
    "Bahasa Indonesia": "Bahasa Indonesia",
    "Bahasa Inggris": "Bahasa Inggris",
    "Buka Portal SSO": "Buka Portal SSO",
    "Buka profil SSO": "Buka profil SSO",
    "Buka sidebar": "Buka sidebar",
    "Cari...": "Cari...",
    "Ciutkan menu samping": "Ciutkan menu samping",
    "Dashboard": "Dashboard",
    "Daftar Patroli": "Daftar Patroli",
    "Keluar": "Keluar",
    "Laporan Kejadian": "Laporan Kejadian",
    "Management Speedboat": "Management Speedboat",
    "Masuk Dashboard Patroli": "Masuk Dashboard Patroli",
    "Menu Utama": "Menu Utama",
    "Monitoring Habitat": "Monitoring Habitat",
    "Monitoring Pemanfaatan (RUM)": "Monitoring Pemanfaatan (RUM)",
    "Patroli": "Patroli",
    "Patroli Jaga Laut": "Patroli Jaga Laut",
    "Pelabuhan/Pos Jaga": "Pelabuhan/Pos Jaga",
    "Perluas menu samping": "Perluas menu samping",
    "Personel": "Personel",
    "Profil": "Profil",
    "Profil Akun": "Profil Akun",
    "Temuan": "Temuan",
    "Tutup sidebar": "Tutup sidebar",
  },
  en: {
    "Bahasa": "Language",
    "Bahasa Indonesia": "Indonesian",
    "Bahasa Inggris": "English",
    "Buka Portal SSO": "Open SSO Portal",
    "Buka profil SSO": "Open SSO profile",
    "Buka sidebar": "Open sidebar",
    "Cari...": "Search...",
    "Ciutkan menu samping": "Collapse sidebar",
    "Dashboard": "Dashboard",
    "Daftar Patroli": "Patrol List",
    "Keluar": "Logout",
    "Laporan Kejadian": "Incident Reports",
    "Management Speedboat": "Speedboat Management",
    "Masuk Dashboard Patroli": "Patrol Dashboard Login",
    "Menu Utama": "Main Menu",
    "Monitoring Habitat": "Habitat Monitoring",
    "Monitoring Pemanfaatan (RUM)": "Use Monitoring (RUM)",
    "Patroli": "Patrol",
    "Patroli Jaga Laut": "Sea Patrol",
    "Pelabuhan/Pos Jaga": "Harbor / Guard Post",
    "Perluas menu samping": "Expand sidebar",
    "Personel": "Personnel",
    "Profil": "Profile",
    "Profil Akun": "Account Profile",
    "Temuan": "Findings",
    "Tutup sidebar": "Close sidebar",
  },
};

const sharedDictionaries = {
  id: {},
  en: {},
};

export function getCommonDictionary(language) {
  return commonDictionaries[language] || commonDictionaries[DEFAULT_LANGUAGE];
}

export function getPageDictionary() {
  return {};
}

export function getMergedDictionary(language, pageKey) {
  return {
    ...getCommonDictionary(language),
    ...getPageDictionary(language, pageKey),
    ...(sharedDictionaries[language] || sharedDictionaries[DEFAULT_LANGUAGE]),
  };
}
