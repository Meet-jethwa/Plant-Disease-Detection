const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images', 'library');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const entries = [
  { file: 'rice.svg', crop: 'Rice (Oryza sativa)', title: 'Rice Field Foliage', desc: 'Healthy cereal canopy reference' },
  { file: 'wheat.svg', crop: 'Wheat (Triticum aestivum)', title: 'Wheat Canopy', desc: 'Healthy golden-green cereal reference' },
  { file: 'sugarcane.svg', crop: 'Sugarcane (Saccharum)', title: 'Sugarcane Stalk & Leaves', desc: 'Healthy perennial grass canopy' },
  { file: 'cotton.svg', crop: 'Cotton (Gossypium)', title: 'Cotton Foliage & Bolls', desc: 'Healthy broadleaf canopy reference' },
  { file: 'rice-blast.svg', crop: 'Rice', title: 'Rice Blast', desc: 'Magnaporthe oryzae — Spindle lesions' },
  { file: 'rice-brown-spot.svg', crop: 'Rice', title: 'Brown Spot', desc: 'Helminthosporium oryzae — Oval brown spots' },
  { file: 'rice-hispa.svg', crop: 'Rice', title: 'Hispa Beetle Damage', desc: 'Dicladispa armigera — White streaks' },
  { file: 'wheat-brown-rust.svg', crop: 'Wheat', title: 'Brown Rust / Leaf Rust', desc: 'Puccinia triticina — Orange-brown pustules' },
  { file: 'wheat-yellow-rust.svg', crop: 'Wheat', title: 'Yellow / Stripe Rust', desc: 'Puccinia striiformis — Parallel stripes' },
  { file: 'wheat-septoria.svg', crop: 'Wheat', title: 'Septoria Leaf Blotch', desc: 'Zymoseptoria tritici — Rectangular blotches' },
  { file: 'sugarcane-red-rot.svg', crop: 'Sugarcane', title: 'Red Rot', desc: 'Colletotrichum falcatum — Red internal stalk lesions' },
  { file: 'sugarcane-mosaic.svg', crop: 'Sugarcane', title: 'Mosaic Virus', desc: 'Sugarcane Mosaic Potyvirus — Mottled streaks' },
  { file: 'cotton-bacterial-blight.svg', crop: 'Cotton', title: 'Bacterial Blight', desc: 'Xanthomonas citri — Angular water-soaked spots' },
  { file: 'cotton-leaf-curl.svg', crop: 'Cotton', title: 'Leaf Curl Virus', desc: 'Begomovirus — Upward curling & thick veins' },
  { file: 'placeholder-leaf.svg', crop: 'FloraAI Botanical', title: 'Plant Leaf Specimen', desc: 'Photographic reference placeholder' }
];

function createSvg(entry) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="50%" stop-color="#0B8F68"/>
      <stop offset="100%" stop-color="#032D23"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#34D399" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#064E3B" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect width="800" height="500" fill="url(#glow)"/>

  <!-- Botanical Leaf Art Silhouette -->
  <g transform="translate(400, 210)" filter="url(#shadow)">
    <!-- Central Stem -->
    <path d="M 0,110 C -10,30 -5,-70 0,-130" stroke="#A7F3D0" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.8"/>
    
    <!-- Left Leaf Blade -->
    <path d="M 0,-130 C -90,-80 -140,-10 -130,50 C -120,90 -50,110 0,110 C 0,50 0,-50 0,-130 Z" fill="#10B981" fill-opacity="0.4" stroke="#6EE7B7" stroke-width="2.5"/>
    
    <!-- Right Leaf Blade -->
    <path d="M 0,-130 C 90,-80 140,-10 130,50 C 120,90 50,110 0,110 C 0,50 0,-50 0,-130 Z" fill="#059669" fill-opacity="0.5" stroke="#6EE7B7" stroke-width="2.5"/>
    
    <!-- Veins -->
    <path d="M 0,-60 Q -45,-45 -85,-35" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
    <path d="M 0,-60 Q 45,-45 85,-35" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
    <path d="M 0,-10 Q -50,0 -95,15" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
    <path d="M 0,-10 Q 50,0 95,15" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
    <path d="M 0,40 Q -40,50 -70,68" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
    <path d="M 0,40 Q 40,50 70,68" stroke="#A7F3D0" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
  </g>

  <!-- Specimen badge -->
  <g transform="translate(400, 360)">
    <rect x="-180" y="-18" width="360" height="36" rx="18" fill="#042F24" fill-opacity="0.8" stroke="#34D399" stroke-width="1.5"/>
    <text x="0" y="5" text-anchor="middle" fill="#A7F3D0" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" letter-spacing="1.5">
      ${entry.crop.toUpperCase()}
    </text>
  </g>

  <!-- Title & Subtitle -->
  <text x="400" y="425" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="700" letter-spacing="0.5">
    ${entry.title}
  </text>
  <text x="400" y="458" text-anchor="middle" fill="#D1FAE5" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="400" opacity="0.9">
    ${entry.desc}
  </text>
</svg>`;
}

for (const e of entries) {
  const filePath = path.join(targetDir, e.file);
  fs.writeFileSync(filePath, createSvg(e), 'utf8');
}

console.log(`Generated ${entries.length} SVG library illustrations in ${targetDir}`);
