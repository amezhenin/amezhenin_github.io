function profile_hist(){

    res = db.system.profile.aggregate([{$project: {'ms':{'$subtract':['$millis',{$mod:['$millis', 50]}]}}}, {$group:{_id:'$ms', sum:{$sum:1}}}, {$sort:{_id:1}}]);
    res['result'].forEach(function(i) { print(i['_id'], '\t',i['sum']); });
}

function profile_ns(){

    res = db.system.profile.aggregate([{$group:{_id:'$ns', count:{$sum:1}, avg_ms:{$avg:'$millis'}, min_ms:{$min:'$millis'}, max_ms:{$max:'$millis'}}}])
    print('ns                   min_ms              max_ms          avg_ms          count           total_ms')
    res['result'].forEach(function(i) {
        ns = i['_id'].substr(0,17);
        ns = ns + Array(20 - ns.length+1).join(" ")
        print(ns,i['min_ms'],'\t\t',i['max_ms'],'\t\t',Math.round(i['avg_ms']),'\t\t',i['count'],'\t\t',Math.round(i['count']*i['avg_ms'])); });
}

function profile_op(){

    res = db.system.profile.aggregate([{$group:{_id:'$op', count:{$sum:1}, avg_ms:{$avg:'$millis'}, min_ms:{$min:'$millis'}, max_ms:{$max:'$millis'}}}])
    print('op                   min_ms              max_ms          avg_ms          count           total_ms')
    res['result'].forEach(function(i) {
        ns = i['_id'].substr(0,17);
        ns = ns + Array(20 - ns.length+1).join(" ")
        print(ns,i['min_ms'],'\t\t',i['max_ms'],'\t\t',Math.round(i['avg_ms']),'\t\t',i['count'],'\t\t',Math.round(i['count']*i['avg_ms'])); });
}
