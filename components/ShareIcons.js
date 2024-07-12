export function initializeShareIcons() {
    document.getElementById('shareX').addEventListener('click', function(e) {
        e.preventDefault();
        const currentWallet = localStorage.getItem('wallet');
        const url = encodeURIComponent(window.location.href.split('?')[0]);
        const text = encodeURIComponent("Check out my amazing NFT portfolio! Explore unique digital art on the Solana blockchain. Easy to use and free! #NFT #Solana #CryptoArt #Blockchain");
        window.open(`https://twitter.com/intent/tweet?url=${url}?wallet=${currentWallet}&text=${text}`, '_blank');
    });
}
