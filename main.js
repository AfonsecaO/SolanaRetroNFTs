import { fetchAndDisplayNFTs } from './components/NFTGallery.js';
import { showModal, saveWallet } from './components/Modal.js';
import { resetGallery, toggleControlPanel } from './components/ControlPanel.js';
import { initializeShareIcons } from './components/ShareIcons.js';

document.addEventListener('DOMContentLoaded', () => {
    const walletFromUrl = new URLSearchParams(window.location.search).get('wallet');
    const wallet = walletFromUrl || localStorage.getItem('wallet');

    if (!wallet) {
        showModal();
    } else {
        localStorage.setItem('wallet', wallet);
        fetchAndDisplayNFTs(wallet);
    }

    document.getElementById('saveWalletButton').addEventListener('click', saveWallet);
    document.getElementById('resetButton').addEventListener('click', resetGallery);
    document.getElementById('configButton').addEventListener('click', toggleControlPanel);

    initializeShareIcons();
});
