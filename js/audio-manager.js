// إدارة الأصوات والتشغيل التلقائي
const adhanSounds = {
  'abdul-basit': 'audio/abdul-basit.mp3',
  'mishary-rashid': 'audio/mishary-rashid.mp3',
  'saud-al-shuraim': 'audio/saud-al-shuraim.mp3',
  'yasser-al-dosari': 'audio/yasser-al-dosari.mp3'
};

// متغيرات التخزين
let currentLocation = {
  latitude: 31.9539,
  longitude: 44.3736
};

// دالة مساعدة للتحقق من وجود ملف
async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking file:', error);
    return false;
  }
}

// دالة مساعدة لعرض الإشعارات
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    const toastBody = notification.querySelector('.toast-body');
    if (toastBody) {
      toastBody.textContent = message;
    }
    const toast = new bootstrap.Toast(notification);
    toast.show();
  }
}

// دالة مساعدة لعرض الأخطاء
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
  console.error(message);
}

// دالة تشغيل صوت الأذان
async function playAdhanSound(soundId) {
  const soundUrl = adhanSounds[soundId];
  const adhanPlayer = document.getElementById('adhan-player');
  const volumeLevel = document.getElementById('volume-level') || { value: 80 };

  if (!soundUrl) {
    showError('لم يتم العثور على ملف الصوت المحدد');
    return;
  }

  // التحقق من وجود الملف أولاً
  const fileExists = await checkFileExists(soundUrl);

  if (!fileExists) {
    showError(`ملف الصوت غير موجود: ${soundUrl}. يرجى التأكد من وجود الملف في المجلد المحدد.`);
    return;
  }

  // تشغيل الصوت
  adhanPlayer.src = soundUrl;
  adhanPlayer.volume = volumeLevel.value / 100;

  try {
    // محاولة التشغيل مع التعامل مع قيود المتصفح
    const promise = adhanPlayer.play();

    if (promise !== undefined) {
      promise.then(() => {
        showNotification('جاري تشغيل الأذان');
      }).catch(error => {
        // إذا فشل التشغيل، نعرض رسالة للمستخدم
        showError('تعذر تشغيل الأذان. يرجى النقر على الصفحة أولاً ثم المحاولة مرة أخرى.');
        console.error('Error playing adhan:', error);
      });
    }
  } catch (error) {
    console.error('Error playing adhan:', error);
    showNotification('تعذر تشغيل صوت الأذان. يرجى تفعيل الصوت في المتصفح.');
  }
}

// دالة لاختبار صوت الأذان (يتم استدعاؤها من الزر الجديد)
function testAdhanSound(soundId) {
  const soundName = getMuezzinName(soundId);
  showNotification(`جاري اختبار صوت الأذان: ${soundName}`);
  playAdhanSound(soundId);
}

// دالة مساعدة للحصول على اسم المؤذن
function getMuezzinName(value) {
  const options = [
    { value: 'abdul-basit', text: 'أبا ذر الحلواجي' },
    { value: 'mishary-rashid', text: 'الشيخ شبر معله' },
    { value: 'saud-al-shuraim', text: 'الحاج مصطفى الصراف' },
    { value: 'yasser-al-dosari', text: 'محمد التوخى' }
  ];
  
  const muezzin = options.find(option => option.value === value);
  return muezzin ? muezzin.text : '';
}

// دالة للتحقق من أذونات الصوت
function checkAudioPermissions() {
  try {
    // محاولة تشغيل صوت صامت للتحقق من الصلاحيات
    const testAudio = new Audio();
    testAudio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAC';

    testAudio.play().then(() => {
      console.log('إذن الصوت مُمنوح');
      testAudio.pause();

      // حفظ حالة الإذن
      localStorage.setItem('audioPermission', 'granted');
    }).catch(error => {
      console.log('لم يتم منح إذن الصوت:', error);
      localStorage.setItem('audioPermission', 'denied');
    });
  } catch (error) {
    console.error('خطأ في التحقق من أذونات الصوت:', error);
  }
}

// دالة للحصول على أوقات الصلاة (محاكاة - يجب استبدالها بالدالة الفعلية)
function getPrayerTimes(lat, lng, date, method) {
  // هذه دالة محاكاة، يجب استبدالها بالدالة الفعلية من praytimes.js
  return {
    fajr: '5:30',
    dhuhr: '12:15',
    asr: '15:45',
    maghrib: '18:20',
    isha: '19:45'
  };
}

// دالة للتحقق من أوقات الصلاة وتشغيل الأذان
function checkPrayerTimes() {
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

  // التحقق من كل صلاة إذا حان وقتها
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  prayers.forEach(prayer => {
    if (shouldPlayAdhan(prayer, settings) && isPrayerTime(times[prayer], currentTime)) {
      playAdhanSound(settings.selectedSound || 'abdul-basit');
    }
  });
}

// دالة مساعدة للتحقق إذا حان وقت الصلاة
function isPrayerTime(prayerTime, currentTime) {
  // تحويل الوقت إلى دقائق للمقارنة
  const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
  const [currentHours, currentMinutes] = currentTime.split(':').map(Number);

  return prayerHours === currentHours && prayerMinutes === currentMinutes;
}

// دالة للتحقق إذا كان التشغيل التلقائي مفعل للصلاة
function shouldPlayAdhan(prayer, settings) {
  switch(prayer) {
    case 'fajr': return settings.playFajrAdhan !== false;
    case 'dhuhr': return settings.playDhuhrAdhan !== false;
    case 'asr': return settings.playAsrAdhan !== false;
    case 'maghrib': return settings.playMaghribAdhan !== false;
    case 'isha': return settings.playIshaAdhan !== false;
    default: return false;
  }
}

// دالة لتمكين التشغيل التلقائي بعد تفاعل المستخدم
function enableAutoPlay() {
  let userInteracted = false;
  const interactionAlert = document.getElementById('interaction-alert');

  document.addEventListener('click', function() {
    if (!userInteracted) {
      userInteracted = true;
      localStorage.setItem('userInteracted', 'true');
      checkAudioPermissions();
      if (interactionAlert) {
        interactionAlert.style.display = 'none';
      }

      // بدء مراقبة أوقات الصلاة بعد التفاعل
      setInterval(checkPrayerTimes, 60000);
      setTimeout(checkPrayerTimes, 2000);
    }
  });

  // التحقق من التفاعل السابق
  if (localStorage.getItem('userInteracted') === 'true') {
    userInteracted = true;
  }

  // إظهار تنبيه إذا لم يتفاعل المستخدم بعد
  setTimeout(() => {
    if (!userInteracted && interactionAlert) {
      interactionAlert.style.display = 'block';
    }
  }, 3000);

  return userInteracted;
}

// تهيئة التشغيل التلقائي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  enableAutoPlay();
  
  // تهيئة مستوى الصوت
  const volumeLevel = document.getElementById('volume-level');
  if (volumeLevel) {
    volumeLevel.value = localStorage.getItem('volumeLevel') || 80;
    volumeLevel.addEventListener('change', function() {
      localStorage.setItem('volumeLevel', this.value);
    });
  }
});

// جعل الدوال متاحة عالمياً للاستدعاء من الملفات الأخرى
window.playAdhanSound = playAdhanSound;
window.testAdhanSound = testAdhanSound;
window.getMuezzinName = getMuezzinName;
