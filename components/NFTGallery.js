import interact from 'interactjs';
import { resetGallery } from './ControlPanel.js';
import { showModal } from './Modal.js';

let highestZIndex = 1;
let items = [];
let collections = new Set();

async function fetchNFTs(wallet) {
    try {
        const response = await fetch(`/api/proxy.php?wallet=${wallet}`);
        const result = await response.json();
        if (!response.ok || result.errors) {
            handleInvalidWallet();
            throw new Error('Invalid wallet address');
        }
        return result;
    } catch (err) {
        console.error(err);
        handleInvalidWallet();
        return [];
    }
}

function handleInvalidWallet() {
    const walletInput = document.getElementById('walletInput');
    const errorText = document.getElementById('errorText');
    walletInput.classList.add('error');
    errorText.style.display = 'block';
    showModal();
}

function getRandomRotation() {
    return Math.floor(Math.random() * 21) - 10;
}

function getRandomPosition(existingPositions, minDistance) {
    const gallery = document.getElementById('nftGallery');
    const galleryWidth = gallery.clientWidth;
    const galleryHeight = gallery.clientHeight;
    let position;
    let attempts = 0;

    do {
        const x = Math.random() * (galleryWidth - 200);
        const y = Math.random() * (galleryHeight - 200);
        position = { x, y };
        attempts++;
    } while (!isValidPosition(position, existingPositions, minDistance) && attempts < 100);

    return position;
}

function isValidPosition(position, existingPositions, minDistance) {
    for (let i = 0; i < existingPositions.length; i++) {
        const existingPosition = existingPositions[i];
        const distance = Math.sqrt(Math.pow(position.x - existingPosition.x, 2) + Math.pow(position.y - existingPosition.y, 2));
        if (distance < minDistance) {
            return false;
        }
    }
    return true;
}

function moveToBounds(target) {
    const gallery = document.getElementById('nftGallery');
    const rect = target.getBoundingClientRect();
    const galleryRect = gallery.getBoundingClientRect();
    let x = parseFloat(target.getAttribute('data-x')) || 0;
    let y = parseFloat(target.getAttribute('data-y')) || 0;

    if (rect.right > galleryRect.right) {
        x -= rect.right - galleryRect.right;
    }
    if (rect.bottom > galleryRect.bottom) {
        y -= rect.bottom - galleryRect.bottom;
    }
    if (rect.left < galleryRect.left) {
        x += galleryRect.left - rect.left;
    }
    if (rect.top < galleryRect.top) {
        y += galleryRect.top - rect.top;
    }

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.style.transform = `translate(${x}px, ${y}px) rotate(${target.getAttribute('data-rotation')}deg)`;
}

