// Artwork cropped from the design mockups. Files live in public/resources/art.
export const art = (name: string) => './resources/art/' + name + (name === 'splash-logo' || name === 'logo-eye' ? '.png' : '.jpg');
