---
layout: post
title: "Профилирование MongoDB. Часть 2"
description: ""
category: mongodb
tags: [popular, mongodb, profiling, aggregation framework, devops]
---
{% include JB/setup %}

<style>
    .fig {
        #text-align: center;
        margin-bottom: 30px;
    }
    .spoiler .spoiler_title {
    color: darkblue;
    border-bottom: dotted 1px;    
    cursor: pointer;
}

.spoiler .spoiler_text {
    display: none;
}
</style>



<p class="fig">
<a href="http://www.flickr.com/photos/advancedphotonsource/5941453764/" target="_blank">

<img src="/images/advanced.jpg" alt="monitoring" style="width: 100%;" align='center'/>
</a>
</p>




В этой части я опишу несколько продвинутых способов построения запросов к профайлеру и покажу как можно автоматизировать типовые операции получения метрик о выполнении операций. Начну я с того, как можно увеличить размер лога профайлера, что бы можно было хранить историю за больший период времени.

### Увеличиваем размер system.profile

В прошлой части я упоминал, что данная коллекция имеет ограничение в 1Мб. Это значение можно изменить, если вам нужен больший объем лога. Сделать это можно следующим образом: так как **system.profile** является ограниченной коллекцией, мы не можем изменить размер зарезервированного под неё места, но мы можем пересоздать её с другими опциями. Вот пример консольных команд:

    db.setProfilingLevel(0)    // останавливаем профилирование
    db.system.profile.drop()    // удаляем коллекцию
    // создаем ограниченную коллекцию с нужными параметрами
    db.createCollection( "system.profile", { capped: true, size:4000000 } )   
    db.setProfilingLevel(1)    // включаем профилирование назад
   
`size` в данном случае это размер в байтах.


### Продвинутые запросы

На стадии поддержки гораздо важнее видеть общую картину, чем анализировать отдельные запросы. Например, можно следить за количеством "проблемных" запросов(*count*) в определенный день и средним временем выполнения(*avg_ms*):

    > db.system.profile.aggregate([{$match: {ts:{$gte:ISODate("2013-06-29T00:00:00.000Z"), $lt:ISODate("2013-06-30T00:00:00.000Z")}}}, {$group:{_id:null, count:{$sum:1}, avg_ms:{$avg:'$millis'}}}])
    {
            "result" : [
                    {
                            "_id" : null,
                            "count" : 953,
                            "avg_ms" : 141.8058761804827
                    }
            ],
            "ok" : 1
    }

