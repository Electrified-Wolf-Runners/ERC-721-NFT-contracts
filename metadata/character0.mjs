import fs from 'fs';
import { File } from 'nft.storage'

const character0 = {
  name: "Eren",
  description: "Inspiring, Bold, Mythical, Human loving creature.",
  image: new File([ await fs.promises.readFile('/home/zx/code/ewo-nft/images/character-0.jpg')], 'character-0.jpg',
  { type: 'image/jpg'
}),
  attributes: [
    { trait_type: "Speed", value: 3 },
    { trait_type: "Strength", value: 41 },
    { trait_type: "Agility", value: 15 },
    { trait_type: "Charisma", value: 85 },
    { trait_type: "Power", value: 56 },
    { trait_type: "Intelligence", value: 76 },
  ],
};

export default character0;