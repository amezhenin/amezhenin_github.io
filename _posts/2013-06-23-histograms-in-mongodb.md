---
layout: post
title: "Профилирование MongoDB"
description: ""
category: 
tags: [mongodb, profiling, administration]
---
{% include JB/setup %}


  <style>
   .fig {
    text-align: center; /* Выравнивание по центру */ 
    padding: 50px;
   }
  </style>
  <p class="fig"><img src="/images/falling_leaf.jpg" alt="fall" style="width: 600px;" /></p>
  


Порыскав по просторам рунета я, к своему удивлению, обнаружил большие пробелы 
в практических аспектах применения такой замечательно базе данных, как 
[MongoDB](http://www.mongodb.org/). На страницах изданий и интернет ресурсах эта
БД появляется регулярно, есть даже люди, которые давно и успеошно применяют её в смоих проектах, но статьи и советы по правктическому примерению этой базы на 
продакшене впору заносить в красную книгу. Этам постом я попытаюсь пролить свет
на профилирование MongoDB и поделюсь некоторыми набросками кода.

# Мониторинг

Проще всего начать с команд по управлению задачами: 
[db.currentOp](http://docs.mongodb.org/manual/reference/method/db.currentOp/) и
[db.killOp](http://docs.mongodb.org/manual/reference/method/db.killOp/). 

# Логирование
Логи работы системы являются еще одной возможностью проанализировать 
работу системы на предмет потенциальных проблем. Найти лог не сложно, в
`/etc/mongodb.conf` соответствующая настройка для этого:
    
    logpath=/var/log/mongodb/mongodb.log

Лог MongoDB хранит множество информации обо всех аспектах работы системы, но 
нас будут интересовать только некоторые записи:

    Wed Jun 26 22:02:06.197 [conn1599] insert test_db.events ninserted:1 keyUpdates:0 locks(micros) w:31 152ms
    Wed Jun 26 22:02:41.183 [conn1598] insert test_db.events ninserted:1 keyUpdates:0 locks(micros) w:33 185ms
    ...
    
Такие записи отражают обращения в БД, которые выполнялись более 100 мс. Сюда 
могут входить как команды по изменению данных(*save, insert, update*), так 
и команды по извлечению или агрегации данных(*find, aggregate, mapReduce*), 
например:

    Wed Jun 26 22:05:01.022 [conn1588] command test_db.$cmd command: { aggregate: "events", pipeline: [ ... ] } ntoreturn:1 keyUpdates:0 numYields: 109 locks(micros) r:1788726 reslen:762 921ms
    
За логами можно следить в реальном времени, если воспользоваться консольной командой `tail`:

    $ tail -f /var/log/mongodb/mongodb.log

Таким образом удобно отслеживать реакцию БД на 

# Профилирование
Для целей профилирования работы, в MongoDB существует специальная коллекция 
**system.profile**. По умолчанию профилирование запросов отключено, и никакой 
информации о работе системы не сохраняется.
MongoDB способна логировать все команды, которые приходят 


    db.help()
    db.getProfilingStatus() - returns if profiling is on and slow threshold
    db.setProfilingLevel(level,slowms) 0=off 1=slow 2=all
    
как включить
где смотреть(какой размер capped коллекции)
какая структура у документов
как сделать гистограмму
гисторграмма с разбивкой по типам операций
как подключить скрипт с js при старте консоли


http://docs.mongodb.org/manual/tutorial/manage-the-database-profiler/
http://docs.mongodb.org/manual/reference/command/profile/ 






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

теперь самое интересное: как слить два массива в один? В питоне мы бы могли написать следующее:

In [1]: x = [1, 2, 3] 
In [2]: y = ['a', 'b', 'c']  
In [3]: zip(x,y) 
Out[3]: [(1, 'a'), (2, 'b'), (3, 'c')] 

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


