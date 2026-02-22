export const BOSTON_HOTSPOTS = [
  { id: "beacon_hill", name: "Beacon Hill", lat: 42.3588, lng: -71.0707 },
  { id: "dorchester", name: "Dorchester", lat: 42.3016, lng: -71.0676 },
  { id: "hyde_park", name: "Hyde Park", lat: 42.2565, lng: -71.1243 },
  { id: "roslindale", name: "Roslindale", lat: 42.2832, lng: -71.1270 },
  { id: "west_roxbury", name: "West Roxbury", lat: 42.2798, lng: -71.1627 }
];

// Standardized generic training phases for less-developed scenarios
const defaultPhases = {
  "start": {
    "title": "Initial Encounter",
    "description": "An officer approaches and asks for identification.",
    "choices": [
      { "text": "Provide ID and ask if you are free to go", "isCorrect": true, "feedback": "Good. Complying with basic ID requests safely establishes baseline cooperation while asserting your rights.", "next_id": "victory" },
      { "text": "Walk away abruptly", "isCorrect": false, "feedback": "Walking away from a lawful stop can result in detainment or escalation. Always ask if you are free to leave first.", "next_id": "start" }
    ]
  },
  "victory": { 
    "title": "ENCOUNTER MANAGED", 
    "description": "You successfully navigated the situation by staying calm and knowing your rights.", 
    "choices": [] 
  }
};

