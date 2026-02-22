import db from './database.json';

// Export the hotspots directly from the JSON
export const BOSTON_HOTSPOTS = db.hotspots;

// Construct the SCENARIO_DATABASE dynamically
export const SCENARIO_DATABASE = {};

// Loop through each city in the JSON
for (const [cityKey, cityData] of Object.entries(db.scenarios)) {
  SCENARIO_DATABASE[cityKey] = {
    ...cityData,
    // Map the string IDs (like "sidewalk_stop") into the actual module objects
    availableModules: cityData.availableModuleIds.map(moduleId => db.modules[moduleId])
  };
}