const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const baseUrl=path.resolve(__dirname,"../upload")+"/";
//获得新的图片地址
function getNewPicPath(keepName,cb){
    var nowTime = new Date();
    var year = nowTime.getFullYear();
    var month = nowTime.getMonth()+1;
    var newPicName = Date.now()+keepName;
    var newPicPath =year+"/"+month+"/"+newPicName;
    // 查看是否有年
    console.log(baseUrl);
    fs.exists(baseUrl+year,function (exists) {
        if(exists){// 包含年
            fs.exists(baseUrl+year+"/"+month,function (exists) {
                if(exists){
                    //有
                    cb(year+"/"+month+"/"+newPicName);
                }else{
                    fs.mkdir(baseUrl+year+"/"+month,function () {
                        // 有
                        cb(year+"/"+month+"/"+newPicName);
                    })
                }
            })
        }else{// 不包含年
            fs.mkdir(baseUrl+year,function (err) {
                fs.mkdir(baseUrl+year+"/"+month,function (err) {
                    // 有
                    cb(year+"/"+month+"/"+newPicName);
                })
            })
        }
    })

}


module.exports.upPic=function () {
    var form = new formidable.IncomingForm();// 生成一个对象。设置值。
    form.uploadDir = baseUrl;// 指定上传文件的存放地址。
    form.keepExtensions = true;// 是否保留扩展名
    form.encoding = "utf-8";// 指定编码格式。
    form.parse(req,function (err,params,file) {
        // params:表单当中非file的类型的值
        // file 上传的文件
        var pic = file[picName];// 获得上传文件的信息
        if(pic.size <= 0){// 判断是否上传。成立说明未上传
            fs.unlink(pic.path,function (err) {
                cb({
                    ok:2,
                    msg:"请选择你要上传的图片"
                })
            })
        }else{
            var imgNameArr =[".gif",".png",".jpg"];// 设置允许上传的图片格式
            var index = pic.name.lastIndexOf(".");
            var keepName = pic.name.substr(index);// 获取扩展名
            if(imgNameArr.includes(keepName)){// 判断扩展名是否符合咱们的规则
                getNewPicPath(keepName,function (newPicPath) {
                    fs.rename(pic.path,baseUrl+newPicPath,function (err) {
                        params.newPicPath = newPicPath;
                        cb({
                            ok:1,
                            msg:"成功",
                            params
                        })
                    })
                })
            }else {
                fs.unlink(pic.path,function () {
                    cb({
                        ok:3,
                        msg:"上传类型错误，请选择.png,.gif,.jpg"
                    })
                })
            }
        }

    })
};