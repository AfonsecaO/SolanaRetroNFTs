import { fetchAndDisplayNFTs } from './NFTGallery.js';

export function showModal() {
    document.getElementById('walletModal').style.display = 'flex';
    document.getElementById('walletInput').classList.remove('error');
    document.getElementById('errorText').style.display = 'none';
}

export function saveWallet() {
    const wallet = document.getElementById('walletInput').value;
    if (wallet) {
        localStorage.setItem('wallet', wallet);
        fetchAndDisplayNFTs(wallet);
        document.getElementById('walletModal').style.display = 'none';
    } else {
        handleInvalidWallet();
    }
}
