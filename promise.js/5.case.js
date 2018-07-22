let Promise = require('./5.promise');

// catch的实现就是基于then的 可以不传成功
Promise.reject(123).then().catch(e=>{
    console.log(e);
})

// Promise.reject(123).then().then(null,e=>{
//     console.log(e);
// })