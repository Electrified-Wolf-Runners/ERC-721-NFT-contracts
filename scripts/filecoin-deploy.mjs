import dotenv from 'dotenv';
import { NFTStorage } from 'nft.storage';
import character0 from  '../metadata/character0.mjs'


dotenv.config();
const apiKey = process.env.NFTSTORAGE_API_KEY;

async function main() {

const client = new NFTStorage({ token: apiKey })

const metadata = await client.store(character0);
console.log(metadata.url);
}

main();