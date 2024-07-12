import { showModal } from './Modal.js';
import { createControlPanel } from './NFTGallery.js';

let items = [];
let collections = new Set();

export function resetGallery() {
    localStorage.clear();
    items = [];
    collections.clear();
    showModal();
    document.getElementById('nftGallery').innerHTML = '';
    createControlPanel();
}

export function toggleControlPanel() {
    const controlPanel = document.getElementById('controlPanel');
    if (controlPanel.style.display === 'none' || controlPanel.style.display === '') {
        controlPanel.style.display = 'block';
    } else {
        controlPanel.style.display = 'none';
    }
}
