const fs = require('fs');

deleteFolder('tmp');
deleteFolder('bs-software-app');
deleteFolder('brightsign/tmp');
deleteFolder('brightsign/bs-debug-app');
deleteFolder('dist');
deleteFolder('debug');

fs.unlink('etag', ()=>{});
fs.unlink('brightsign/etag', ()=>{});
fs.unlink('bs-debug-app.zip', ()=>{});
fs.unlink('brightsign/bs-debug-app.zip', ()=>{});
fs.mkdir('debug', ()=>{});
console.log('Finished Cleaning!')
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
