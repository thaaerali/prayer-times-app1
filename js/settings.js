// إدارة الإعدادات والتخزين المحلي
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
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

  if (settings.calculationMethod) calculationMethodSelect.value = settings.calculationMethod;
  if (settings.timeFormat) timeFormatSelect.value = settings.timeFormat;
  if (settings.roundingMethod) roundingMethodSelect.value = settings.roundingMethod;
  if (settings.city) manualLocation.value = settings.city;
  if (settings.latitude) currentLocation.latitude = settings.latitude;
  if (settings.longitude) currentLocation.longitude = settings.longitude;
  if (settings.cityName) currentLocation.city = settings.cityName;

  toggleAsr.checked = settings.showAsr !== undefined ? settings.showAsr : true;
  toggleIsha.checked = settings.showIsha !== undefined ? settings.showIsha : true;

  // تحميل إعدادات الصوت مع القيم الافتراضية
  if (settings.selectedSound) {
    selectSound(settings.selectedSound);
  } else {
    selectSound('abdul-basit'); // قيمة افتراضية
  }

  // تعيين القيم الافتراضية للتشغيل التلقائي إذا لم تكن محددة
  toggleFajrAdhan.checked = settings.playFajrAdhan !== undefined ? settings.playFajrAdhan : true;
  toggleDhuhrAdhan.checked = settings.playDhuhrAdhan !== undefined ? settings.playDhuhrAdhan : true;
  toggleAsrAdhan.checked = settings.playAsrAdhan !== undefined ? settings.playAsrAdhan : true;
  toggleMaghribAdhan.checked = settings.playMaghribAdhan !== undefined ? settings.playMaghribAdhan : true;
  toggleIshaAdhan.checked = settings.playIshaAdhan !== undefined ? settings.playIshaAdhan : true;

  if (settings.volumeLevel !== undefined) volumeLevel.value = settings.volumeLevel;
  else volumeLevel.value = 80; // قيمة حجم افتراضية

  // تحميل إعدادات المظهر
  if (settings.appearance) {
    selectAppearance(settings.appearance);
    applyAppearance(settings.appearance);
  } else {
    selectAppearance('auto');
    applyAppearance('auto');
  }

  // تحميل إعدادات الإشعارات مع القيم الافتراضية
  toggleFajrNotification.checked = settings.fajrNotification !== undefined ? settings.fajrNotification : true;
  toggleDhuhrNotification.checked = settings.dhuhrNotification !== undefined ? settings.dhuhrNotification : true;
  toggleAsrNotification.checked = settings.asrNotification !== undefined ? settings.asrNotification : true;
  toggleMaghribNotification.checked = settings.maghribNotification !== undefined ? settings.maghribNotification : true;
  toggleIshaNotification.checked = settings.ishaNotification !== undefined ? settings.ishaNotification : true;

  return settings;
}

function saveSettings() {
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

  const settings = {
    calculationMethod: calculationMethodSelect.value,
    timeFormat: timeFormatSelect.value,
    roundingMethod: roundingMethodSelect.value,
    city: manualLocation.value,
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    cityName: currentLocation.city,
    showAsr: toggleAsr.checked,
    showIsha: toggleIsha.checked,
    // إعدادات الصوت
    selectedSound: selectedSound,
    playFajrAdhan: toggleFajrAdhan.checked,
    playDhuhrAdhan: toggleDhuhrAdhan.checked,
    playAsrAdhan: toggleAsrAdhan.checked,
    playMaghribAdhan: toggleMaghribAdhan.checked,
    playIshaAdhan: toggleIshaAdhan.checked,
    volumeLevel: volumeLevel.value,
    // إعدادات المظهر
    appearance: selectedAppearance,
    // إعدادات الإشعارات الجديدة
    fajrNotification: toggleFajrNotification.checked,
    dhuhrNotification: toggleDhuhrNotification.checked,
    asrNotification: toggleAsrNotification.checked,
    maghribNotification: toggleMaghribNotification.checked,
    ishaNotification: toggleIshaNotification.checked
  };
  // فتح قائمة المواقع من الإعدادات
document.getElementById('open-locations-list').addEventListener('click', () => {
    if (typeof locationManager !== 'undefined') {
        locationManager.openLocationModal();
        
        // إغلاق نافذة الإعدادات عند فتح نافذة المواقع
        const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settings-modal'));
        settingsModal.hide();
    }
});
  localStorage.setItem('prayerSettings', JSON.stringify(settings));
  showNotification('تم حفظ الإعدادات بنجاح');
  calculateAndDisplayPrayerTimes();

  // تطبيق المظهر بعد الحفظ
  applyAppearance(selectedAppearance);

  // إعادة تشغيل مراقبة الإشعارات بعد حفظ الإعدادات
  startNotificationChecker();
}

function selectSound(soundId) {
  const soundItems = document.querySelectorAll('.sound-item');
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
  const soundItems = document.querySelectorAll('.sound-item');
  
  // حدث النقر على عنصر صوت
  soundItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('play-btn') || e.target.parentElement.classList.contains('play-btn')) {
        // تشغيل الصوت عند النقر على زر التشغيل
        const soundId = item.dataset.sound;
        playAdhanSound(soundId);
      } else {
        // تحديد الصوت عند النقر على العنصر
        selectSound(item.dataset.sound);
      }
    });
  });

  // أحداث التمرير لمستوى الصوت
  const volumeLevel = document.getElementById('volume-level');
  const adhanPlayer = document.getElementById('adhan-player');
  
  volumeLevel.addEventListener('input', () => {
    adhanPlayer.volume = volumeLevel.value / 100;
  });
}

// تهيئة الأحداث الخاصة بمظهر التطبيق
function initAppearanceEvents() {
  const appearanceItems = document.querySelectorAll('#appearance-list .sound-item');
  
  appearanceItems.forEach(item => {
    item.addEventListener('click', () => {
      selectAppearance(item.dataset.appearance);
    });
  });

  // الاستماع لتغير تفضيلات النظام عند اختيار "حسب جهاز المستخدم"
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
      if (settings.appearance === 'auto') {
        applyAppearance('auto');
      }
    });
  }

}

