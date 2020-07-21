const chokidar = require('chokidar');
const debounce = require('debounce');
const fs = require('fs');
const archiver = require('archiver');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const PORT = process.env.PORT || 3001;
const path = require('path');
const app = express();

app.use(compression());
app.use(cors());

app.use(express.static(path.join(__dirname, '../debug'), {
    setHeaders: function(res, path) {
        res.setHeader('Access-Control-Allow-Headers', 'Etag')
    }}))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));



let currentlyUpdating = false;
const ignoredFiles = ['../debug/bs-debug-app.zip', '../.idea/workspace.xml', '../bs-debug-app.zip', '../.gitignore', '../node_modules/electron'];
let currentDebugPackage = Date.now();
chokidar.watch('..', {ignored: ignoredFiles}).on('change', debounce(updateBrightSign, 300));


function updateBrightSign(path) {
    console.log('Changed ', path);
    if(!currentlyUpdating) {
        zipDirectory('..', '../debug/bs-debug-app.zip').then(()=>{currentDebugPackage = Date.now();currentlyUpdating = false})
    }
}



/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
    try {
        fs.unlinkSync(out)
    }catch (e) {}

    return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 }});
        const output = fs.createWriteStream(out);

        output.on('close', ()=> {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve();
        });
        output.on('end', function() {
            console.log('Data has been drained');
        });
        archive.on('error', function(err) {
            throw err;
        });
        archive.pipe(output);
        archive.append(makeid(4), { name: 'debug-id.txt' });

        archive.append(JSON.stringify({working:true}), { name: 'test' });
        //archive.directory('../brightsign-dumps', 'brightsign-dumps');
        //archive.directory('../node_modules', 'node_modules');
        //archive.file('../bs-debug-software/BS.update.client.js', { name: 'debug.js' });
        //archive.file('../autorun.brs', false);
        archive.file('../bs-start.html', false);
        archive.finalize();
    });

}


function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

