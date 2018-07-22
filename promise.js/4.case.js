let Promise = require('./4.promise');
let fs = require('fs');
function read(filePath,encoding){
    let dfd = Promise.defer()
    fs.readFile(filePath,encoding,(err,data)=>{
        if(err)dfd.reject(err);
        dfd.resolve(data);
    });
    return dfd.promise;
}
read('note.md','utf8').then(data=>{
    console.log(data);
})
// let p = new Promise((resolve,reject)=>{
//     reject(123);
// })
// p.then().then((data)=>{
//     console.log(data)
// },(err)=>{
//     console.log('err',err);
// })