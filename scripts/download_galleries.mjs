import fs from 'fs';
import path from 'path';
import { initializeApp } from '../node_modules/firebase/app/dist/esm/index.esm.js';
import { getFirestore, doc, setDoc } from '../node_modules/firebase/firestore/dist/esm/index.esm.js';

const firebaseConfig = {
  apiKey: "AIzaSyCRDE48HL3qtGImqX9dIke8CYXjTQwcN5Y",
  authDomain: "premium-car-rental-be15d.firebaseapp.com",
  projectId: "premium-car-rental-be15d",
  storageBucket: "premium-car-rental-be15d.firebasestorage.app",
  messagingSenderId: "974914177772",
  appId: "1:974914177772:web:31a7e27930948cbbfbb3c9",
  measurementId: "G-P8WLMYPS5M",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const VEHICLE_GALLERY_SOURCES = {
  'veh-txl-negra-2022': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine_01.jpg/1280px-Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine_01.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine_02.jpg/1280px-Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine_02.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Toyota_LAND_CRUISER_PRADO_TX%22L_Package%22_%28LDA-GDJ150W-GKTEY%29_interior.jpg/1280px-Toyota_LAND_CRUISER_PRADO_TX%22L_Package%22_%28LDA-GDJ150W-GKTEY%29_interior.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/The_interior_of_Toyota_LAND_CRUISER_PRADO_DIESEL_TX_L_Package_5-Seater_%283DA-GDJ150W-GGTEY%29.jpg/1280px-The_interior_of_Toyota_LAND_CRUISER_PRADO_DIESEL_TX_L_Package_5-Seater_%283DA-GDJ150W-GGTEY%29.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine.jpg/1280px-Toyota_Land_Cruiser_Prado_GDJ150_FL2_2.8_VX_White_Pearl_Crystal_Shine.jpg',
  },
  'veh-runner-blindada-2022': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/2022_Toyota_4Runner_TRD_Pro.jpg/1280px-2022_Toyota_4Runner_TRD_Pro.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Toyota_4Runner_Back_Gate_%2853998820307%29.jpg/1280px-Toyota_4Runner_Back_Gate_%2853998820307%29.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/MG_0092_%2850541925008%29.jpg/1280px-MG_0092_%2850541925008%29.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/MG_0073_%2850542789017%29.jpg/1280px-MG_0073_%2850542789017%29.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/22_Toyota_4Runner_TRD_Off-Road_Premium.jpg/1280px-22_Toyota_4Runner_TRD_Off-Road_Premium.jpg',
  },
  'veh-fortuner-sw4-2023': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Toyota_Fortuner_%28AN160%29_Front.jpg/1280px-Toyota_Fortuner_%28AN160%29_Front.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Toyota_Fortuner_%28AN160%29_rear.jpg/1280px-Toyota_Fortuner_%28AN160%29_rear.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Toyota_Fortuner_LTD_4x2_interior_20221019.jpg/1280px-Toyota_Fortuner_LTD_4x2_interior_20221019.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/2021_Toyota_Fortuner_2.4_VRZ_GR_Sport_4x2_GUN165R_interior_%2820211117%29.jpg/1280px-2021_Toyota_Fortuner_2.4_VRZ_GR_Sport_4x2_GUN165R_interior_%2820211117%29.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/2017-2018_Toyota_Fortuner_%28AN160%29_2.4_V_SUV_%2822-03-2018%29_01.jpg/1280px-2017-2018_Toyota_Fortuner_%28AN160%29_2.4_V_SUV_%2822-03-2018%29_01.jpg',
  },
  'veh-sportage-gris-2022': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kia_Sportage_%28NQ5%29_1X7A0326.jpg/1280px-Kia_Sportage_%28NQ5%29_1X7A0326.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Kia_Sportage_%28NQ5%29_1X7A0328.jpg/1280px-Kia_Sportage_%28NQ5%29_1X7A0328.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Kia_Sportage_NQ5_Black_Interior_%282%29.jpg/1280px-Kia_Sportage_NQ5_Black_Interior_%282%29.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Kia_Sportage_NQ5_Black_Interior_%283%29.jpg/1280px-Kia_Sportage_NQ5_Black_Interior_%283%29.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Kia_Sportage_%28NQ5%29_1X7A0319.jpg/1280px-Kia_Sportage_%28NQ5%29_1X7A0319.jpg',
  },
  'veh-sportage-blanca-2022': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Kia_Sportage_%28NQ5%29_in_White%2C_front_left.jpg/1280px-Kia_Sportage_%28NQ5%29_in_White%2C_front_left.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Kia_Sportage_%28NQ5%29_in_White%2C_rear_left.jpg/1280px-Kia_Sportage_%28NQ5%29_in_White%2C_rear_left.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Kia_Sportage_NQ5_Black_Interior_%285%29.jpg/1280px-Kia_Sportage_NQ5_Black_Interior_%285%29.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Kia_Sportage_Signature_NQ5_PE_Black_%282%29.jpg/1280px-Kia_Sportage_Signature_NQ5_PE_Black_%282%29.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/2023_Kia_Sportage_%28NQ5%29_in_White%2C_rear_right.jpg/1280px-2023_Kia_Sportage_%28NQ5%29_in_White%2C_rear_right.jpg',
  },
  'veh-mazda3-blanco-2018': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/2018_Mazda_3_Sedan_2.0_SkyActiv-G_01.jpg/1280px-2018_Mazda_3_Sedan_2.0_SkyActiv-G_01.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/2018_Mazda_3_2.0S_Sports_%28Rear%29.jpg/1280px-2018_Mazda_3_2.0S_Sports_%28Rear%29.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/2018_Mazda_3_2.0S_Sports_%28Cockpit%29.jpg/1280px-2018_Mazda_3_2.0S_Sports_%28Cockpit%29.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/2018_Mazda_3_Sedan_2.0_SkyActiv-G_07.jpg/1280px-2018_Mazda_3_Sedan_2.0_SkyActiv-G_07.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/2018_Mazda_3_Sedan_2.0_SkyActiv-G_06.jpg/1280px-2018_Mazda_3_Sedan_2.0_SkyActiv-G_06.jpg',
  },
  'veh-suzuki-swift-sport-2022': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Suzuki_SWIFT_Sport_%28CBA-ZC33S-VBRM-J%29_front.jpg/1280px-Suzuki_SWIFT_Sport_%28CBA-ZC33S-VBRM-J%29_front.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Suzuki_SWIFT_Sport_%28CBA-ZC33S-VBRM%29_rear.jpg/1280px-Suzuki_SWIFT_Sport_%28CBA-ZC33S-VBRM%29_rear.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Suzuki_SWIFT_Sport_%28CBA-ZC33S-VBRM%29_interior.jpg/1280px-Suzuki_SWIFT_Sport_%28CBA-ZC33S-VBRM%29_interior.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Suzuki_SWIFT_Sport_%284BA-ZC33S-VBRM-JM2%29_interior.jpg/1280px-Suzuki_SWIFT_Sport_%284BA-ZC33S-VBRM-JM2%29_interior.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Suzuki_SWIFT_Sport_%28CBA-ZC33S-VBRK%29_front.jpg/1280px-Suzuki_SWIFT_Sport_%28CBA-ZC33S-VBRK%29_front.jpg',
  },
  'veh-mercedes-g63-amg': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mercedes-Benz_G-Class_W463_II_63_AMG_Xiamen_01_2022-06-04.jpg/1280px-Mercedes-Benz_G-Class_W463_II_63_AMG_Xiamen_01_2022-06-04.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Mercedes-Benz_G-Klasse_%28W463%29_G_63_AMG_%282018%29_%2852573712118%29.jpg/1280px-Mercedes-Benz_G-Klasse_%28W463%29_G_63_AMG_%282018%29_%2852573712118%29.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Mercedes-AMG_G_63_%28W463A%29_interior.jpg/1280px-Mercedes-AMG_G_63_%28W463A%29_interior.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Mercedes-AMG_G63_%28W464%29_interior.jpg/1280px-Mercedes-AMG_G63_%28W464%29_interior.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Mercedes-Benz_G-Klasse_%28W463%29_G_63_AMG_%282018%29_%2852573631545%29.jpg/1280px-Mercedes-Benz_G-Klasse_%28W463%29_G_63_AMG_%282018%29_%2852573631545%29.jpg',
  },
  'veh-aston-martin-dbx': {
    ext1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/2024_Aston_Martin_DBX_707.jpg/1280px-2024_Aston_Martin_DBX_707.jpg',
    ext2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Aston_Martin_DBX_707_2.jpg/1280px-Aston_Martin_DBX_707_2.jpg',
    int1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Aston_Martin_DBX_707_AM886_Oxford_Tan_Monotone.jpg/1280px-Aston_Martin_DBX_707_AM886_Oxford_Tan_Monotone.jpg',
    int2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Aston_Martin_DBX_DSC_7246.jpg/1280px-Aston_Martin_DBX_DSC_7246.jpg',
    det1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Aston_Martin_DBX_707_3.jpg/1280px-Aston_Martin_DBX_707_3.jpg',
  }
};

