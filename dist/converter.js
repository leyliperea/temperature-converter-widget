const inputField = document.getElementById('input-temp');
const fromUnitField = document.getElementById('input-unit');
const toUnitField = document.getElementById('output-unit');
const outputField = document.getElementById('output-temp');
const form = document.getElementById('converter');
const widgetValue = document.getElementById('widget-value');
const widgetFeeling = document.getElementById('widget-feeling');
const thermometerLevel = document.getElementById('thermometer-level');
const thermometerBulb = document.getElementById('thermometer-bulb');
const shareResultBtn = document.getElementById('share-result');
const miniWidget = document.getElementById('mini-widget');
const miniWidgetValue = document.getElementById('mini-widget-value');
const miniWidgetDetail = document.getElementById('mini-widget-detail');
const miniWidgetClose = document.getElementById('mini-widget-close');
const widgetToggleBtn = document.getElementById('ctl-widget');

const unitSymbols = { c: '°C', f: '°F', k: 'K' };

function createShareThumbnail(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, '#2f3d58');
  background.addColorStop(1, '#172033');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#9fb8e7';
  ctx.font = '700 30px system-ui, sans-serif';
  ctx.fillText('CONVERSOR DE TEMPERATURA', 90, 105);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 72px system-ui, sans-serif';
  ctx.fillText(text, 90, 300);

  ctx.fillStyle = '#d8e1f2';
  ctx.font = '32px system-ui, sans-serif';
  ctx.fillText(widgetFeeling.textContent, 90, 370);

  const celsius = convertTemp(parseFloat(inputField.value), fromUnitField.value, 'c');
  const color = celsius < 10 ? '#54a0ff' : celsius < 30 ? '#ff9f43' : '#ee5253';
  const level = Math.max(30, Math.min(330, ((celsius + 30) / 80) * 300 + 30));

  ctx.lineWidth = 18;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(985, 115, 60, 330, 30);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(1002, 428 - level, 26, level);
  ctx.beginPath();
  ctx.arc(1015, 465, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText('Compartido desde Temperature converter', 90, 555);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

function shareViaWhatsApp(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(`Mi conversión: ${text}`)}`;
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (popup) {
    showToast('Abriendo WhatsApp');
    return true;
  }
  return false;
}

async function copyShareText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    return copied;
  }
}

function convertTemp(value, fromUnit, toUnit) {
  if (fromUnit === 'c') {
    if (toUnit === 'f') {
      return value * 9 / 5 + 32;
    } else if (toUnit === 'k') {
      return value + 273.15;
    }
    return value;
  }
  if (fromUnit === 'f') {
    if (toUnit === 'c') {
      return (value - 32) * 5 / 9;
    } else if (toUnit === 'k') {
      return (value + 459.67) * 5 / 9;
    }
    return value;
  }
  if (fromUnit === 'k') {
    if (toUnit === 'c') {
      return value - 273.15;
    } else if (toUnit === 'f') {
      return value * 9 / 5 - 459.67;
    }
    return value;
  }
  throw new Error('Invalid unit');
}

function updateConversion() {
  const inputTemp = parseFloat(inputField.value);
  const fromUnit = fromUnitField.value;
  const toUnit = toUnitField.value;

  if (!Number.isFinite(inputTemp)) {
    outputField.value = '—';
    widgetValue.textContent = '—';
    widgetFeeling.textContent = 'Introduce una temperatura';
    thermometerLevel.style.height = '0%';
    miniWidgetValue.textContent = '—';
    miniWidgetDetail.textContent = 'Introduce una temperatura';
    return;
  }

  const outputTemp = convertTemp(inputTemp, fromUnit, toUnit);
  const roundedTemp = Math.round(outputTemp * 100) / 100;
  const celsius = convertTemp(outputTemp, toUnit, 'c');
  const level = Math.max(5, Math.min(100, ((celsius + 30) / 80) * 100));
  const color = celsius < 10 ? '#54a0ff' : celsius < 30 ? '#ff9f43' : '#ee5253';
  const feeling = celsius < 10 ? 'Temperatura fría' : celsius < 30 ? 'Temperatura templada' : 'Temperatura caliente';

  outputField.value = `${roundedTemp} ${unitSymbols[toUnit]}`;
  widgetValue.textContent = `${roundedTemp} ${unitSymbols[toUnit]}`;
  widgetFeeling.textContent = feeling;
  thermometerLevel.style.height = `${level}%`;
  thermometerLevel.style.background = color;
  thermometerBulb.style.background = color;
  miniWidgetValue.textContent = `${roundedTemp} ${unitSymbols[toUnit]}`;
  miniWidgetDetail.textContent = `${inputTemp} ${unitSymbols[fromUnit]} · ${feeling.replace('Temperatura ', '')}`;

  navigator.serviceWorker?.controller?.postMessage({
    type: 'widget-data',
    data: {
      input: `${inputTemp} ${unitSymbols[fromUnit]}`,
      output: `${roundedTemp} ${unitSymbols[toUnit]}`,
      status: feeling.replace('Temperatura ', '')
    }
  });
}

form.addEventListener('input', updateConversion);
updateConversion();

/* --- Window Controls Overlay --- */
const statusBtn = document.getElementById('ctl-status');
const geometryBadge = document.getElementById('ctl-geometry-badge');
const themeBtn = document.getElementById('ctl-theme');
const swapBtn = document.getElementById('ctl-swap');
const moreBtn = document.getElementById('ctl-more');
const moreMenu = document.getElementById('more-menu');
const infoPanel = document.getElementById('info-panel');
const infoClose = document.getElementById('info-close');
const fullscreenBtn = document.getElementById('ctl-fullscreen');
const copyBtn = document.getElementById('ctl-copy');
const toast = document.getElementById('toast');

let toastTimeout;
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.hidden = true; }, 200);
  }, 1800);
}

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function updateWcoState(titleBarRect) {
  const hasApi = 'windowControlsOverlay' in navigator;
  const isOverlayVisible = hasApi ? navigator.windowControlsOverlay.visible : false;
  document.body.classList.toggle('wco-visible', isOverlayVisible);
  statusBtn.classList.toggle('wco-on', isOverlayVisible);
  statusBtn.classList.toggle('wco-off', !isOverlayVisible);
  statusBtn.title = `Superposición: ${isOverlayVisible ? 'visible' : 'oculta'}`;

  const rect = titleBarRect || (hasApi ? navigator.windowControlsOverlay.getTitlebarAreaRect() : null);
  if (rect) {
    geometryBadge.textContent = `${Math.round(rect.width)}×${Math.round(rect.height)}`;
  }
}

if ('windowControlsOverlay' in navigator) {
  updateWcoState();
  navigator.windowControlsOverlay.addEventListener('geometrychange', debounce(e => {
    updateWcoState(e.titlebarAreaRect);
  }, 200));
} else {
  updateWcoState();
}

/* Control 1: estado de la superposición (punto verde/ámbar, se actualiza en vivo) */
statusBtn.addEventListener('click', () => {
  const hasApi = 'windowControlsOverlay' in navigator;
  const visible = hasApi && navigator.windowControlsOverlay.visible;
  showInfo(`Window Controls Overlay: ${visible ? 'VISIBLE' : 'OCULTA'}${hasApi ? '' : ' (API no disponible en este navegador)'}`);
});

/* Control 2: geometría — badge en vivo junto al título, se actualiza con geometrychange */

/* Control 3: cambiar tema claro/oscuro (persistente) */
function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark-theme');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark-theme');
}

themeBtn.addEventListener('click', toggleTheme);

/* Mini widget: se puede ocultar y volver a mostrar desde la barra superior. */
function setMiniWidgetVisible(visible) {
  miniWidget.hidden = !visible;
  widgetToggleBtn.setAttribute('aria-pressed', String(visible));
  localStorage.setItem('mini-widget-visible', String(visible));
}

setMiniWidgetVisible(localStorage.getItem('mini-widget-visible') !== 'false');
widgetToggleBtn.addEventListener('click', () => setMiniWidgetVisible(miniWidget.hidden));
miniWidgetClose.addEventListener('click', () => setMiniWidgetVisible(false));

/* Control 4: intercambiar unidades de conversión */
function swapUnits() {
  const from = fromUnitField.value;
  fromUnitField.value = toUnitField.value;
  toUnitField.value = from;
  form.dispatchEvent(new Event('input'));
}

swapBtn.addEventListener('click', swapUnits);

/* Control 5: menú "Configuración y más" + panel Acerca de */
function showInfo(extra) {
  if (extra) {
    infoPanel.querySelector('p').textContent = extra;
  } else {
    infoPanel.querySelector('p').textContent = 'Temperature converter PWA';
  }
  infoPanel.hidden = !infoPanel.hidden;
}

function closeMenu() {
  moreMenu.hidden = true;
}

moreBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  moreMenu.hidden = !moreMenu.hidden;
});

moreMenu.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('click', closeMenu);

document.getElementById('mi-theme').addEventListener('click', () => { toggleTheme(); closeMenu(); });
document.getElementById('mi-swap').addEventListener('click', () => { swapUnits(); closeMenu(); });
document.getElementById('mi-info').addEventListener('click', () => { showInfo(); closeMenu(); });
infoClose.addEventListener('click', () => { infoPanel.hidden = true; });

/* Control 6: pantalla completa */
fullscreenBtn.addEventListener('click', async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await document.documentElement.requestFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  fullscreenBtn.style.color = document.fullscreenElement ? '#4caf50' : '';
  showToast(document.fullscreenElement ? 'Pantalla completa activada' : 'Pantalla completa desactivada');
});

/* Control 7: copiar resultado al portapapeles */
copyBtn.addEventListener('click', async () => {
  const text = `${inputField.value} ${fromUnitField.value.toUpperCase()} = ${outputField.value}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast(`Copiado: ${text}`);
  } catch {
    showToast('No se pudo copiar');
  }
});

