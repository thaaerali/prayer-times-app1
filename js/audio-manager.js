// إدارة الأصوات والتشغيل التلقائي
const adhanSounds = {
  'abdul-basit': 'audio/abdul-basit.mp3',
  'mishary-rashid': 'audio/mishary-rashid.mp3',
  'saud-al-shuraim': 'audio/saud-al-shuraim.mp3',
  'yasser-al-dosari': 'audio/yasser-al-dosari.mp3'
};

async function playAdhanSound(soundId) {
  const soundUrl = adhanSounds[soundId];
  const adhanPlayer = document.getElementById('adhan-player');
  const volumeLevel = document.getElementById('volume-level');

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
      interactionAlert.style.display = 'none';

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
    if (!userInteracted) {
      interactionAlert.style.display = 'block';
    }
  }, 3000);

  return userInteracted;
}