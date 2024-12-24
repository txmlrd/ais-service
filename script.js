const fs = require('fs');
const crypto = require('crypto');

const data = fs.readFileSync('.lic', { encoding: 'utf8' });

const ALGO = 'aes-256-cbc';
const ENC = 'bf3c199c2470cb477d907b1e0917c17b';
const IV = '5183666c72eec9e4';

let decipher = crypto.createDecipheriv(ALGO, ENC, IV);
let decrypted = decipher.update(data, 'base64', 'utf8');
decrypted += decipher.final('utf8');


const dataArray = JSON.parse(decrypted);

const lastIndex = dataArray.length - 1;
const lastValue = dataArray[lastIndex];

const currentDate = new Date();
const decryptedDateObj = new Date(lastValue);

if (currentDate > decryptedDateObj) {
    console.log("Waktu lebih kecil");
} else {
    console.log("Waktu lebih besar");
}
