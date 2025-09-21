// إدارة الإعدادات والتخزين المحلي

// دالة لترحيل الإعدادات من النسخة القديمة إلى الجديدة
function migrateOldSettings() {
  const oldSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  
  if (oldSettings.selectedSound || oldSettings.appearance) {
    // فصل إعدادات الصوت
    const soundSettings = {
      selectedSound: oldSettings.selectedSound || 'abdul-basit',
      playFajrAdhan: oldSettings.playFajrAdhan !== undefined ? oldSettings.playFajrAdhan : true,
      playDhuhrAdhan: oldSettings.playDhuhrAdhan !== undefined ? oldSettings.playDhuhrAdhan : true,
      playAsrAdhan: oldSettings.playAsrAdhan !== undefined ? oldSettings.playAsrAdhan : true,
      playMaghribAdhan: oldSettings.playMaghribAdhan !== undefined ? oldSettings.playMaghribAdhan : true,
      playIshaAdhan: oldSettings.playIshaAdhan !== undefined ? oldSettings.playIshaAdhan : true,
      volumeLevel: oldSettings.volumeLevel !== undefined ? oldSettings.volumeLevel : 80
    };
    
    // فصل إعدادات المظهر
    const appearanceSettings = {
      appearance: oldSettings.appearance || 'auto'
    };
    
    // حفظ الإعدادات الجديدة
    localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    
    // إزالة الخصائص القديمة من كائن الإعدادات
    delete oldSettings.selectedSound;
    delete oldSettings.playFajrAdhan;
    delete oldSettings.playDhuhrAdhan;
    delete oldSettings.playAsrAdhan;
    delete oldSettings.playMaghribAdhan;
    delete oldSettings.playIshaAdhan;
    delete oldSettings.volumeLevel;
    delete oldSettings.appearance;
    
    // حفظ إعدادات الصلاة المتبقية
    localStorage.setItem('prayerSettings', JSON.stringify(oldSettings));
  }
}

