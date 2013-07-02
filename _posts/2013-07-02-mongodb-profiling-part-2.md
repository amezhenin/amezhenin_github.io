---
layout: post
title: "Профилирование MongoDB. Часть 2"
description: ""
category: 
tags: [mongodb, profiling, administration]
---
{% include JB/setup %}

# дать краткое содержание статьи, о чем пойдет речь.

# ссылки на все части 

### Увеличиваем размер system.profile (Перечитать)
Выше я упоминал, что данная коллекция имеет ограничение в 1Мб. Это значение можно изменить, если вам кажется, что вам нужен больший объем лога. Сделать это можно следующим образом: так как **system.profile** является ограниченной коллекцией мы не можем извенить размер зарезервированного под неё места, но мы можем пересоздать её с другими опциями. Вот пример консольных комад:

    db.setProfilingLevel(0)    // останавливаем профилирование
    db.system.profile.drop()    // удалем коллекцию
    // создаем ограниченную коллкуцию с нужными параметрами
    db.createCollection( "system.profile", { capped: true, size:4000000 } )   
    db.setProfilingLevel(1)    // включаем профилирование назад
   
`size` в данном случае это размер в байтах.


### Продвинутые запросы

На стадии поддержки гораздо важнее видеть общую картину, чем анализировать отдельные запросы. Например, можно следить за количеством "проблемных" запросов(*count*) в интервал времени и средним временем выполнения(*avg_ms*):

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

Несмотря на то, что нет практического смысла в измерении "средней темпераруры по больнице", этот пример демострирует основную идею для постороения различных метрик. 

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

Этот пример по-сложнее: нужно посчитать гистограмму по времени выполнения запросов. В для постронения гистограммы я выбрал шаг в 50 миллисекунд. Что бы проще было группировать, я сначала получаю остаток отделеня(`$mod`) `millis` на 50, а потом вычитаю(`$subtract`) полученное значение из `millis`. В плевдокоде это просто:

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

Осталось только сгруппировать данные 
    
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



но нам интереснее увидеть это в консоли …

    ['result'].forEach(function(i) { print(i['_id'], '\t',i['sum']); });
    100 	 2981 
    150 	 536 
    200 	 44 
    250 	 10 
    300 	 12 
    350 	 7 
    400 	 1 
    450 	 2 
    500 	 3 
    550 	 2 
    600 	 1 
    650 	 5 
    700 	 1 
    750 	 3 
    800 	 3 
    850 	 3 
    900 	 1 
    1750 	 1 
    3500 	 7 
    3600 	 1 
    3650 	 2 

* общая гистограмма по времени
* как засунуть все в js файл и подключать при старте
* http://docs.mongodb.org/manual/reference/operator/comment/#op._S_comment -- комменты, что бы различать операции в профайлере 
* выложить дамп system.profile с инструкцией по восстановлению в пост для тех у кого своей нет. js+dump сохранить в репозитории



## Заключение
В статье не рассмотрены `mongostat`, `mongotop`, `explain`, [db.currentOp](http://docs.mongodb.org/manual/reference/method/db.currentOp/) и
[db.killOp](http://docs.mongodb.org/manual/reference/method/db.killOp/). 
команд по управлению задачами

#### Links
* http://docs.mongodb.org/manual/tutorial/manage-the-database-profiler/
* http://docs.mongodb.org/manual/reference/command/profile/ 
* http://jsman.ru/mongo-book/Glava-7-Proizvoditelnost-i-instrumentarij.html
