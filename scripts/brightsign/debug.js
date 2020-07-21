const http_debug = require('http');
const axios_debug = require('axios');
const yauzl_debug = require("yauzl");
const fs_debug = require("fs");
const mkdirp_debug = require("mkdirp");
const path_debug = require("path");


console.log('starting debug client!');
let downloading_debug = false;
let url_debug;
try {
    url_debug = `http://${JSON.parse(fs.readFileSync('env.json')).host}:3001/bs-debug-app.zip`;
} catch (e) {
    url_debug = 'http://localhost:3001/bs-debug-app.zip'
}


const permFiles = ['package','debug.js', 'debug.js', 'etag', 'node_modules', 'env.json', 'autorun.brs', 'brightsign-dumps', 'tmp', 'settings.json'];



let tmpDir = 'tmp';
let currentTag = '';
try {
    currentTag = fs_debug.readFileSync('etag', 'utf8');
} catch (e) {}


setInterval(() => {
    if (!downloading_debug) {

        axios_debug.head(url_debug, {headers: {"if-none-match": currentTag}})
            .then(function (response) {
                console.log('updating debug package');
                fs_debug.writeFileSync('etag', response.headers.etag);
                downloading_debug = true;
                if (fs_debug.existsSync('bs-debug-app.zip')) fs_debug.unlinkSync('bs-debug-app.zip');
                download_debug(url_debug, './bs-debug-app.zip', function (err) {
                    if (err) {
                        console.log(err, 't')
                    } else {
                        console.log("finished download");
                        unzipFile_debug('bs-debug-app.zip', tmpDir).then(() => {
                            console.log('finished unzipping');
                            replaceFiles_debug();
                        })
                    }
                })
            }).catch((response) => {
            console.log(response)
        })
    }
}, 1000);



function download_debug(url, dest, cb) {
    const file = fs_debug.createWriteStream(dest);
    const request = http_debug.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);  // close() is async, call cb after close completes.
            console.log('file closed')
        });
    }).on('error', function(err) { // Handle errors
        fs_debug.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};

function unzipFile_debug(zipName, unzipLocation){
    if (fs_debug.existsSync(unzipLocation)) {
        deleteFolder_debug(unzipLocation)
    }
    return new Promise((resolve, reject)=>{
        yauzl_debug.open(zipName, {lazyEntries: true}, function(err, zipfile) {
            if (err) throw err;
            zipfile.readEntry();
            zipfile.on("close", function() {
                resolve();
            });
            zipfile.on("entry", function(entry) {
                if (/\/$/.test(unzipLocation+'/'+entry.fileName)) {
                    // directory file names end with '/'
                    console.log(unzipLocation+'/'+entry.fileName, 'dir');
                    mkdirp_debug(path_debug.dirname(unzipLocation+'/'+entry.fileName)).then((err) =>{
                        zipfile.readEntry();
                    });
                } else {
                    // file entry
                    zipfile.openReadStream(entry, function(err, readStream) {
                        if (err) throw err;
                        // ensure parent directory exists
                        console.log(unzipLocation+'/'+entry.fileName, 'file');
                        mkdirp_debug(path_debug.dirname(unzipLocation+'/'+entry.fileName)).then((err) =>{

                            readStream.pipe(fs_debug.createWriteStream(unzipLocation+'/'+entry.fileName));
                            readStream.on("end", function() {
                                zipfile.readEntry();
                            });
                        });
                    });
                }
            });
        });
    })

}


function replaceFiles_debug(){
    let bsObj;
    try{
        bsObj = new BSDeviceInfo();
    } catch (e) {}
    if (typeof bsObj!== 'undefined') {
        console.log('Check for BrightSign object successful');
        fs_debug.readdirSync('.').forEach(file => {
            if(!permFiles.includes(file)) deleteFolder_debug(file);
            console.log(file);
        });
        fs_debug.readdirSync('tmp').forEach(file => {
            fs_debug.renameSync('tmp/'+file, file)
        });
        deleteFolder_debug('tmp');
        if(location){
            location.reload();
        }
    } else {
        console.log('Check for BrightSign object was not successful');
        process.exit(1);
    }
}



function deleteFolder_debug(path){

    const deleteFolderRecursive = function (path) {
        if (fs_debug.existsSync(path)) {
            fs_debug.readdirSync(path).forEach(function (file, index) {
                const curPath = path + "/" + file;
                if (fs_debug.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs_debug.unlinkSync(curPath);
                }
            });
            fs_debug.rmdirSync(path);
        }
    };
    if(fs_debug.lstatSync(path).isFile()) fs_debug.unlinkSync(path);
    else deleteFolderRecursive(path);
}