function loadSettings() {
  // ترحيل الإعدادات القديمة أولاً
  migrateOldSettings();
  
  // تحميل كل مجموعة إعدادات بشكل منفصل
  const prayerSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  const soundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};
  const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings')) || {};
  
  const calculationMethodSelect = document.getElementById('calculation-method');
  const timeFormatSelect = document.getElementById('time-format');
  const roundingMethodSelect = document.getElementById('rounding-method');
  const manualLocation = document.getElementById('manual-location');
  const toggleAsr = document.getElementById('toggle-asr');
  const toggleIsha = document.getElementById('toggle-isha');
  const toggleFajrAdhan = document.getElementById('toggle-fajr-adhan');
  const toggleDhuhrAdhan = document.getElementById('toggle-dhuhr-adhan');
  const toggleAsrAdhan = document.getElementById('toggle-asr-adhan');
  const toggleMaghribAdhan = document.getElementById('toggle-maghrib-adhan');
  const toggleIshaAdhan = document.getElementById('toggle-isha-adhan');
  const volumeLevel = document.getElementById('volume-level');
  const toggleFajrNotification = document.getElementById('toggle-fajr-notification');
  const toggleDhuhrNotification = document.getElementById('toggle-dhuhr-notification');
  const toggleAsrNotification = document.getElementById('toggle-asr-notification');
  const toggleMaghribNotification = document.getElementById('toggle-maghrib-notification');
  const toggleIshaNotification = document.getElementById('toggle-isha-notification');

  // تحميل إعدادات الصلاة
  if (prayerSettings.calculationMethod) calculationMethodSelect.value = prayerSettings.calculationMethod;
  if (prayerSettings.timeFormat) timeFormatSelect.value = prayerSettings.timeFormat;
  if (prayerSettings.roundingMethod) roundingMethodSelect.value = prayerSettings.roundingMethod;
  if (prayerSettings.city) manualLocation.value = prayerSettings.city;
  if (prayerSettings.latitude) currentLocation.latitude = prayerSettings.latitude;
  if (prayerSettings.longitude) currentLocation.longitude = prayerSettings.longitude;
  if (prayerSettings.cityName) currentLocation.city = prayerSettings.cityName;

  toggleAsr.checked = prayerSettings.showAsr !== undefined ? prayerSettings.showAsr : true;
  toggleIsha.checked = prayerSettings.showIsha !== undefined ? prayerSettings.showIsha : true;

  // تحميل إعدادات الإشعارات
  toggleFajrNotification.checked = prayerSettings.fajrNotification !== undefined ? prayerSettings.fajrNotification : true;
  toggleDhuhrNotification.checked = prayerSettings.dhuhrNotification !== undefined ? prayerSettings.dhuhrNotification : true;
  toggleAsrNotification.checked = prayerSettings.asrNotification !== undefined ? prayerSettings.asrNotification : true;
  toggleMaghribNotification.checked = prayerSettings.maghribNotification !== undefined ? prayerSettings.maghribNotification : true;
  toggleIshaNotification.checked = prayerSettings.ishaNotification !== undefined ? prayerSettings.ishaNotification : true;

  // تحميل إعدادات الصوت
  if (soundSettings.selectedSound) {
    selectSound(soundSettings.selectedSound);
  } else {
    selectSound('abdul-basit'); // قيمة افتراضية
  }

  // تعيين القيم الافتراضية للتشغيل التلقائي إذا لم تكن محددة
  toggleFajrAdhan.checked = soundSettings.playFajrAdhan !== undefined ? soundSettings.playFajrAdhan : true;
  toggleDhuhrAdhan.checked = soundSettings.playDhuhrAdhan !== undefined ? soundSettings.playDhuhrAdhan : true;
  toggleAsrAdhan.checked = soundSettings.playAsrAdhan !== undefined ? soundSettings.playAsrAdhan : true;
  toggleMaghribAdhan.checked = soundSettings.playMaghribAdhan !== undefined ? soundSettings.playMaghribAdhan : true;
  toggleIshaAdhan.checked = soundSettings.playIshaAdhan !== undefined ? soundSettings.playIshaAdhan : true;

  if (soundSettings.volumeLevel !== undefined) volumeLevel.value = soundSettings.volumeLevel;
  else volumeLevel.value = 80; // قيمة حجم افتراضية

  // تحميل إعدادات المظهر
  if (appearanceSettings.appearance) {
    selectAppearance(appearanceSettings.appearance);
    applyAppearance(appearanceSettings.appearance);
  } else {
    selectAppearance('auto');
    applyAppearance('auto');
  }

  // دعم التوافق مع الإصدارات القديمة (إذا كانت الإعدادات مخزنة في كائن واحد)
  const oldSettings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  if (oldSettings.selectedSound && !soundSettings.selectedSound) {
    selectSound(oldSettings.selectedSound);
  }
  if (oldSettings.appearance && !appearanceSettings.appearance) {
    selectAppearance(oldSettings.appearance);
    applyAppearance(oldSettings.appearance);
  }

  // إضافة مستمعي الأحداث للحفظ التلقائي
  initAutoSaveEvents();

  return {
    ...prayerSettings,
    ...soundSettings,
    ...appearanceSettings
  };
}

