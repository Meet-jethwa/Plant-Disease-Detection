// plantImages.ts — Local optimized vector/photographic references for Rice, Wheat, Sugarcane & Cotton
// All remote Unsplash dependencies removed. Uses local assets in public/images/library/

export const LIBRARY_IMAGE_PATHS = {
  rice: '/images/library/rice.svg',
  wheat: '/images/library/wheat.svg',
  sugarcane: '/images/library/sugarcane.svg',
  cotton: '/images/library/cotton.svg',
  riceBlast: '/images/library/rice-blast.svg',
  riceBrownSpot: '/images/library/rice-brown-spot.svg',
  riceHispa: '/images/library/rice-hispa.svg',
  wheatRust: '/images/library/wheat-brown-rust.svg',
  wheatYellowRust: '/images/library/wheat-yellow-rust.svg',
  wheatSeptoria: '/images/library/wheat-septoria.svg',
  sugarcaneRedRot: '/images/library/sugarcane-red-rot.svg',
  sugarcaneMosaic: '/images/library/sugarcane-mosaic.svg',
  cottonBlight: '/images/library/cotton-bacterial-blight.svg',
  cottonLeafCurl: '/images/library/cotton-leaf-curl.svg',
  placeholder: '/images/library/placeholder-leaf.svg',
}

export const REAL_PLANT_PHOTOS = LIBRARY_IMAGE_PATHS
export const PLANT_IMAGES = LIBRARY_IMAGE_PATHS

export function getCropImage(crop: string): string {
  const c = crop.toLowerCase()
  if (c.includes('rice')) return LIBRARY_IMAGE_PATHS.rice
  if (c.includes('wheat')) return LIBRARY_IMAGE_PATHS.wheat
  if (c.includes('sugar')) return LIBRARY_IMAGE_PATHS.sugarcane
  if (c.includes('cotton')) return LIBRARY_IMAGE_PATHS.cotton
  return LIBRARY_IMAGE_PATHS.rice
}

export function getDiseaseImage(crop: string, diseaseName: string): string {
  const d = diseaseName.toLowerCase()
  if (d.includes('blast')) return LIBRARY_IMAGE_PATHS.riceBlast
  if (d.includes('brown spot')) return LIBRARY_IMAGE_PATHS.riceBrownSpot
  if (d.includes('hispa')) return LIBRARY_IMAGE_PATHS.riceHispa
  if (d.includes('yellow') || d.includes('stripe')) return LIBRARY_IMAGE_PATHS.wheatYellowRust
  if (d.includes('rust')) return LIBRARY_IMAGE_PATHS.wheatRust
  if (d.includes('septoria')) return LIBRARY_IMAGE_PATHS.wheatSeptoria
  if (d.includes('red rot')) return LIBRARY_IMAGE_PATHS.sugarcaneRedRot
  if (d.includes('mosaic')) return LIBRARY_IMAGE_PATHS.sugarcaneMosaic
  if (d.includes('blight')) return LIBRARY_IMAGE_PATHS.cottonBlight
  if (d.includes('curl')) return LIBRARY_IMAGE_PATHS.cottonLeafCurl
  return getCropImage(crop)
}
