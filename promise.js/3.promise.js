function Promise(executor) {
    let self = this;
    self.value = undefined;
    self.reason = undefined;
    self.status = 'pending';
    self.onResolvedCallbacks = [];
    self.onRejectedCallbacks = [];
    function resolve(value) {
        if (self.status === 'pending') {
            self.value = value;
            self.status = 'resolved';
            self.onResolvedCallbacks.forEach(fn => fn());
        }
    }
    function reject(reason) {
        if (self.status === 'pending') {
            self.reason = reason;
            self.status = 'rejected';
            self.onRejectedCallbacks.forEach(fn => fn());
        }
    }
    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

/**
 * 
 * @param {*} promise2  then的返回值 (返回的新的promise)
 * @param {*} x  then中成功或者失败函数的返回值
 * @param {*} resolve promise2的resolve
 * @param {*} reject  promise2的reject
 */
// 所有的promise都遵循这个规范 (所有的promise可以通用)

function resolvePromise(promise2,x,resolve,reject){
    if(promise2 === x){
        return reject(new TypeError('Chaining cycle'));
    }
    let called;
    if(x!==null && (typeof x=== 'object' || typeof x === 'function')){
        try{
            let then = x.then; // 取对象上的属性 怎么能报异常呢？(这个promise不一定是自己写的 可能是别人写的 有的人会乱写)
            // x可能还是一个promise 那么就让这个promise执行即可
            // {then:{}}
            // 这里的逻辑不单单是自己的 还有别人的 别人的promise 可能既会调用成功 也会调用失败
            if(typeof then === 'function'){
                then.call(x,y=>{ // 返回promise后的成功结果
                    // 递归直到解析成普通值为止
                    if(called) return;
                    called = true;
                    resolvePromise(promise2,y,resolve,reject);
                },err=>{ // promise的失败结果
                    if(called) return;
                    called = true;
                    reject(err);
                });
            }else{
                resolve(x);
            }
        }catch(e){
            if(called) return;
            called = true;
            reject(e);
        }
    }else{ // 如果x是一个常量
        resolve(x);
    }
}
Promise.prototype.then = function (onFulfilled, onRejected) {
    // onFulfilled = typeof onFulfilled === 'function'?onFulfilled:(v)=>v;
    // onRejected = typeof onRejected === 'function'?onRejected : (e)=>{
    //     throw e;
    // }
    let self = this;
    let promise2;
    promise2 = new Promise((resolve, reject) => {
        if (self.status === 'resolved') {
            setTimeout(()=>{
                try {
                    // 当执行成功回调的时候 可能会出现异常，那就用这个异常作为promise2的错误的结果
                    let x = onFulfilled(self.value);
                    resolvePromise(promise2,x,resolve,reject);
                } catch (e) {
                    reject(e);
                }
            },0)
        }
        if (self.status === 'rejected') {
            setTimeout(()=>{
                try {
                    let x = onRejected(self.reason);
                    resolvePromise(promise2,x,resolve,reject);
                } catch (e) {
                    reject(e);
                }
            },0)
        }
        if (self.status === 'pending') {
            self.onResolvedCallbacks.push(() => {
                setTimeout(()=>{
                    try {
                        let x = onFulfilled(self.value);
                        resolvePromise(promise2,x,resolve,reject);
                    } catch (e) {
                        reject(e);
                    }
                },0)
            });
            self.onRejectedCallbacks.push(() => {
                setTimeout(()=>{
                    try {
                        let x = onRejected(self.reason);
                        resolvePromise(promise2,x,resolve,reject);
                    } catch (e) {
                        reject(e);
                    }
                },0)
            });
        }
    });
    return promise2
}
Promise.defer = Promise.deferred = function(){
    let dfd = {};
    dfd.promise = new Promise((resolve,reject)=>{
        dfd.resolve = resolve;
        dfd.reject = reject;
    })
    return dfd;
}
// npm install promises-aplus-tests -g
module.exports = Promise;