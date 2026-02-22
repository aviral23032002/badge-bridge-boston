import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BOSTON_HOTSPOTS } from '../data/mockData';

const createCustomIcon = (name) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="map-marker">
        <div class="pin"></div>
        <div class="pin-label">${name}</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const BostonMap = ({ isLightMode, openIntelPanel }) => {
  // Centered slightly south so Beacon Hill to West Roxbury fits perfectly
  const bostonCenter = [42.315, -71.10]; 
  const zoomLevel = 12;

  const darkMapUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const lightMapUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="view-container w-full max-w-5xl fade-in-up">
      <div className="map-header mb-4">
        <h2 className="section-title">TACTICAL MAP: BOSTON</h2>
        <p className="subtitle text-left">Click a flashing neighborhood marker to view intelligence data.</p>
      </div>
      
      <div className="tactical-map-wrapper">
        <MapContainer 
          center={bostonCenter} 
          zoom={zoomLevel} 
          scrollWheelZoom={false}
          attributionControl={false} /* <-- THIS REMOVES THE WATERMARK */
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url={isLightMode ? lightMapUrl : darkMapUrl}
          />
          
          {BOSTON_HOTSPOTS.map((spot) => (
            <Marker 
              key={spot.id} 
              position={[spot.lat, spot.lng]} 
              icon={createCustomIcon(spot.name)}
              eventHandlers={{
                click: () => openIntelPanel(spot.id),
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default BostonMap;