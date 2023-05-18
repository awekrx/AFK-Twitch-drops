import axios from 'axios'
import fs from 'fs'


const api_token = '25db1377059a187e79cbd5ee96c35057'
const url = `https://proxy-seller.io/personal/api/v1/${api_token}`
    + '/proxy/list/'
// + '/system/ping/'

axios.get(url)
    .then(response => {
        console.log(response.data)
    })
    .catch(error => {
        console.log(error.response.data)
        fs.writeFile('error.html', error.response.data, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        })
    })
