const axios = require('axios');

// Geolocation function
const getGeoLocation = async (address) => {
    
    try {
        // Google Geocoding API send
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: `${address.line1}, ${address.city}, ${address.postalCode}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
        });

        // fetch Geocoding API answer
        if (response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } else {
            console.error('No results found for address:', address);
            return null;
        }
        
    } catch (err) {
        console.error('Error fetching geolocation:', err.message);
        return null;
    }
    
};

module.exports = { getGeoLocation };