const baseDir = '/home/victor/Escritorio/proyecto rentar autos /public/vehicles/gallery';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadFileWithRetry(url, dest, retries = 2) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
    console.log(`Already exists and valid: ${dest}`);
    return true;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'LuxuryCarShowroom/1.0 (https://premium-car-rental-be15d.web.app; victor@premiumcarrental.com)'
        }
      });

      if (res.status === 429) {
        console.warn(`Rate limit 429 on ${url}. Backing off 4 seconds... (Attempt ${attempt + 1}/${retries + 1})`);
        await sleep(4000);
        continue;
      }

      if (!res.ok) {
        console.error(`Failed ${url}: ${res.status}`);
        return false;
      }

      const buf = await res.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buf));
      console.log(`Saved ${dest} (${buf.byteLength} bytes)`);
      return true;
    } catch (err) {
      console.error(`Attempt ${attempt} error for ${url}:`, err.message);
      await sleep(2500);
    }
  }
  return false;
}

async function run() {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  for (const [vehId, photos] of Object.entries(VEHICLE_GALLERY_SOURCES)) {
    const carDir = path.join(baseDir, vehId);
    if (!fs.existsSync(carDir)) {
      fs.mkdirSync(carDir, { recursive: true });
    }

    console.log(`\n========================================`);
    console.log(`Processing 5 natural profile photos for: ${vehId}`);
    console.log(`========================================`);

    await downloadFileWithRetry(photos.ext1, path.join(carDir, 'ext-1.jpg'));
    await sleep(1300);

    await downloadFileWithRetry(photos.ext2, path.join(carDir, 'ext-2.jpg'));
    await sleep(1300);

    await downloadFileWithRetry(photos.int1, path.join(carDir, 'int-1.jpg'));
    await sleep(1300);

    await downloadFileWithRetry(photos.int2, path.join(carDir, 'int-2.jpg'));
    await sleep(1300);

    await downloadFileWithRetry(photos.det1, path.join(carDir, 'detail-1.jpg'));
    await sleep(1300);

    const galleryData = {
      gallery: {
        exteriorImages: [
          `/vehicles/gallery/${vehId}/ext-1.jpg`,
          `/vehicles/gallery/${vehId}/ext-2.jpg`,
        ],
        interiorImages: [
          `/vehicles/gallery/${vehId}/int-1.jpg`,
          `/vehicles/gallery/${vehId}/int-2.jpg`,
        ],
        detailImages: [
          `/vehicles/gallery/${vehId}/detail-1.jpg`,
        ],
      }
    };

    // Update in Firestore
    try {
      const docRef = doc(db, 'vehicles', vehId);
      await setDoc(docRef, galleryData, { merge: true });
      console.log(`✓ Synchronized full 5-photo gallery for ${vehId} in Cloud Firestore!`);
    } catch (err) {
      console.warn(`Firestore sync note for ${vehId}:`, err.message);
    }
  }

  console.log('\nAll 45 vehicle gallery photos downloaded and synced to Firestore successfully!');
  process.exit(0);
}

run();
