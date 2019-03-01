const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
//连接数据库
function _connect(cb){
    mongoClient.connect("mongodb://127.0.0.1:27017",{useNewUrlParser : true},function(err,client){
        cb(client.db("bang"));
    });
}

//查找符合条件的一条记录
module.exports.findOne = function(coll,whereObj,cb){
    _connect(function(db){
        db.collection(coll).findOne(whereObj,cb);
    })
}

//根据id查找一条记录
module.exports.findOneById = function(coll,id,cb){
    _connect(function(db){
        db.collection(coll).findOne({
            _id : mongodb.ObjectId(id)
        },cb);
    })
}

//插入一条记录
module.exports.insertOne = function(coll,obj,cb){
    _connect(function(db){
        db.collection(coll).insertOne(obj,cb);
    });
}

//查找多条符合条件的记录
module.exports.find = function(coll,obj,cb){
    obj.whereObj = obj.whereObj || {};
    obj.sortObj = obj.sortObj || {};
    obj.limitNum = obj.limitNum || 0;
    obj.skipNum = obj.skipNum || 0;

    _connect(function(db){
        db.collection(coll).find(obj.whereObj).sort(obj.sortObj).limit(obj.limitNum).skip(obj.skipNum).toArray(cb);
    })
}

//通过指定的id删除单条记录
module.exports.deleteOneById = function(coll,id,cb){
    _connect(function(db){
        db.collection(coll).deleteOne({
            _id : mongodb.ObjectId(id),
        },cb);
    })
}

//修改信息
module.exports.updateOneById = function(coll,id,obj,cb){
    _connect(function(db){
        db.collection(coll).updateOne({
            _id : mongodb.ObjectId(id)
        },{$set:obj},cb);
    })
}

module.exports.count = function(coll,whereObj,cb){
    _connect(function(db){
        db.collection(coll).countDocuments(whereObj).then(cb);
    })
}