export function createControlPanel() {
    const controlPanel = document.getElementById('controlPanel');
    controlPanel.innerHTML = `
        <span class="reset-button" id="resetButton" title="Reset">
            <i class="fas fa-sync-alt"></i> Reset
        </span>
        <div class="separator"></div>
    `;

    let i = 0;
    collections.forEach(collection => {
        const isChecked = localStorage.getItem(collection) !== 'false';
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" class="collection-filter" id="collectionFilter${i++}" value="${collection}" ${isChecked ? 'checked' : ''}> ${collection}
        `;
        controlPanel.appendChild(label);
    });

    document.querySelectorAll('.collection-filter').forEach(checkbox => {
        checkbox.addEventListener('change', filterNFTs);
    });

    document.getElementById('resetButton').addEventListener('click', resetGallery);
}

function filterNFTs() {
    const activeCollections = Array.from(document.querySelectorAll('.collection-filter:checked')).map(cb => cb.value);

    items.forEach(item => {
        const collection = item.getAttribute('data-collection');
        if (activeCollections.includes(collection)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });

    document.querySelectorAll('.collection-filter').forEach(checkbox => {
        localStorage.setItem(checkbox.value, checkbox.checked);
    });
}

function savePosition(id, x, y, rotation, zIndex) {
    const positions = JSON.parse(localStorage.getItem('positions')) || {};
    positions[id] = { x, y, rotation, zIndex };
    localStorage.setItem('positions', JSON.stringify(positions));
}

function loadPosition(id) {
    const positions = JSON.parse(localStorage.getItem('positions')) || {};
    return positions[id] || null;
}

export async function fetchAndDisplayNFTs(wallet) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'block';
    const nfts = await fetchNFTs(wallet);
    const gallery = document.getElementById('nftGallery');
    gallery.innerHTML = '';
    const existingPositions = [];
    const minDistance = 200;
    collections.clear();

    nfts.forEach((nft, index) => {
        const item = document.createElement('div');
        item.className = 'nft-item';
        const savedPosition = loadPosition(nft.mintAddress);

        let rotation, position, zIndex;
        if (savedPosition) {
            rotation = savedPosition.rotation;
            position = { x: savedPosition.x, y: savedPosition.y };
            zIndex = savedPosition.zIndex;
        } else {
            rotation = getRandomRotation();
            position = getRandomPosition(existingPositions, minDistance);
            zIndex = highestZIndex++;
        }

        item.style.transform = `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`;
        item.style.left = `0px`;
        item.style.top = `0px`;
        item.style.zIndex = zIndex;
        item.setAttribute('data-rotation', rotation);
        item.setAttribute('data-x', position.x);
        item.setAttribute('data-y', position.y);
        item.setAttribute('data-id', nft.mintAddress);
        item.setAttribute('data-zindex', zIndex);
        item.setAttribute('data-collection', nft.collectionName);

        let imageUri = nft.image;
        if (nft.properties && nft.properties.files) {
            const pngFile = nft.properties.files.find(file => file.type === 'image/png');
            if (pngFile) {
                imageUri = pngFile.uri;
            }
        }

        item.innerHTML = `
            <img src="${imageUri}" alt="${nft.name}" loading="lazy">
            <div class="caption">${nft.name}</div>
        `;
        gallery.appendChild(item);
        existingPositions.push(position);
        items.push(item);
        collections.add(nft.collectionName);

        interact(item).draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrict({
                    restriction: 'parent',
                    endOnly: true,
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                })
            ],
            listeners: {
                move(event) {
                    const target = event.target;
                    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    if (window.innerWidth <= 600) {
                        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx * 2;
                        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy * 2;
                    }

                    target.style.transform = `translate(${x}px, ${y}px) rotate(${target.getAttribute('data-rotation')}deg)`;

                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                end(event) {
                    const target = event.target;
                    moveToBounds(target);
                    savePosition(target.getAttribute('data-id'), parseFloat(target.getAttribute('data-x')), parseFloat(target.getAttribute('data-y')), parseFloat(target.getAttribute('data-rotation')), parseFloat(target.getAttribute('data-zindex')));
                },
                inertiaend(event) {
                    const target = event.target;
                    moveToBounds(target);
                    savePosition(target.getAttribute('data-id'), parseFloat(target.getAttribute('data-x')), parseFloat(target.getAttribute('data-y')), parseFloat(target.getAttribute('data-rotation')), parseFloat(target.getAttribute('data-zindex')));
                },
                start(event) {
                    highestZIndex++;
                    event.target.style.zIndex = highestZIndex;
                    event.target.setAttribute('data-zindex', highestZIndex);
                }
            }
        }).gesturable({
            listeners: {
                move(event) {
                    const target = event.target;
                    let currentRotation = parseFloat(target.getAttribute('data-rotation')) || 0;
                    currentRotation += event.da;
                    target.style.transform = `translate(${target.getAttribute('data-x') || 0}px, ${target.getAttribute('data-y') || 0}px) rotate(${currentRotation}deg)`;
                    target.setAttribute('data-rotation', currentRotation);
                }
            }
        });
    });

    spinner.style.display = 'none';
    createControlPanel();
    filterNFTs();

    // Eliminar el parámetro 'wallet' de la URL actual
    const url = new URL(window.location.href);
    url.searchParams.delete('wallet');
    history.replaceState(null, '', url.toString());
}
