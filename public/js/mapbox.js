/* eslint-disable */
// import L from 'leaflet';

export const displayMap = locations => {
  // Fix Leaflet icon paths
  L.Icon.Default.imagePath = '/img/leaflet/';

  // Create map
  const map = L.map('map', {
    scrollWheelZoom: false
  });
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);
  
  // Create bounds for all markers
  const bounds = L.latLngBounds();
  
  // Add markers for each location
  locations.forEach(loc => {
    // Create a marker - assuming GeoJSON format with coordinates [lng, lat]
    const lat = loc.coordinates[1];
    const lng = loc.coordinates[0];
    
    // Add marker to map
    const marker = L.marker([lat, lng]).addTo(map);
    
    // Add popup with location info
    marker.bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`);
    
    // Extend bounds to include this marker
    bounds.extend([lat, lng]);
  });
  
  // Fit the map to show all markers with some padding
  map.fitBounds(bounds, {
    padding: [50, 50]
  });
}
