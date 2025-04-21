// settings.js

// Load & save sound setting
const soundSel = document.getElementById('soundSetting');
soundSel.value = localStorage.getItem('sound') || 'on';

document.getElementById('saveSettings').onclick = () => {
  localStorage.setItem('sound', soundSel.value);
  alert('Settings saved.');
};