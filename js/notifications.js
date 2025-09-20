// إدارة الإشعارات والتنبيهات
let lastNotifiedPrayer = null;
let notificationCheckInterval;

// دالة لعرض إشعار الصلاة
function showPrayerNotification(prayerName, prayerTime) {
  const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  
  // التحقق مما إذا كان الإشعار مفعل لهذه الصلاة
  let notificationEnabled = true;
  switch(prayerName) {
    case 'fajr': notificationEnabled = settings.fajrNotification !== false; break;
    case 'dhuhr': notificationEnabled = settings.dhuhrNotification !== false; break;
    case 'asr': notificationEnabled = settings.asrNotification !== false; break;
    case 'maghrib': notificationEnabled = settings.maghribNotification !== false; break;
    case 'isha': notificationEnabled = settings.ishaNotification !== false; break;
  }
  
  if (!notificationEnabled) return;
  
  const prayerNotificationTitle = document.getElementById('prayer-notification-title');
  const prayerNotificationBody = document.getElementById('prayer-notification-body');
  const prayerNotification = document.getElementById('prayer-notification');
  
  prayerNotificationTitle.textContent = 'حان وقت الصلاة';
  prayerNotificationBody.textContent = `حان وقت صلاة ${prayerNames[prayerName]} (${prayerTime})`;
  
  // تغيير لون الإشعار حسب نوع الصلاة
  const prayerColors = {
    fajr: '#0d6efd',
    dhuhr: '#198754',
    asr: '#6f42c1',
    maghrib: '#fd7e14',
    isha: '#6c757d'
  };
  
  prayerNotification.style.backgroundColor = prayerColors[prayerName] || '#0d6efd';
  prayerNotification.querySelector('.toast-header').style.backgroundColor = prayerColors[prayerName] || '#0d6efd';
  
  const prayerToast = new bootstrap.Toast(prayerNotification);
  prayerToast.show();
  
  // تحديث آخر صلاة تم إشعارها
  lastNotifiedPrayer = prayerName;
}

// دورة فحص دخول أوقات الصلاة
function startNotificationChecker() {
  // إيقاف الدورة السابقة إذا كانت تعمل
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
  
  // بدء دورة فحص جديدة كل دقيقة
  notificationCheckInterval = setInterval(() => {
    const now = new Date();
    const currentTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
    
    // الحصول على أوقات الصلاة الحالية
    const times = getPrayerTimes(
      currentLocation.latitude || 31.9539, 
      currentLocation.longitude || 44.3736, 
      now,
      settings.calculationMethod || 'MWL'
    );
    
    // التحقق من كل صلاة إذا حان وقتها ولم يتم الإشعار بها مسبقاً
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    prayers.forEach(prayer => {
      if (isPrayerTime(times[prayer], currentTime) && lastNotifiedPrayer !== prayer) {
        showPrayerNotification(prayer, times[prayer]);
      }
    });
  }, 60000); // التحقق كل دقيقة
}