/* Compartir mediante el panel nativo de Windows (WhatsApp, Outlook, Teams, etc.) */
shareResultBtn.addEventListener('click', async () => {
  if (!Number.isFinite(parseFloat(inputField.value))) {
    showToast('Introduce una temperatura válida');
    return;
  }

  const text = `${inputField.value} ${unitSymbols[fromUnitField.value]} = ${outputField.value}`;

  const shareData = {
    title: 'Conversión de temperatura',
    text: `Mi conversión: ${text}`
  };

  if (navigator.share && window.isSecureContext) {
    try {
      try {
        const thumbnailBlob = await createShareThumbnail(text);
        const thumbnail = thumbnailBlob
          ? new File([thumbnailBlob], 'conversion-temperatura.png', { type: 'image/png' })
          : null;

        if (thumbnail && navigator.canShare?.({ files: [thumbnail] })) {
          shareData.files = [thumbnail];
        }
      } catch {
        // La miniatura es opcional: el texto aún se puede compartir.
      }

      await navigator.share(shareData);
      showToast('Resultado compartido');
      return;
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      // Algunos destinos rechazan archivos, pero aceptan texto.
      if (shareData.files) {
        try {
          delete shareData.files;
          await navigator.share(shareData);
          showToast('Resultado compartido');
          return;
        } catch (textError) {
          if (textError.name === 'AbortError') {
            return;
          }
        }
      }
    }
  }

  // Respaldo para HTTP, archivos locales y navegadores sin Web Share API.
  if (!shareViaWhatsApp(text)) {
    const copied = await copyShareText(text);
    showToast(copied ? 'Resultado copiado para compartir' : 'No se pudo compartir');
  }
});