export const SCENARIO_DATABASE = {
  "beacon_hill": {
    id: "beacon_hill",
    title: "Public Space Encounter",
    location: "Beacon Hill",
    neighborhoodData: {
      interactionRate: "AVERAGE",
      fioData: { stops: 410, friskRate: "12%", basis: "Encounter / Suspicion" },
      misconductData: { sustained: 12, topViolation: "Respectful Treatment", actionRate: "Moderate" },
      communityContext: { focus: "Property / Drugs", peakTime: "8:00 PM - 12:00 AM" },
      topArrests: "Drugs (65), Assault 209A (56), Trespassing (55)" 
    },
    phases: defaultPhases
  },
  "dorchester": {
    id: "dorchester",
    title: "The High-Stakes Stop", // Updated Title
    location: "Dorchester",
    difficulty: "Advanced", // Added difficulty
    neighborhoodData: {
      interactionRate: "HIGH",
      fioData: { stops: 3200, friskRate: "35%", basis: "Traffic / Suspicion" },
      misconductData: { sustained: 85, topViolation: "Use of Force", actionRate: "Low" },
      communityContext: { focus: "Violent Crime / Weapons", peakTime: "10:00 PM - 2:00 AM" },
      topArrests: "Assault 209A (1761), Firearms (980), Assault w/ Weapon (525)" 
    },
    // INJECTED THE NEW FIREARM STOP PHASES HERE
    phases: {
      "start": {
        "title": "Initial Contact",
        "description": "You're walking down Blue Hill Ave in Dorchester wearing a heavy hoodie. A cruiser pulls onto the sidewalk, blocking your path. The officer stays inside but shouts: 'Keep your hands where I can see them! Why are you walking so heavy on that right side?'",
        "choices": [
          {
            "text": "Keep walking and ignore them since you haven't done anything wrong.",
            "isCorrect": false,
            "feedback": "DANGEROUS. While you have a right to go about your business, ignoring a direct 'show of authority' in a high-crime area can be used by police to justify a pursuit. Stop and keep hands visible.",
            "next_id": "start"
          },
          {
            "text": "Stop, keep your hands visible, and ask: 'Officer, am I free to leave?'",
            "isCorrect": true,
            "feedback": "CORRECT. By stopping and asking this, you are establishing whether this is a 'consensual encounter' or a 'seizure.' In MA, if a reasonable person feels they aren't free to leave, it is a seizure that requires legal justification.",
            "next_id": "detainment_check"
          },
          {
            "text": "Put your hands in your pockets to stay warm and wait for them to approach.",
            "isCorrect": false,
            "feedback": "HIGH RISK. Reaching for or hiding your hands in your pockets during a firearm-related stop is the #1 way to escalate to a 'frisk' or worse. Keep your palms open and visible.",
            "next_id": "start"
          }
        ]
      },
      "detainment_check": {
        "title": "The Investigation",
        "description": "The officer gets out. 'We got a call about a kid with a weapon. You're acting nervous. We need to check you out for safety. You got anything on you that's gonna poke me?'",
        "choices": [
          {
            "text": "Say: 'I'm not answering any questions without a lawyer.'",
            "isCorrect": true,
            "feedback": "EXCELLENT. You are invoking your 5th Amendment right. Even if you don't have a weapon, answering 'investigative' questions can lead to contradictions they use against you later.",
            "next_id": "search_scenario"
          },
          {
            "text": "Say: 'I don't have anything, I'm just a student at the school nearby.'",
            "isCorrect": false,
            "feedback": "CAUTION. Offering personal info or an alibi gives the officer more 'reasonable suspicion' to hold you longer while they 'verify' your story. Remain silent.",
            "next_id": "detainment_check"
          },
          {
            "text": "Tell them to check the other guy down the street instead.",
            "isCorrect": false,
            "feedback": "POOR MOVE. Pointing at others doesn't help your situation and can be seen as 'evasive behavior,' which helps the police justify the stop in court.",
            "next_id": "detainment_check"
          }
        ]
      },
      "search_scenario": {
        "title": "The Pat Down",
        "description": "The officer moves in: 'I'm gonna do a quick pat-down for my safety. Don't move.' He starts feeling your waistline and reaches for your bag.",
        "choices": [
          {
            "text": "State clearly: 'I do not consent to this search or any search of my property.'",
            "isCorrect": true,
            "feedback": "PERFECT. You cannot physically stop the frisk, but by verbally withholding consent, you protect your rights. If the frisk is later found to be illegal, anything they find can be thrown out in court.",
            "next_id": "legal_nuance"
          },
          {
            "text": "Say: 'Go ahead, you won't find anything.'",
            "isCorrect": false,
            "feedback": "FAIL. In MA, if you give consent, you waive your 4th Amendment protections. Even if you are clean, you are teaching the officer that they don't need a warrant or suspicion to stop you.",
            "next_id": "search_scenario"
          },
          {
            "text": "Twist away so they can't feel your pockets.",
            "isCorrect": false,
            "feedback": "DANGEROUS. Physical resistance, even if you're innocent, gives the police the right to use force and charge you with 'Resisting Arrest.' Stand still but keep speaking your rights.",
            "next_id": "search_scenario"
          }
        ]
      },
      "legal_nuance": {
        "title": "The 'Plain Feel' Rule",
        "description": "The officer feels a hard object in your pocket. It's actually a large battery pack, but he tries to reach inside to pull it out. 'What is this? It feels like a magazine.'",
        "choices": [
          {
            "text": "Let him pull it out and explain what it is.",
            "isCorrect": false,
            "feedback": "NOT IDEAL. If an officer knows an object isn't a weapon via 'plain feel,' they cannot legally search the pocket further. By letting them, you are 'consenting' to the expansion of the search.",
            "next_id": "legal_nuance"
          },
          {
            "text": "State: 'If you know it's not a weapon, you have no right to reach inside my pockets.'",
            "isCorrect": true,
            "feedback": "LEGAL PRO. Under the 'Plain Feel' doctrine, if the officer knows the object isn't a weapon through the clothing, the search must stop there. You are asserting the limit of their power.",
            "next_id": "victory"
          },
          {
            "text": "Pull the object out yourself to show them quickly.",
            "isCorrect": false,
            "feedback": "EXTREMELY DANGEROUS. Never reach into your own pockets during a firearm investigation. The officer may perceive this as you drawing a weapon and respond with deadly force.",
            "next_id": "legal_nuance"
          }
        ]
      },
      "victory": {
        "title": "KNOWLEDGE IS POWER",
        "description": "You successfully navigated a high-risk firearm stop in Dorchester. You remained calm, kept your hands visible, and clearly withdrew consent, protecting your legal standing and your life.",
        "choices": []
      }
    }
  },
  "hyde_park": {
    id: "hyde_park",
    title: "Neighborhood Stop",
    location: "Hyde Park",
    neighborhoodData: {
      interactionRate: "MODERATE",
      fioData: { stops: 850, friskRate: "20%", basis: "Suspicion / Encounter" },
      misconductData: { sustained: 28, topViolation: "Biased Policing", actionRate: "Moderate" },
      communityContext: { focus: "Domestic / Weapons", peakTime: "6:00 PM - 1:00 AM" },
      topArrests: "Assault 209A (316), Firearms (69), Assault w/ Weapon (48)" 
    },
    phases: defaultPhases
  },
  "roslindale": {
    id: "roslindale",
    title: "Street Engagement",
    location: "Roslindale",
    neighborhoodData: {
      interactionRate: "MODERATE",
      fioData: { stops: 620, friskRate: "18%", basis: "Traffic / Encounter" },
      misconductData: { sustained: 15, topViolation: "Neglect of Duty", actionRate: "High" },
      communityContext: { focus: "Assault / Firearms", peakTime: "7:00 PM - Midnight" },
      topArrests: "Assault 209A (188), Firearms (52), Assault w/ Weapon (34)" 
    },
    phases: defaultPhases
  },
  "west_roxbury": {
    id: "west_roxbury",
    title: "Vehicle Stop",
    location: "West Roxbury",
    neighborhoodData: {
      interactionRate: "LOW",
      fioData: { stops: 300, friskRate: "8%", basis: "Traffic Violation" },
      misconductData: { sustained: 9, topViolation: "Respectful Treatment", actionRate: "High" },
      communityContext: { focus: "Domestic / Property", peakTime: "4:00 PM - 10:00 PM" },
      topArrests: "Assault 209A (172), Assault w/ Weapon (31), Firearms (28)" 
    },
    phases: defaultPhases
  }
};