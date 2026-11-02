"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_STUDIOS = exports.SEED_USERS = void 0;
exports.SEED_USERS = [
    {
        name: "Elena Vance (Studio Host)",
        email: "host.examiner@studiospace.io",
        password: "", // will be hashed
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        role: "host",
        createdAt: new Date("2026-01-15T10:00:00Z"),
    },
    {
        name: "Marcus Sterling (Creative Director)",
        email: "creator.examiner@studiospace.io",
        password: "", // will be hashed
        photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        role: "creator",
        createdAt: new Date("2026-02-01T11:00:00Z"),
    },
];
exports.SEED_STUDIOS = [
    {
        title: "Apex Daylight Infinity Cyc & Soundstage",
        category: "Photo Studio",
        hourlyRate: 125,
        securityDeposit: 250,
        maxCapacity: 25,
        location: "DUMBO Creative District, Brooklyn, NY",
        image: "https://images.unsplash.com/photo-1736580602204-b940bb0423ec?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1736580602204-b940bb0423ec?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1768818928341-3b31b8965c6d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1791056574617-6f2c0c570352?auto=format&fit=crop&w=1200&q=80"
        ],
        amenities: [
            "24ft Seamless White Cyclorama",
            "Profoto D2 1000W AirTTL Strobe Kit",
            "14ft High Industrial Timber Ceilings",
            "Hair & Makeup Station with Hollywood Mirrors",
            "Dedicated Client Production Lounge",
            "High-Speed 1Gbps Symmetric Fiber Wi-Fi",
            "Drive-In Loading Bay for Heavy Gear"
        ],
        overview: "Apex is a 3,200 sq ft industrial daylight studio bathed in natural northern light through restored factory casement windows. Featuring an unobstructed double-corner cyclorama, automated motorized diffusion curtains, and dedicated green room amenities for high-fashion lookbooks and editorial campaigns.",
        rating: 4.96,
        reviewCount: 38,
        ownerEmail: "host.examiner@studiospace.io",
        ownerName: "Elena Vance",
        createdAt: new Date("2026-03-01T09:00:00Z"),
        updatedAt: new Date("2026-03-01T09:00:00Z"),
    },
    {
        title: "Blackout Cinema Stage A with Camlock Power",
        category: "Film Stage",
        hourlyRate: 195,
        securityDeposit: 400,
        maxCapacity: 45,
        location: "Silver Lake Production Quarter, Los Angeles, CA",
        image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80"
        ],
        amenities: [
            "3-Phase 200A Camlock Power Distro",
            "Complete Acoustic Sound Isolation (NC-25)",
            "ARRI SkyPanel S60-C Overhead Grid",
            "Silent Variable-Speed HVAC System",
            "Wardrobe Fitting & Steamer Suite",
            "Heavy Duty Chapman Dolly Track Ready",
            "Catering Prep Kitchen & Craft Services"
        ],
        overview: "Built to Motion Picture Association sound specifications, Stage A is a true acoustic sanctuary. Featuring an ultra-quiet floating floor, a full ceiling pipe grid with pre-wired DMX controls, and 200A Camlock distro to power heavy cinema lighting arrays without generator noise.",
        rating: 4.98,
        reviewCount: 52,
        ownerEmail: "host.examiner@studiospace.io",
        ownerName: "Elena Vance",
        createdAt: new Date("2026-03-05T10:00:00Z"),
        updatedAt: new Date("2026-03-05T10:00:00Z"),
    },
    {
        title: "The Velvet Broadcast & Video Podcast Suite",
        category: "Podcast Lounge",
        hourlyRate: 85,
        securityDeposit: 150,
        maxCapacity: 8,
        location: "SoHo Arts Corridor, New York, NY",
        image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80"
        ],
        amenities: [
            "4x Shure SM7B Microphones with Cloudlifters",
            "RodeCaster Pro II Production Console",
            "Sony FX3 4K Multi-Cam Auto-Switching Setup",
            "Custom Walnut Podcast Table with Acoustic Felt",
            "Philips Hue RGB Accent Mood Lighting",
            "Live ISO Audio & 4K ProRes Video Recording",
            "StreamYard & Riverside.fm Remote Guest Integration"
        ],
        overview: "Engineered specifically for conversational video podcasts and executive interviews. The Velvet Lounge balances mid-century modern aesthetic warmth with broadcast-grade audio isolation, multi-angle 4K optical tracking cameras, and instant SD card handoff at wrap.",
        rating: 4.91,
        reviewCount: 29,
        ownerEmail: "host.examiner@studiospace.io",
        ownerName: "Elena Vance",
        createdAt: new Date("2026-03-10T11:00:00Z"),
        updatedAt: new Date("2026-03-10T11:00:00Z"),
    },
    {
        title: "Resonance SSL Analog Recording & Mix Suite",
        category: "Music Suite",
        hourlyRate: 165,
        securityDeposit: 300,
        maxCapacity: 12,
        location: "Music Row Historic District, Nashville, TN",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80"
        ],
        amenities: [
            "Solid State Logic (SSL) AWS 948 Console",
            "Neumann U87 Ai & Telefunken ELA M 251 Mics",
            "ATC SCM45A Pro Active Studio Monitors",
            "Pristine Avid Pro Tools HDX 64-Channel Rig",
            "Vintage Tube Outboard Rack (Universal Audio 1176, LA-2A)",
            "Custom Tuned Live Room with Hardwood Resonators",
            "Steinway Model B Grand Piano Included"
        ],
        overview: "A storied tracking and mastering suite where legendary acoustic resonance meets analog warmth. Featuring a custom non-parallel control room tuned by Walters-Storyk Design Group, comprehensive analog outboard gear, and a Steinway B grand piano ready for tracking.",
        rating: 4.99,
        reviewCount: 64,
        ownerEmail: "host.examiner@studiospace.io",
        ownerName: "Elena Vance",
        createdAt: new Date("2026-03-12T12:00:00Z"),
        updatedAt: new Date("2026-03-12T12:00:00Z"),
    },
    {
        title: "The Industrial Loft Ceramic & Fine Arts Studio",
        category: "Art Workshop",
        hourlyRate: 75,
        securityDeposit: 120,
        maxCapacity: 18,
        location: "Wynwood Arts District, Miami, FL",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80"
        ],
        amenities: [
            "6x Shimpo Whisper Potters Wheels",
            "Skutt Automatic Electric Cone 10 Kiln",
            "Natural Light Skylights with North Facing Sun",
            "Industrial Heavy Wash Sinks with Clay Traps",
            "Butcher Block Assembly & Sculpting Worktables",
            "Comprehensive Hand Tools & Glaze Chemistry Lab",
            "Exhibition Display Walls & Gallery Track Lighting"
        ],
        overview: "An expansive sunlit warehouse loft dedicated to sculptors, ceramicists, and mixed-media artists. Equipped with electric pottery wheels, ventilated kiln facilities, large layout surfaces, and a gallery exhibition wall perfect for weekend workshops or creative retreats.",
        rating: 4.88,
        reviewCount: 22,
        ownerEmail: "host.examiner@studiospace.io",
        ownerName: "Elena Vance",
        createdAt: new Date("2026-03-18T13:00:00Z"),
        updatedAt: new Date("2026-03-18T13:00:00Z"),
    },
    {
        title: "Monochrome Minimalist Cyclorama & Motion Lab",
        category: "Photo Studio",
        hourlyRate: 140,
        securityDeposit: 250,
        maxCapacity: 20,
        location: "Shoreditch Design Triangle, London, UK",
        image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
        ],
        amenities: [
            "Double Return U-Shaped Cyclorama Wall",
            "Overhead Pantograph Lighting Rail System",
            "Briese Focus 220 Umbrella Reflector",
            "Tethered Eizo ColorEdge 4K Monitors",
            "Styling Suite with Professional Garment Steamers",
            "Sonos High-Fidelity Multi-Zone Audio System",
            "Private VIP Dressing Room with En-Suite Shower"
        ],
        overview: "London’s premier editorial photography studio, featuring a seamless infinity cove and pantograph overhead rail system to maximize floor real estate. Built for commercial product photography, fashion lookbooks, and high-speed motion capture.",
        rating: 4.94,
        reviewCount: 31,
        ownerEmail: "host.examiner@studiospace.io",
        ownerName: "Elena Vance",
        createdAt: new Date("2026-03-22T14:00:00Z"),
        updatedAt: new Date("2026-03-22T14:00:00Z"),
    },
    {
        title: "Echo Chamber Dolby Atmos Immersive Audio Suite",
        category: "Music Suite",
        hourlyRate: 210,
        securityDeposit: 350,
        maxCapacity: 10,
        location: "Mission District, San Francisco, CA",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
        ],
        amenities: [
            "7.1.4 Dolby Atmos Certified Monitoring (Genelec The Ones)",
            "Pro Tools Ultimate with MTRX Studio Audio Interface",
            "Avid S6 Modular Mixing Console",
            "Custom Diffusive Wood Acoustic Treatment",
            "Calibrated 4K HDR Reference Color Grading Display",
            "Motorized Sit-Stand Producer Console",
            "Zero-Latency Hardware DSP Plugins"
        ],
        overview: "Purpose-built for spatial audio mixes, cinematic post-production scoring, and video game sound design. Certified for Dolby Atmos 7.1.4 immersive spatial monitoring with pinpoint acoustic calibration.",
        rating: 4.97,
        reviewCount: 47,
        ownerEmail: "host.examiner@studiospace.io",
        ownerName: "Elena Vance",
        createdAt: new Date("2026-03-25T15:00:00Z"),
        updatedAt: new Date("2026-03-25T15:00:00Z"),
    },
    {
        title: "The Greenhouse Natural Light Plant Loft",
        category: "Photo Studio",
        hourlyRate: 95,
        securityDeposit: 150,
        maxCapacity: 15,
        location: "West Loop Creative Hub, Chicago, IL",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        ],
        amenities: [
            "120+ Thriving Exotic Tropical Plants & Greenery",
            "Exposed 1920s Brick Wall & Reclaimed Timber",
            "West-Facing Golden Hour Floor-to-Ceiling Windows",
            "Vintage Furniture & Prop Library Included",
            "Godox AD600 Pro Outdoor/Indoor Strobe Kit",
            "Continuous Softbox LED Video Lighting",
            "Kitchenette with Cold Brew Tap & Refreshments"
        ],
        overview: "A warm, botanical sunroom studio adorned with curated mid-century vintage furniture, exposed brick textures, and over 120 lush plants. Renowned for lifestyle photography, brand campaigns, portraiture, and video interviews with warm golden-hour tones.",
        rating: 4.92,
        reviewCount: 35,
        ownerEmail: "host.examiner@studiospace.io",
        ownerName: "Elena Vance",
        createdAt: new Date("2026-03-28T16:00:00Z"),
        updatedAt: new Date("2026-03-28T16:00:00Z"),
    }
];
