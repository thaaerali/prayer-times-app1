// التطبيق الرئيسي وتنسيق الأحداث
function getCurrentLocation() {
  const cityNameElement = document.getElementById('city-name');
  const prayerTimesElement = document.getElementById('prayer-times');
  const locationButton = document.getElementById('location-button');
  
  cityNameElement.textContent = "جاري تحديد موقعك...";
  prayerTimesElement.innerHTML = "<div class='text-center py-4'>جاري تحديد موقعك...</div>";
  locationButton.disabled = true;
  locationButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري التحديد...';
  updateLocationStatus('جاري الوصول إلى موقعك...');

  if (!navigator.geolocation) {
    updateLocationStatus('المتصفح لا يدعم خدمة تحديد الموقع', true);
    locationButton.disabled = false;
    locationButton.innerHTML = '<i class="bi bi-geo-alt-fill"></i> تحديد موقعي تلقائياً';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    // نجاح الحصول على الموقع
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      currentLocation.latitude = lat;
      currentLocation.longitude = lng;

      try {
        // الحصول على اسم المدينة من الإحداثيات
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`);
        const data = await response.json();

        currentLocation.city = data.city || data.locality || "موقع غير معروف";
        cityNameElement.textContent = currentLocation.city;
        const coordinatesElement = document.getElementById('coordinates');
        coordinatesElement.textContent = `خط العرض: ${lat.toFixed(4)}°, خط الطول: ${lng.toFixed(4)}°`;

        updateLocationStatus('تم تحديد موقعك بنجاح');

        // حفظ الإعدادات مع الموقع الجديد
        const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
        settings.latitude = lat;
        settings.longitude = lng;
        settings.cityName = currentLocation.city;
        localStorage.setItem('prayerSettings', JSON.stringify(settings));

        calculateAndDisplayPrayerTimes();
      } catch (error) {
        console.error('Error getting location name:', error);
        cityNameElement.textContent = `موقعك (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
        const coordinatesElement = document.getElementById('coordinates');
        coordinatesElement.textContent = `خط العرض: ${lat.toFixed(4)}°, خط الطول: ${lng.toFixed(4)}°`;
        updateLocationStatus('تم تحديد الموقع ولكن تعذر الحصول على اسم المدينة', true);
        calculateAndDisplayPrayerTimes();
      }

      locationButton.disabled = false;
      locationButton.innerHTML = '<i class="bi bi-geo-alt-fill"></i> تحديد موقعي تلقائياً';
    },
    // فشل الحصول على الموقع
    (error) => {
      console.error('Error getting location:', error);
      let errorMessage = 'تعذر تحديد موقعك';

      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'تم رفض الإذن للوصول إلى الموقع';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'معلومات الموقع غير متاحة';
          break;
        case error.TIMEOUT:
          errorMessage = 'انتهت مهلة طلب الموقع';
          break;
      }

      updateLocationStatus(errorMessage, true);
      locationButton.disabled = false;
      locationButton.innerHTML = '<i class="bi bi-geo-alt-fill"></i> تحديد موقعي تلقائياً';

      // استخدام موقع افتراضي في حالة الفشل
      if (!currentLocation.latitude || !currentLocation.longitude) {
        currentLocation.latitude = 31.9539;
        currentLocation.longitude = 44.3736;
        currentLocation.city = "النجف";
        const cityNameElement = document.getElementById('city-name');
        cityNameElement.textContent = currentLocation.city;
        const coordinatesElement = document.getElementById('coordinates');
        coordinatesElement.textContent = `خط العرض: ${currentLocation.latitude.toFixed(4)}°, خط الطول: ${currentLocation.longitude.toFixed(4)}°`;
        calculateAndDisplayPrayerTimes();
      }
    },
    // خيارات إضافية
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

function saveManualLocation() {
  const manualLocation = document.getElementById('manual-location');
  const cityNameElement = document.getElementById('city-name');
  const coordinatesElement = document.getElementById('coordinates');
  
  const city = manualLocation.value.trim();
  if (city) {
    currentLocation.city = city;
    // استخدام موقع افتراضي للمدينة (يمكن تحسينه باستخدام خدمة geocoding)
    currentLocation.latitude = 31.9539;
    currentLocation.longitude = 44.3736;

    cityNameElement.textContent = city;
    coordinatesElement.textContent = `خط العرض: ${currentLocation.latitude.toFixed(4)}°, خط الطول: ${currentLocation.longitude.toFixed(4)}°`;

    // حفظ الإعدادات
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    settings.city = city;
    settings.latitude = currentLocation.latitude;
    settings.longitude = currentLocation.longitude;
    settings.cityName = city;
    localStorage.setItem('prayerSettings', JSON.stringify(settings));

    showNotification('تم حفظ الموقع اليدوي بنجاح');
    calculateAndDisplayPrayerTimes();
  } else {
    showError('يرجى إدخال اسم المدينة');
  }
}
// تأكد من تضمين ملف location-manager.js في HTML قبل app.js

// دالة مساعدة للاستخدام في location-manager
function updatePrayerTimes(lat, lng) {
    // هذه الدالة يجب أن تكون موجودة في مشروعك
    console.log('Updating prayer times for:', lat, lng);
    
    // استدعاء دالة حساب أوقات الصلاة
    if (typeof calculatePrayerTimes === 'function') {
        calculatePrayerTimes(lat, lng);
    }
    
    // تحديث واجهة المستخدم
    updatePrayerTimesDisplay();
}

// دالة مساعدة لعرض الإشعارات
function showNotification(message, type = 'success') {
    // استخدام نظام الإشعارات الموجود في التطبيق
    const notification = document.getElementById('notification');
    if (notification) {
        notification.querySelector('.toast-body').textContent = message;
        const toast = new bootstrap.Toast(notification);
        toast.show();
    }
}
// تهيئة التطبيق
function initApp() {
  // التحقق من تحميل المكتبة أولاً
  if (typeof PrayTimes === 'undefined') {
    document.getElementById('error-message').textContent = 'خطأ: لم يتم تحميل مكتبة PrayTimes بشكل صحيح. تأكد من وجود ملف praytimes.js في مجلد المشروع.';
    document.getElementById('error-message').style.display = 'block';
  }

  // تحميل الإعدادات المحفوظة
  loadSettings();

  // عرض التاريخ الحالي
  displayDate();

  // تهيئة أحداث الأصوات
  initSoundEvents();

  // تهيئة أحداث المظهر
  initAppearanceEvents();

  // محاولة الحصول على الموقع الحالي
  getCurrentLocation();

  // تحديث التاريخ كل دقيقة
  setInterval(displayDate, 60000);

  // تحديث أوقات الصلاة كل ساعة
  setInterval(calculateAndDisplayPrayerTimes, 3600000);

  // تمكين التشغيل التلقائي والتحقق من الأذونات
  enableAutoPlay();
  
  // بدء مراقبة الإشعارات
  startNotificationChecker();
}

// أحداث النقر على الأزرار
document.addEventListener('DOMContentLoaded', function() {
  const settingsButton = document.getElementById('settings-button');
  const locationButton = document.getElementById('location-button');
  const saveManualLocationBtn = document.getElementById('save-manual-location');
  const saveSettingsButton = document.getElementById('save-settings');
  const settingsModal = new bootstrap.Modal(document.getElementById('settings-modal'));

  settingsButton.addEventListener('click', () => {
    settingsModal.show();
  });

  locationButton.addEventListener('click', getCurrentLocation);

  saveManualLocationBtn.addEventListener('click', saveManualLocation);

  saveSettingsButton.addEventListener('click', () => {
    saveSettings();
    settingsModal.hide();
  });

  // تهيئة التطبيق عند تحميل الصفحة
  initApp();

});
