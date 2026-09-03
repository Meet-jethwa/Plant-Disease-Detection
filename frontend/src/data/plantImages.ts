// plantImages.ts — Real photograph images and affected plant part definitions for Rice, Wheat, Sugarcane & Cotton


export const REAL_PLANT_PHOTOS = {
  rice: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  sugarcane: 'https://images.unsplash.com/photo-1594771804886-a933b225350c?auto=format&fit=crop&w=800&q=80',
  cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80',
  riceBlast: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
  riceBrownSpot: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&w=800&q=80',
  wheatRust: 'https://images.unsplash.com/photo-1501430654243-c934cec2e1c0?auto=format&fit=crop&w=800&q=80',
  wheatSeptoria: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
  sugarcaneRedRot: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
  sugarcaneMosaic: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=800&q=80',
  cottonBlight: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
  cottonLeafCurl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
}

export const PLANT_IMAGES = REAL_PLANT_PHOTOS


export function getCropImage(crop: string): string {
  const c = crop.toLowerCase()
  if (c.includes('rice')) return REAL_PLANT_PHOTOS.rice
  if (c.includes('wheat')) return REAL_PLANT_PHOTOS.wheat
  if (c.includes('sugar')) return REAL_PLANT_PHOTOS.sugarcane
  if (c.includes('cotton')) return REAL_PLANT_PHOTOS.cotton
  return REAL_PLANT_PHOTOS.rice
}

export function getDiseaseImage(crop: string, diseaseName: string): string {
  const d = diseaseName.toLowerCase()
  if (d.includes('blast')) return REAL_PLANT_PHOTOS.riceBlast
  if (d.includes('brown spot')) return REAL_PLANT_PHOTOS.riceBrownSpot
  if (d.includes('rust')) return REAL_PLANT_PHOTOS.wheatRust
  if (d.includes('septoria')) return REAL_PLANT_PHOTOS.wheatSeptoria
  if (d.includes('red rot')) return REAL_PLANT_PHOTOS.sugarcaneRedRot
  if (d.includes('mosaic')) return REAL_PLANT_PHOTOS.sugarcaneMosaic
  if (d.includes('blight')) return REAL_PLANT_PHOTOS.cottonBlight
  if (d.includes('curl')) return REAL_PLANT_PHOTOS.cottonLeafCurl
  return getCropImage(crop)
}