// دالة للحفظ التلقائي للإعدادات
function autoSaveSettings() {
  const selectedSound = document.querySelector('#adhan-sounds-list .sound-item.active')?.dataset.sound || 'abdul-basit';
  const selectedAppearance = document.querySelector('#appearance-list .sound-item.active')?.dataset.appearance || 'auto';
  const calculationMethodSelect = document.getElementById('calculation-method');
  const timeFormatSelect = document.getElementById('time-format');
  const roundingMethodSelect = document.getElementById('rounding-method');
  const manualLocation = document.getElementById('manual-location');
  const toggleAsr = document.getElementById('toggle-asr');
  const toggleIsha = document.getElementById('toggle-isha');
  const toggleFajrAdhan = document.getElementById('toggle-fajr-adhan');
  const toggleDhuhrAdhan = document.getElementById('toggle-dhuhr-adhan');
  const toggleAsrAdhan = document.getElementById('toggle-asr-adhan');
  const toggleMaghribAdhan = document.getElementById('toggle-maghrib-adhan');
  const toggleIshaAdhan = document.getElementById('toggle-isha-adhan');
  const volumeLevel = document.getElementById('volume-level');
  const toggleFajrNotification = document.getElementById('toggle-fajr-notification');
  const toggleDhuhrNotification = document.getElementById('toggle-dhuhr-notification');
  const toggleAsrNotification = document.getElementById('toggle-asr-notification');
  const toggleMaghribNotification = document.getElementById('toggle-maghrib-notification');
  const toggleIshaNotification = document.getElementById('toggle-isha-notification');

  // حفظ إعدادات الصلاة والموقع بشكل منفصل
  const prayerSettings = {
    calculationMethod: calculationMethodSelect.value,
    timeFormat: timeFormatSelect.value,
    roundingMethod: roundingMethodSelect.value,
    city: manualLocation.value,
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    cityName: currentLocation.city,
    showAsr: toggleAsr.checked,
    showIsha: toggleIsha.checked,
    // إعدادات الإشعارات
    fajrNotification: toggleFajrNotification.checked,
    dhuhrNotification: toggleDhuhrNotification.checked,
    asrNotification: toggleAsrNotification.checked,
    maghribNotification: toggleMaghribNotification.checked,
    ishaNotification: toggleIshaNotification.checked
  };
  
  // حفظ إعدادات الصوت بشكل منفصل
  const soundSettings = {
    selectedSound: selectedSound,
    playFajrAdhan: toggleFajrAdhan.checked,
    playDhuhrAdhan: toggleDhuhrAdhan.checked,
    playAsrAdhan: toggleAsrAdhan.checked,
    playMaghribAdhan: toggleMaghribAdhan.checked,
    playIshaAdhan: toggleIshaAdhan.checked,
    volumeLevel: volumeLevel.value
  };
  
  // حفظ إعدادات المظهر بشكل منفصل
  const appearanceSettings = {
    appearance: selectedAppearance
  };

  // حفظ كل مجموعة إعدادات بشكل منفصل
  localStorage.setItem('prayerSettings', JSON.stringify(prayerSettings));
  localStorage.setItem('soundSettings', JSON.stringify(soundSettings));
  localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));

  // تطبيق المظهر بعد الحفظ
  applyAppearance(selectedAppearance);

  // إعادة حساب أوقات الصلاة بعد تغيير الإعدادات
  if (typeof calculateAndDisplayPrayerTimes === 'function') {
    calculateAndDisplayPrayerTimes();
  }

  // إعادة تشغيل مراقبة الإشعارات بعد حفظ الإعدادات
  if (typeof startNotificationChecker === 'function') {
    startNotificationChecker();
  }

  console.log('تم الحفظ التلقائي للإعدادات');
}

// تهيئة أحداث الحفظ التلقائي
function initAutoSaveEvents() {
  // إعدادات الصلاة
  const prayerElements = [
    'calculation-method', 'time-format', 'rounding-method', 'manual-location',
    'toggle-asr', 'toggle-isha'
  ];
  
  prayerElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', autoSaveSettings);
    }
  });
  
  // إعدادات الإشعارات
  const notificationElements = [
    'toggle-fajr-notification', 'toggle-dhuhr-notification', 
    'toggle-asr-notification', 'toggle-maghrib-notification', 
    'toggle-isha-notification'
  ];
  
  notificationElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', autoSaveSettings);
    }
  });
  
  // إعدادات الصوت
  const soundElements = [
    'toggle-fajr-adhan', 'toggle-dhuhr-adhan', 
    'toggle-asr-adhan', 'toggle-maghrib-adhan', 
    'toggle-isha-adhan', 'volume-level'
  ];
  
  soundElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', autoSaveSettings);
      if (id === 'volume-level') {
        element.addEventListener('input', autoSaveSettings);
      }
    }
  });
}

