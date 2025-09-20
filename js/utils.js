// دوال مساعدة عامة
function showError(message) {
  const errorMessageElement = document.getElementById('error-message');
  if (!errorMessageElement) return;
  
  errorMessageElement.textContent = message;
  errorMessageElement.style.display = 'block';
  setTimeout(() => {
    errorMessageElement.style.display = 'none';
  }, 5000);
}

function showNotification(message) {
  const notificationEl = document.getElementById('notification');
  if (!notificationEl) return;
  
  notificationEl.querySelector('.toast-body').textContent = message;
  const toast = new bootstrap.Toast(notificationEl);
  toast.show();
}

function updateLocationStatus(message, isError = false) {
  const locationStatus = document.getElementById('location-status');
  if (!locationStatus) return;
  
  locationStatus.textContent = message;
  locationStatus.className = isError ? 'mt-2 small text-danger' : 'mt-2 small text-success';
}

function formatTime(time, format) {
  let [hours, minutes] = time.split(':').map(Number);
  if (format === '24h') return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
  const period = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12;
  if (format === '12h') return `${hours}:${minutes.toString().padStart(2,'0')} ${period}`;
  return `${hours}:${minutes.toString().padStart(2,'0')}`;
}

function applyRounding(time, method) {
  let [hours, minutes] = time.split(':').map(Number);
  if (method === 'nearest') minutes = Math.round(minutes/5)*5;
  else if (method === 'up') minutes = Math.ceil(minutes/5)*5;
  else if (method === 'down') minutes = Math.floor(minutes/5)*5;
  if (minutes === 60) { minutes = 0; hours += 1; if(hours===24) hours=0;}
  return `${hours}:${minutes.toString().padStart(2,'0')}`;
}

async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
