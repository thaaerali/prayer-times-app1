// إدارة حسابات أوقات الصلاة
const prayerNames = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  sunset: 'الغروب',
  maghrib: 'المغرب',
  isha: 'العشاء'
};

// ترتيب الصلوات حسب الوقت
const prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'sunset', 'maghrib', 'isha'];

let currentLocation = {
  latitude: null,
  longitude: null,
  city: null
};

// دالة مساعدة لإرجاع أوقات الصلاة الافتراضية
function getDefaultPrayerTimes() {
    return {
        fajr: '5:00',
        sunrise: '6:00',
        dhuhr: '12:00',
        asr: '15:00',
        sunset: '18:00',
        maghrib: '18:05',
        isha: '19:00'
    };
}

// دالة حساب أوقات الصلاة المعدلة
function getPrayerTimes(lat, lng, date, method) {
    if (typeof PrayTimes === 'undefined') {
        showError('مكتبة الحساب غير متوفرة');
        return getDefaultPrayerTimes();
    }

    try {
        const prayTimes = new PrayTimes();

        // إذا كانت الطريقة Hadi، استخدم إعدادات مخصصة
        if (method === 'Hadi') {
            prayTimes.setMethod('MWL');
            prayTimes.adjust({
                fajr: 18,
                maghrib: 4,  // 4 درجات للمغرب
                isha: 18
            });
        } else {
            prayTimes.setMethod(method || 'MWL');
        }

        const coordinates = [lat, lng, 0];
        const times = prayTimes.getTimes(date, coordinates);

        // تأكد من أن المغرب بعد الغروب
        if (times.maghrib === times.sunset) {
            const [hours, minutes] = times.sunset.split(':').map(Number);
            let newMinutes = minutes + 1;
            let newHours = hours;

            if (newMinutes >= 60) {
                newMinutes = 0;
                newHours += 1;
                if (newHours >= 24) newHours = 0;
            }

            times.maghrib = `${newHours}:${newMinutes.toString().padStart(2, '0')}`;
        }

        return {
            fajr: times.fajr,
            sunrise: times.sunrise,
            dhuhr: times.dhuhr,
            asr: times.asr,
            sunset: times.sunset,
            maghrib: times.maghrib,
            isha: times.isha
        };
    } catch (error) {
        console.error('Error calculating prayer times:', error);
        return getDefaultPrayerTimes();
    }
}

function calculateAndDisplayPrayerTimes() {
  const settings = JSON.parse(localStorage.getItem('prayerSettings')) || {};
  const method = settings.calculationMethod || 'MWL';
  const timeFormat = settings.timeFormat || '24h';
  const roundingMethod = settings.roundingMethod || 'nearest';

  // إذا لم يكن هناك موقع محدد، نستخدم موقع افتراضي
  let lat = currentLocation.latitude || 31.9539; // النجف كموقع افتراضي
  let lng = currentLocation.longitude || 44.3736;

  // الحصول على أوقات الصلاة باستخدام الموقع الحالي
  const today = new Date();
  const times = getPrayerTimes(lat, lng, today, method);

  // تحديد الصلوات التي سيتم عرضها
  const prayersToShow = ['fajr', 'sunrise', 'dhuhr'];

  // إضافة العصر إذا كان مفعلاً
  if (settings.showAsr) {
    prayersToShow.push('asr');
  }

  prayersToShow.push('sunset', 'maghrib');

  // إضافة العشاء إذا كان مفعلاً
  if (settings.showIsha) {
    prayersToShow.push('isha');
  }

  const prayerTimesElement = document.getElementById('prayer-times');
  let html = '';
  for (const key of prayersToShow) {
    let rounded = applyRounding(times[key], roundingMethod);
    let formatted = formatTime(rounded, timeFormat);

    html += `
      <div class="card mb-3 shadow-sm prayer-card">
        <div class="card-body d-flex justify-content-between align-items-center">
          <h5 class="card-title text-primary mb-0">${prayerNames[key]}</h5>
          <span class="fs-5 fw-bold">${formatted}</span>
        </div>
      </div>
    `;
  }
  prayerTimesElement.innerHTML = html;
}

function displayDate() {
  const now = new Date();
  const gregorian = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const islamic = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  const dateDisplay = document.getElementById('date-display');
  dateDisplay.textContent = `${gregorian} / ${islamic}`;
}
