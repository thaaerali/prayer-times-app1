class LocationManager {
    constructor() {
        this.locations = this.loadLocations();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderLocations();
    }

    bindEvents() {
        // فتح نافذة المواقع
        document.getElementById('location-list-button').addEventListener('click', () => {
            this.openLocationModal();
        });

        // حفظ الموقع الحالي
        document.getElementById('save-current-location').addEventListener('click', () => {
            this.saveCurrentLocation();
        });

        // السماح بالحفظ بالضغط على Enter
        document.getElementById('new-location-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveCurrentLocation();
            }
        });
    }

    loadLocations() {
        const saved = localStorage.getItem('prayerLocations');
        return saved ? JSON.parse(saved) : [];
    }

    saveLocations() {
        localStorage.setItem('prayerLocations', JSON.stringify(this.locations));
    }

    openLocationModal() {
        this.renderLocations();
        const modal = new bootstrap.Modal(document.getElementById('location-list-modal'));
        modal.show();
    }

    async saveCurrentLocation() {
        const locationName = document.getElementById('new-location-name').value.trim();
        
        if (!locationName) {
            this.showAlert('يرجى إدخال اسم الموقع', 'error');
            return;
        }

        // التحقق من عدم التكرار
        if (this.locations.some(loc => loc.name.toLowerCase() === locationName.toLowerCase())) {
            this.showAlert('هذا الاسم موجود مسبقاً', 'error');
            return;
        }

        try {
            const position = await this.getCurrentPosition();
            
            this.locations.push({
                name: locationName,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: new Date().toISOString()
            });

            this.saveLocations();
            this.renderLocations();
            document.getElementById('new-location-name').value = '';
            this.showAlert('تم حفظ الموقع بنجاح!', 'success');

        } catch (error) {
            this.showAlert('تعذر الحصول على الموقع الحالي: ' + error.message, 'error');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation غير مدعوم'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }

    renderLocations() {
        const container = document.getElementById('locations-list');
        const noLocationsMessage = document.getElementById('no-locations-message');
        
        container.innerHTML = '';
        
        if (this.locations.length === 0) {
            noLocationsMessage.style.display = 'block';
            return;
        }

        noLocationsMessage.style.display = 'none';

        this.locations.forEach((location, index) => {
            const locationElement = document.createElement('div');
            locationElement.className = 'list-group-item location-item';
            locationElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="location-name">${location.name}</div>
                        <div class="location-coords">
                            ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
                        </div>
                    </div>
                    <div class="location-actions">
                        <button class="btn btn-sm btn-primary btn-location select-location" 
                                data-index="${index}">
                            اختيار
                        </button>
                        <button class="btn btn-sm btn-danger btn-location delete-location" 
                                data-index="${index}">
                            حذف
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(locationElement);
        });

        // إضافة event listeners للأزرار
        container.querySelectorAll('.select-location').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                this.selectLocation(this.locations[index]);
            });
        });

        container.querySelectorAll('.delete-location').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                this.deleteLocation(index);
            });
        });
    }

    selectLocation(location) {
        // إغلاق النافذة
        const modal = bootstrap.Modal.getInstance(document.getElementById('location-list-modal'));
        modal.hide();

        // تحديث أوقات الصلاة للموقع المحدد
        if (typeof updatePrayerTimes === 'function') {
            updatePrayerTimes(location.lat, location.lng);
            
            // تحديث اسم المدينة في الواجهة
            document.getElementById('city-name').textContent = location.name;
            document.getElementById('coordinates').textContent = 
                `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        }

        this.showAlert(`تم التبديل إلى ${location.name}`, 'success');
    }

    deleteLocation(index) {
        if (confirm(`هل تريد حذف "${this.locations[index].name}"؟`)) {
            this.locations.splice(index, 1);
            this.saveLocations();
            this.renderLocations();
            this.showAlert('تم حذف الموقع', 'success');
        }
    }

    showAlert(message, type) {
        // استخدام نظام الإشعارات الموجود في التطبيق
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // للحصول على الموقع الافتراضي أو الأخير
    getDefaultLocation() {
        if (this.locations.length > 0) {
            return this.locations[this.locations.length - 1]; // آخر موقع محفوظ
        }
        return null;
    }
}

// تهيئة مدير المواقع
let locationManager;

document.addEventListener('DOMContentLoaded', function() {
    locationManager = new LocationManager();
    
    // محاولة استخدام موقع محفوظ عند التحميل
    const defaultLocation = locationManager.getDefaultLocation();
    if (defaultLocation && typeof updatePrayerTimes === 'function') {
        updatePrayerTimes(defaultLocation.lat, defaultLocation.lng);
        document.getElementById('city-name').textContent = defaultLocation.name;
        document.getElementById('coordinates').textContent = 
            `${defaultLocation.lat.toFixed(4)}, ${defaultLocation.lng.toFixed(4)}`;
    }
});