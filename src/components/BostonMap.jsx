import React from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BOSTON_HOTSPOTS } from '../data/mockData';
import bostonGeoData from '../data/bostonGeo.json'; // IMPORT YOUR NEW HEATMAP DATA

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

// This recreates the exact color logic from your HTML file
const getFeatureStyle = (feature) => {
  const name = feature.properties.name;
  let fillColor = "#fed976"; // Default yellow/orange

  if (["Roslindale", "Jamaica Plain", "Leather District", "Fenway", "Brighton", "West Roxbury", "Hyde Park", "Back Bay", "East Boston", "Charlestown", "Mission Hill", "Bay Village", "Chinatown", "North End", "West End", "Beacon Hill", "South Boston Waterfront", "Allston"].includes(name)) {
    fillColor = "#ffffb2"; // Light yellow
  } else if (name === "Roxbury") {
    fillColor = "#fd8d3c"; // Orange
  } else if (["Longwood Medical Area", "Harbor Islands"].includes(name)) {
    fillColor = "#000000"; // Black
  } else if (name === "Dorchester") {
    fillColor = "#bd0026"; // Dark Red
  }

  return {
    color: "#333333", // Border color
    weight: 1,
    opacity: 0.4,
    fillColor: fillColor,
    fillOpacity: 0.65
  };
};

const BostonMap = ({ isLightMode, openIntelPanel }) => {
  const bostonCenter = [42.315, -71.10]; 
  const zoomLevel = 12;

  const darkMapUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const lightMapUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  // Handles mouse hover effects on the heatmap polygons
  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 3, fillOpacity: 0.9 });
      },
      mouseout: (e) => {
        e.target.setStyle(getFeatureStyle(feature));
      },
      click: (e) => {
        // If they click the polygon, see if it matches one of our playable hotspots
        const mappedId = feature.properties.name.toLowerCase().replace(' ', '_');
        const isHotspot = BOSTON_HOTSPOTS.some(h => h.id === mappedId);
        if (isHotspot) {
          openIntelPanel(mappedId);
        }
      }
    });
  };

  return (
    <div className="view-container w-full max-w-5xl fade-in-up">
      <div className="map-header mb-4 flex justify-between items-end">
        <div>
          <h2 className="section-title">TACTICAL MAP: BOSTON</h2>
          <p className="subtitle text-left">Click a flashing neighborhood marker to view intelligence data.</p>
        </div>
      </div>
      
      <div className="tactical-map-wrapper relative">
        <MapContainer 
          center={bostonCenter} 
          zoom={zoomLevel} 
          scrollWheelZoom={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer url={isLightMode ? lightMapUrl : darkMapUrl} />
          
          {/* THE NEW HEATMAP LAYER */}
          <GeoJSON 
            data={bostonGeoData} 
            style={getFeatureStyle}
            onEachFeature={onEachFeature}
          />
          
          {/* YOUR EXISTING INTERACTIVE PINS ON TOP */}
          {BOSTON_HOTSPOTS.map((spot) => (
            <Marker 
              key={spot.id} 
              position={[spot.lat, spot.lng]} 
              icon={createCustomIcon(spot.name)}
              eventHandlers={{ click: () => openIntelPanel(spot.id) }}
            />
          ))}
        </MapContainer>

        {/* CUSTOM HEATMAP LEGEND */}
        <div className="map-legend">
          <div className="legend-title">TOTAL ARRESTS (Top 5 Types)</div>
          <div className="legend-gradient"></div>
          <div className="legend-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BostonMap;