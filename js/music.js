const audio = document.getElementById('bgm');
const maxVolume = 0.5;
let fadeInterval;

window.addEventListener('load', () => {
    const savedTime = localStorage.getItem('musicTime');
    if (savedTime) audio.currentTime = parseFloat(savedTime);
    });

setInterval(() => {
    if (!audio.paused) localStorage.setItem('musicTime', audio.currentTime);}, 500);
function transitionVolume(target) {
    clearInterval(fadeInterval); 
if (target > 0 && audio.paused) {
     audio.play().catch(() => console.log("Refresh the page once to enable audio"));
    }
    fadeInterval = setInterval(() => {
        if (audio.volume < target) {
            audio.volume = Math.min(audio.volume + 0.05, target);
        } else if (audio.volume > target) {
            audio.volume = Math.max(audio.volume - 0.05, target);
        }
        if (audio.volume === target) {
            clearInterval(fadeInterval);
            if (target === 0) audio.pause(); 
        }}, 100);
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        transitionVolume(0);
    } else {
        transitionVolume(maxVolume);
    }
});

document.addEventListener('click', () => {
    if (audio.paused) transitionVolume(maxVolume);
}, { once: true });