const fs = require('fs');
const apv = require('appversion');
const archiver = require('archiver');
const ip = require('ip');
const versionObj = apv.getAppVersionSync().version;
let version = `${versionObj.major}.${versionObj.minor}.${versionObj.patch}`;

const myArgs = process.argv.slice(2);
let env = 'prod';
if(myArgs.length>0){
    if(myArgs[0]==="debug"){
        env = "debug";
    }
}

deleteFolder('dist');
fs.mkdirSync('dist');


zipDirectory(`./dist/${env}-${version}[bs].zip`).then(()=>{
    console.log(env, 'package created');
    console.log('Output folder: dist')
});

/**
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory( out) {
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
        archive.append(JSON.stringify({version:`${env}-${version}`, type:env, host:ip.address()}), { name: 'env.json' });
        archive.directory('brightsign-dumps', 'brightsign-dumps');
        archive.directory('node_modules', 'node_modules');
        if(env === 'debug'){archive.file('bs-debug-software/BS.update.client.js', { name: 'debug.js' })}
        archive.file('autorun.brs', false);
        archive.file('bs-start.html', false);
        archive.finalize();
    });
}




function deleteFolder(path){
    const deleteFolderRecursive = function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                const curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    deleteFolderRecursive(path);
}