function selectSound(soundId) {
  const soundItems = document.querySelectorAll('#adhan-sounds-list .sound-item');
  soundItems.forEach(item => {
    if (item.dataset.sound === soundId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function selectAppearance(appearanceId) {
  const appearanceItems = document.querySelectorAll('#appearance-list .sound-item');
  appearanceItems.forEach(item => {
    if (item.dataset.appearance === appearanceId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function applyAppearance(appearance) {
  let darkMode = false;

  if (appearance === 'dark') {
    darkMode = true;
  } else if (appearance === 'auto') {
    // التحقق من تفضيلات النظام
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      darkMode = true;
    }
  }

  if (darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// تهيئة الأحداث الخاصة بالأصوات
function initSoundEvents() {
  const soundItems = document.querySelectorAll('#adhan-sounds-list .sound-item');
  
  // حدث النقر على عنصر صوت
  soundItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('play-btn') || e.target.parentElement.classList.contains('play-btn')) {
        // تشغيل الصوت عند النقر على زر التشغيل
        const soundId = item.dataset.sound;
        if (typeof playAdhanSound === 'function') {
          playAdhanSound(soundId);
        }
      } else {
        // تحديد الصوت عند النقر على العنصر
        selectSound(item.dataset.sound);
        
        // حفظ إعدادات الصوت تلقائياً
        autoSaveSettings();
      }
    });
  });

  // أحداث التمرير لمستوى الصوت
  const volumeLevel = document.getElementById('volume-level');
  const adhanPlayer = document.getElementById('adhan-player');
  
  if (volumeLevel) {
    volumeLevel.addEventListener('input', () => {
      if (adhanPlayer) {
        adhanPlayer.volume = volumeLevel.value / 100;
      }
      
      // حفظ مستوى الصوت تلقائياً
      autoSaveSettings();
    });
  }
}

// تهيئة الأحداث الخاصة بمظهر التطبيق
function initAppearanceEvents() {
  const appearanceItems = document.querySelectorAll('#appearance-list .sound-item');
  
  appearanceItems.forEach(item => {
    item.addEventListener('click', () => {
      selectAppearance(item.dataset.appearance);
      applyAppearance(item.dataset.appearance);
      
      // حفظ إعدادات المظهر تلقائياً
      autoSaveSettings();
    });
  });

  // الاستماع لتغير تفضيلات النظام عند اختيار "حسب جهاز المستخدم"
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const appearanceSettings = JSON.parse(localStorage.getItem('appearanceSettings')) || {};
      if (appearanceSettings.appearance === 'auto') {
        applyAppearance('auto');
      }
    });
  }
}

// فتح قائمة المواقع من الإعدادات
document.getElementById('open-locations-list').addEventListener('click', () => {
  if (typeof locationManager !== 'undefined') {
      locationManager.openLocationModal();
      
      // إغلاق نافذة الإعدادات عند فتح نافذة المواقع
      const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settings-modal'));
      if (settingsModal) {
        settingsModal.hide();
      }
  }
});

// إزالة أزرار الحفظ والإلغاء من واجهة الإعدادات
function removeSettingsButtons() {
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    const modalFooter = settingsModal.querySelector('.modal-footer');
    if (modalFooter) {
      modalFooter.style.display = 'none';
    }
  }
}

// استدعاء دالة الترحيل وإزالة الأزرار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  migrateOldSettings();
  loadSettings();
  removeSettingsButtons();
});

// تهيئة أحداث الحفظ عند فتح النافذة
document.getElementById('settings-modal').addEventListener('shown.bs.modal', function() {
  initAutoSaveEvents();
  initSoundEvents();
  initAppearanceEvents();
});

// إغلاق النافذة تلقائياً بعد فترة من عدم النشاط
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settings-modal'));
    if (settingsModal) {
      settingsModal.hide();
    }
  }, 10000); // إغلاق بعد 10 ثواني من عدم النشاط
}

// إضافة مستمعي الأحداث لنشاط المستخدم
document.getElementById('settings-modal').addEventListener('mousemove', resetInactivityTimer);
document.getElementById('settings-modal').addEventListener('click', resetInactivityTimer);
document.getElementById('settings-modal').addEventListener('keypress', resetInactivityTimer);
