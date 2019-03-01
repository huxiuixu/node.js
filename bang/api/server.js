const express=require("express");
const path=require("path");
const db=require(__dirname+"/module/db.js");
const common=require(__dirname+"/module/common.js");
const config=require(__dirname+"/module/config.js");
const app=express();
const  fs=require("fs");
const {upPic}=require("./module/upPic");//{upPic:xxx}
app.use(express.static(path.resolve(__dirname,"../manage")));//resolve文件夹的地址
app.use(express.static(path.resolve(__dirname,"./upload")));//resolve文件夹的地址
app.use(express.static(path.resolve(__dirname,"../html")));//resolve文件夹的地址
// 获得图片在数据库当中存的位  advPic year/month/picName.xxx
app.post("/adv",function (req,res) {
   upPic(req,"advPic", function (obj) {
      if (obj.ok === 1) {
         db.insertOne("advList", {
            advName:obj.params.advName,
            addTime:common.getNowTime(),
            advPic:obj.params.newPicPath,
            advHref:obj.params.advHref,
            orderBy:obj.params.orderBy/1,
            advType: obj.params.advType/1
         },function (err,results) {
            if(err)
               common.send(res);
            else
               common.send(res,1,"成功");
         })
         }else 
        common.send(res,-1,obj.msg);
   });
});
//分页
app.get("/adv",function (req,res) {
   var whereObj={};//条件//接收值
   var advType=req.query.advType/1;//接收值
   var order=req.query.order/1;//接收值
   var advName=req.query.keyWord;
   if(advType!=0){
      whereObj.advType=advType;//将你要切换搜索的值放到advType里面，再将davType放到whereObj里面
   }
   if(advName.length>0){
      whereObj.advName=new RegExp(advName);//模糊搜索
   }
console.log(req.query.keyWord);
   var sortObj={
         orderBy:-1,
         addTime:-1
   };
   if(order===1)
      sortObj={
         advType:1
      }
   else if(order===2)
      sortObj={
      advType:-1
      }
      //分页
      db.find("advList", {
         whereObj,
         sortObj
      },function (err,advList) {
         res.json({
            ok:1,
            advList,
            advTypeEnum:config.advTypeEnum//返回的数据中多了一个advTypeEnum这个对象
         })
      })
    //console.log(advTypeEnum);
   });
//删除
app.delete("/adv/:id",function (req,res) {
   db.findOneById("advList",req.params.id,function (err,advInfo) {
      // console.log(advInfo);
      fs.unlink(__dirname+"/upload/"+advInfo.advPic,function (err) {
         db.deleteOneById("advList",req.params.id,function (err,results) {
            common.send(res,1,"删除成功");
         })
      })
   })
});
//通过该方法验证是否要删除图片（是：删除，不是：不删除）
//修改图片和没有上传图片都要更新数据，封装函数的目的就是为了不更新两次数据
function upAdv(ok,id,params,cb){
   var upObj={
      advName:params.advName,
      advHref:params.advHref,
      orderBy:params.orderBy/1,
      advType:params.advType/1,
   }
   if(ok===1){//修改了图片
      db.findOneById("advList",id,function (err,advInfo) {
         fs.unlink(__dirname+"/upload/"+advInfo.advPic,function (err) {
            upObj.advPic=params.newPicPath;
            cb(upObj);
         })
      })
   }else{//没有上传图片
      cb(upObj);
   }
};
//修改(根据ID获取广告信息)
app.put("/adv/:id",function (req,res) {
   upPic(req,"advPic",function (obj) {
      if (obj.ok===3){
         common.send(res,-1,obj.msg);
      }else{
         //目的是修改内容在这里面写
         upAdv(obj.ok,req.params.id,obj.params,function (upObj) {
            db.updateOneById("advList",req.params.id,upObj,function (err) {
               //更改
               common.send(res,1,"修改成功")
            })
         })
/*         if(obj.ok===1){//修改了图片
            db.findOneById("advList",req.params.id,function (err,advInfo) {
               fs.unlink(__dirname+"/upload/"+advInfo.advPic,function (err) {
                  var upObj={
                     advName:obj.params.advName,
                     advHref:obj.params.advHref,
                     orderBy:obj.params.orderBy/1,
                     advType: obj.params.advType/1,
                     advPic:obj.params.newPicPath
                  };
                  db.updateOneById("advList",req.params.id,upObj,function (err,results) {

                  });
               })
            })
         }*/

      }
   })
});
//添加
app.get("/advInfoById",function (req,res) {
   db.findOneById("advList",req.query.id,function (err,advInfo) {
      res.json({
         ok:1,
         advInfo//返回的数据
      })
   })
});
//根据类型
app.get("/advByType",function (req,res) {
   //advType limit
   var advType=req.query.advType/1;//advType后台获取。前端接收
   var limit=req.query.limit/1;//limit后台获取。前端接收
   db.find("advList",{
      whereObj:{
         advType
      },
      limit,
      sortObj:{
         orderBy:-1,
         addTime:-1
      }
   },function (err,advList) {
      if(err){
         common.send(res);
      }else{
         res.json({
            ok:1,
            advList
         })
      }
   })
});
/*   var form=new formidable.IncomingForm();//生成一个对象，里面有设置值form.parse(req,res)
   form.uploadDir=__dirname+"/upload";//指定上传文件的存放地址
   form.keepExtensions=true;//是否保留扩展名
   form.oncoding="utf-8";
   form.parse(req,function (err,params,file) {
      //params表单中非file类型的值
      //file上传的文件
      var pic=file["advPic"];
      console.log(pic.size);
      if(pic.size<=0){
        // fs.unlink(pic.path,function (err) {
            res.json({
               ok:1,
               msg: "请选择要上传的图片"
            });
            console.log(456);
         //})
      }else{
         var imgNameArr=[".gif",".png",".jpg"];
         var index=pic.name.lastIndexOf(".");
         var keepName=pic.name.substr(index);
         if(imgNameArr.includes(keepName)){
            res.json({
               ok:1,
               msg:"成功"
            })
         }else{
            fs.unlink(pic.path,function () {
               res.json({
                  ok:1,
                  msg:"错误"
               })
           })
         }
      }
      console.log(params);
      console.log(file);
      res.end();
   });*/
app.listen(3001,function () {
   console.log("success");
});