*Здесь и далее я буду использовать [Aggregation Framework](http://docs.mongodb.org/manual/core/aggregation/) для написания запросов.*    

Несмотря на то, что нет практического смысла в измерении "средней температуры по больнице", этот пример демонстрирует основную идею для построения различных метрик. 

Давайте для начала сгруппируем по типам операций и добавим еще пару метрик:

    > db.system.profile.aggregate([{$match: {ts:{$gte:ISODate("2013-06-29T00:00:00.000Z"), $lt:ISODate("2013-06-30T00:00:00.000Z")}}}, {$group:{_id:'$op', count:{$sum:1}, avg_ms:{$avg:'$millis'}, min_ms:{$min:'$millis'}, max_ms:{$max:'$millis'}}}])
    {
            "result" : [
                    {
                            "_id" : "update",
                            "count" : 4,
                            "avg_ms" : 124,
                            "min_ms" : 111,
                            "max_ms" : 138
                    },
                    {
                            "_id" : "command",
                            "count" : 15,
                            "avg_ms" : 372.8,
                            "min_ms" : 212,
                            "max_ms" : 3582
                    },
                    {
                            "_id" : "insert",
                            "count" : 868,
                            "avg_ms" : 115.67396313364054,
                            "min_ms" : 100,
                            "max_ms" : 308
                    }
            ],
            "ok" : 1
    }
    
    
Вот это уже интересней, глядя на этот результат можно сделать ряд выводов: 
* основную часть времени база делает **insert** и время выполнения находится в пределах нормы
* **update** происходят редко и не вызывают осложнений
* **command** тоже происходит редко, но среди них есть тяжелые запросы. 

К сожалению, **command** это не какая-то конкретная операция, поэтому, в данном случае, придется вернуться к прошлой технике запросов:

    > db.system.profile.find({op:'command'}).sort({millis:-1}).pretty()
    ...

Можно сгруппировать данные по коллекции:

    > db.system.profile.aggregate([{$match: {ts:{$gte:ISODate("2013-06-29T00:00:00.000Z"), $lt:ISODate("2013-06-30T00:00:00.000Z")}}}, {$group:{_id:'$ns', count:{$sum:1}, avg_ms:{$avg:'$millis'}, min_ms:{$min:'$millis'}, max_ms:{$max:'$millis'}}}])
    {
    	"result" : [
    		{
    			"_id" : "test_db.media",
    			"count" : 10,
    			"avg_ms" : 125.2,
    			"min_ms" : 110,
    			"max_ms" : 143
    		},
    		{
    			"_id" : "test_db.price",
    			"count" : 62,
    			"avg_ms" : 129.67741935483872,
    			"min_ms" : 100,
    			"max_ms" : 262
    		},
    		{
    			"_id" : "test_db.$cmd",
    			"count" : 114,
    			"avg_ms" : 1034.587719298245,
    			"min_ms" : 149,
    			"max_ms" : 4741
    		},
    		{
    			"_id" : "test_db.events",
    			"count" : 3304,
    			"avg_ms" : 129.65799031477,
    			"min_ms" : 100,
    			"max_ms" : 371
    		}
    	],
    	"ok" : 1
    }

##### Гистограммы по времени выполнения запросов

Этот пример по-сложнее: нужно посчитать гистограмму по времени выполнения запросов. Для построения гистограммы я выбрал шаг в 50 миллисекунд. Что бы проще было группировать, я сначала получаю остаток от деленя(`$mod`) **millis** на 50, а потом вычитаю(`$subtract`) полученное значение из **millis**. В псевдокоде это просто:

    millis = millis - (millis % 50)

В итоге после первого шага агрегации получается следующее:

    > db.system.profile.aggregate([{$project: {'ms':{'$subtract':['$millis',{$mod:['$millis', 50]}]}}}, {$limit:5}])
    {
    	"result" : [
    		{
    			"ms" : 100
    		},
    		{
    			"ms" : 350
    		},
    		{
    			"ms" : 300
    		},
    		{
    			"ms" : 100
    		},
    		{
    			"ms" : 100
    		}
    	],
    	"ok" : 1
    }
    
*Я всегда использую `$limit` в конце pipeline'a при разработке сложных агрегаций. Это позволяет контролировать выходные данные на каждом из этапов, не перегружая консоль лишней информацией.*

Осталось только сгруппировать данные по `ms` и подсчитать количество:
    
    db.system.profile.aggregate([{$project: {'ms':{'$subtract':['$millis',{$mod:['$millis', 50]}]}}}, {$group:{_id:'$ms', sum:{$sum:1}}}, {$sort:{_id:1}}]) 
    { 
    	"result" : [ 
    		{ 
    			"_id" : 100, 
    			"sum" : 2993 
    		}, 
    		{ 
    			"_id" : 150, 
    			"sum" : 524 
    		}, 
    ...
    		{ 
    			"_id" : 3600, 
    			"sum" : 1 
    		}, 
    		{ 
    			"_id" : 3650, 
    			"sum" : 2 
    		} 
    	], 
    	"ok" : 1 
    } 

С помощью одного такого запроса мы можем быстро понять распределение запросов по времени выполнения. 

Хранить в голове этот код накладно, давайте автоматизируем процесс. Для начала, создадим файл **profile.js** и добавим в него функцию с агрегацией и форматирование вывода, вот так:
        
    {% highlight javascript %}
function profile_hist(){
    res = db.system.profile.aggregate([{$project: {'ms':{'$subtract':['$millis',{$mod:['$millis', 50]}]}}}, {$group:{_id:'$ms', sum:{$sum:1}}}, {$sort:{_id:1}}]);
    res['result'].forEach(function(i) { print(i['_id'], '\t',i['sum']); });
}
    {% endhighlight %}

Подгрузим этот файл при запуске консоли MongoDB:
    
    $ mongo [db_name] --shell profile.js

Теперь можно запустить функцию `profile_hist`:
    
    > profile_hist()
    100 	 2981 
    150 	 536 
    200 	 44 
    250 	 10 
    300 	 12 
    350 	 7 
    400 	 1 
    ... 
    900 	 1 
    1750 	 1 
    3500 	 7 
    3600 	 1 
    3650 	 2 

Аналогичным образом можно "причесать" и предыдущие два примера, дописав еще две функции в `profile.js`:
    
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

Финальную версию файла можно скачать [здесь](https://gist.github.com/amezhenin/8132687).

### Профилирование с комментариями

Начиная с версии 2.0.0 в MongoDB появилась команда [$comment](http://docs.mongodb.org/manual/reference/operator/comment/), которая позволяет добавлять комментарий к запросу:

    db.collection.find( { <query> } )._addSpecial( "$comment", <comment> )
    db.collection.find( { $query: { <query> }, $comment: <comment> } )
    
Все документы в **system.profile** для запросов с такими комментариями будут выглядеть иначе:

    > db.test_coll.find()._addSpecial("$comment", 'test comment') 
    > db.system.profile.find()
    {
        ...
        "ns" : "test.test_coll",
        "query" : { "query" : { }, "$comment" : "test comment" },
        // без $comment было бы просто: "query" : {}
        ...
    }
    
    
Я не использовал на практике подобные конструкции, но в некоторых случаях эти комментарии могут оказаться полезными. В [своем блоге](http://emptysqua.re/blog/mongo-profiling-hacks/), A. Jesse Jiryu Davis(*прим.: один из разработчиков драйвера pymongo и автор драйвера [motor](http://motor.readthedocs.org/en/stable/)*) показывает один из вариантов применения этой команды на практике.
        
### Профилирование и шардинг

В настоящее время, профилирование нельзя настроить через `mongos`:

    $ mongos
    mongos> db.setProfilingLevel(1, 100);
    { "ok" : 0, "errmsg" : "profile currently not supported via mongos" }
    
Можно настроить профилирование на каждой ноде в отдельности. К сожалению, в этом случае  также придется опрашивать профайлер каждой ноды в отдельности. Это очень не удобно,  даже если у вас 2-3 шарда. 

Решение, которое автоматизирует этот процесс, можно посмотреть [здесь](http://emptysqua.re/blog/real-time-profiling-a-mongodb-cluster/).

## Заключение
Существует множество способов выявления и устранения проблем в MongoDB, и профилирование только один из них. В статье не рассмотрены такие замечательные инструменты как [mongostat](http://docs.mongodb.org/manual/reference/program/mongostat/), [mongotop](http://docs.mongodb.org/manual/reference/program/mongotop/), [explain](http://docs.mongodb.org/manual/reference/method/cursor.explain/), [db.currentOp](http://docs.mongodb.org/manual/reference/method/db.currentOp/)+[db.killOp](http://docs.mongodb.org/manual/reference/method/db.killOp/) и [другие](http://docs.mongodb.org/manual/reference/program/). Эти команды и утилиты помогут вам лучше понять как работает ваша БД.

#### Дополнительные ссылки
* [The Little MongoDB Book. Глава 7 — Производительность и инструментарий] (http://jsman.ru/mongo-book/Glava-7-Proizvoditelnost-i-instrumentarij.html)
* [Следим за коллекцией. Tailable cursors](http://habrahabr.ru/post/173653/)

