import { API_BASE_URL, options } from './api.js';

export async function fetchListings() {
    try {
        const response = await fetch(API_BASE_URL, options());
        if (!response.ok) throw new Error('Failed to fetch listings');

        const data = await response.json();
        displayListings(data.data);

    } catch (error) {
        console.error(error);
    }
}

export async function displayListings(listings) {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';

    if (!Array.isArray(listings) || listings.length === 0) {
        container.innerHTML = '<p>No listings found.</p>';
        return;
    }

    listings.forEach(listing => {
        const card = document.createElement('div');
        card.classList.add('listing-card');

        const imageUrl = listing.media?.[0]?.url || '';
        const imageAlt = listing.media?.[0]?.alt || 'Listing image';

        const sellerName = listing.seller?.name || 'Unknown Seller';

        const bidCount = listing.bids?.length || 0;

        const endDate = listing.endsAt ? new Date(listing.endsAt) : null;

        card.innerHTML = `
            <h2>${listing.title}</h2>
            <p>${listing.description}</p>
            <span>Starting bid: $${listing.startingBid}</span>
            <img src="${imageUrl}" alt="${imageAlt}" />
            <p>Seller: ${sellerName}</p>
            <p>Bids: ${bidCount}</p>
            <p>Ends at: ${endDate ? endDate.toLocaleString() : 'Unknown'}</p>
        `;
        container.appendChild(card);
    });
}