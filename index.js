const express = require('express')
const path = require('path');
let crypto = require('crypto')
const fs = require('fs')

const app = express()
const port = 3000
const filePath = path.resolve(__dirname, 'demo.html');

app.use('/public', express.static('public'))
app.use('/assets', express.static('assets'))
app.use('/library', express.static('library'))

app.get('/', (req, res) => {
  
  res.sendFile(filePath);
})

app.get('/lisensi', (req, res) => {
  
  const ENC= 'bf3c199c2470cb477d907b1e0917c17b'; //encription key
  const IV = "5183666c72eec9e4";
  const ALGO = "aes-256-cbc" //encription algoritm 

  const data = fs.readFileSync('.lic',{ encoding: 'utf8'});


  let decipher = crypto.createDecipheriv(ALGO, ENC, IV);
  let decrypted = decipher.update(data.toString(), 'base64', 'utf8');
  decrypted += decipher.final('utf8')
  // console.log(decrypted + decipher.final('utf8'));
  /**
   * 1. baca file .lic yang ada di root folder
   * 2. convert data file yang ada di .lic ke text
   * 3. encript data yang di atas hingga jadi seperti dengan ENC, IV dan ALGO yang telah disediakan ---> ["asda","03/01/2024","05/01/2024"]
   * 4. dapatkan index terakhir array dari hasil enkripsian ---> "05/01/2024"
   * 5. konvert hasil no 4 ke dateime, lalu bandingkan dengan date hari ini
   * 6. jika hasil lebih besar, maka res.send("berhasil"), jika lebih kecil res.send("gagal") 
   */
  res.send(decrypted )
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
