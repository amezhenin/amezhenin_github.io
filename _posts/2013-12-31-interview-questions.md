---
layout: post
title: "О чем спросить питониста"
description: ""
category: python
tags: [python, interview]
published: false
---
{% include JB/setup %}
<link rel="stylesheet" href="/pygments.css"/>

Пару месяца назад я сменил работу в московском офисе на удаленную работу в [зарубежной компании](http://www.toptal.com/?ref=12369). Это был абсолютно новый для меня опыт, потому что мне еще не доводилось работать с американскими клиентами. Больше всего меня беспокоил языковой барьер, но по прошествии времени могу сказать, что навыки коммуникации быстро приобретаются при наличии практики и желания.

Подробнее об это я наверно напишу в другом посте, а сейчас я хотел бы поделиться списком понравившихся мне вопросов с собеседований в различных московских копаниях. Я отобрал самые каверзные, многие из них вызвали у меня затруднения (*наветро поэтому-то они мне и запомнились :)*), так что будем считать это работой над ошибками.

## Что такое meta-классы в Питоне и зачем они нужны?

>Metaclasses are deeper magic than 99% of users should ever worry about. If you wonder whether you need them, you don't.
>
>**- Tim Peters**

Я, пожалуй, не буду копировать *Интернеты* и просто оставлю здесь несколько ссылок (*потому что мне больно говорить об этом*) :

* Первым на помощь нам спешит **Хабр**: [Метаклассы в Python](http://habrahabr.ru/post/145835/)
* **Хабровчане** по своей старой привычке не указывают ссылки на оригиналы статьей. Вот она: [All about the metaclasses in Python!](http://freepythontips.wordpress.com/2013/09/20/all-about-the-metaclasses-in-python/)
* Очень хороша статья на PyPix: [Metaprogramming in Python](http://pypix.com/python/metaprogramming-python/), она посвежее и лучше оформленна, а в конце есть множество ссылок на другие статьи по данной теме.
* А началось все с [вопроса](http://stackoverflow.com/questions/100003/what-is-a-metaclass-in-python) на [StackOverflow](http://stackoverflow.com/)!


*Да, и не путайте meta-классы в Питоне с [классом Meta в Django](https://docs.djangoproject.com/en/dev/topics/db/models/#meta-options)...*

<img  src="/images/facepalm-pics-11.jpg" style="border:30px solid black; height: 250px;" align='center'/>

*... как это сделал я!*

## Декораторы методов и классов в Python

Декораторы - это
  от наследования
* Хабр [1](http://habrahabr.ru/post/141411/) [2](http://habrahabr.ru/post/141501/)
* Я бы отдал предпочтение [этой статье](https://www.jeffknupp.com/blog/2013/11/29/improve-your-python-decorators-explained/) *by Jeff Knupp*, если английский ваш второй язык))
* Про декораторы классов информации крайне мало, хотя они мало чем отличаются от декораторов методов и функций.

## Генераторы, итераторы и оператор yeild

* Опять же *Jeff Knupp*  написал [отличную статью](http://www.jeffknupp.com/blog/2013/04/07/improve-your-python-yield-and-generators-explained/) на эту тему. 
* Старая, но еще актуальная статья [на Хабре](http://habrahabr.ru/post/132554/). 

## \_\_slots\_\_ для экономии память

В [одном месте](http://inn.ru/) меня спросили про то, как можно съэкономить память при создании множества однотипных объектов. Как выяснилось, речь шла о переменной класса **\_\_slots\_\_**. Статей тольковых про **\_\_slots\_\_** я не встречал, потому что на практике это редко встречается.

Суть **\_\_slots\_\_** можно продемонстрировать следующим примером:

{% highlight python %}

    class Foo:
        __slots__ = ['x']
        def __init__(self, n):
            self.x = n
    
    y = Foo(1)
    print y.x  # prints "1"
    y.x = 2
    print y.x  # prints "2"
    y.z = 4    # Throws exception.
    print y.z

{% endhighlight %}

Этот массив жестко закрепляем список аттрибутов экземпляра класса, и мы не можем добавить новые в процессе использоватия. Это похволяет интерпретатору оптимизировать объем памяти занимаемый экземпляром класса. Вот что есть из доступных статей:

* [Saving 9 GB of RAM with Python’s \_\_slots\_\_](http://tech.oyster.com/save-ram-with-python-slots/)
* [Официальная документация](http://docs.python.org/2/reference/datamodel.html#slots)

Помимо **\_\_slots\_\_** есть еще [named tuples](http://docs.python.org/2/library/collections.html#collections.namedtuple). Такой подход более распространен.

## Модули threading and multiprocessing

Вопросы про потоки и процессы я слышал неоднократно, поэтому советую 
обратить на него особое внимание. Вопрос состоит из двух частей: понимание
потоком и процессов в Unix в целом и интерфейс для работы с ними в Python. 

Unix лучше изучить весь и стразу, потому что фундоментальные знания тоже очень
важны. На английском языке могу посоветовать [Linux System Programming: Talking Directly to the Kernel and C Library](http://www.amazon.com/Linux-System-Programming-Talking-Directly/dp/1449339530), эта книга имеет вменяемый объем и покрывает все основные 
аспекты.

Об интерфейсах в Python лучше читать в официальной документации:

* [16.2. threading — Higher-level threading interface](http://docs.python.org/2/library/threading.html)
* [16.6. multiprocessing — Process-based “threading” interface](http://docs.python.org/2/library/multiprocessing.html)

## В чем отличие open and fopen?

Опять вопрос из области системного прораммирования. На этот раз речь идет  *буфферизованные* и *небуфферизованные* операции с файлами. В двух словах это не описать, поэтому мой совет - читайте полноценные [книги](http://www.amazon.com/Linux-System-Programming-Talking-Directly/dp/1449339530). Хороших статей я не встечал, но наверняка они тоже есть. 

## Что такое менеджеры контекста и как ими пользоваться?

Менеджеры контекста впервые появились впервые в Python 2.5 с появлением нового ключевого слова **with** ([PEP 343](http://legacy.python.org/dev/peps/pep-0343/)). **with** можно сравнить с декоратором, который примеиеняется для блоков кода. Суть этого оператора демонстрирует [следующий пример](http://docs.python.org/2.7/library/contextlib.html):

{% highlight python %}

    from contextlib import contextmanager

    @contextmanager
    def tag(name):
        print "<%s>" % name
        yield
        print "</%s>" % name
    
    >>> with tag("h1"):
    ...    print "foo"
    ...
    <h1>
    foo
    </h1>

{% endhighlight %}

На практике очень прижылся вариант с `open` для работы с файлами:

{% highlight python %}

    with open("file.txt", "r") as fd:
        foo = rd.read()

{% highlight python %}

Сам я писал свои менеджеры контекста вмего пару раз, это не что то встречается повсеместно. Вот пара ссылок с их развернутым описанием:

* [Get with the program as contextmanager](http://jessenoller.com/blog/2009/02/03/get-with-the-program-as-contextmanager-completely-different)
* [The Python "with" Statement by Example](http://preshing.com/20110920/the-python-with-statement-by-example/)

## Какие структуры данных в питоне вы знаете и применяли на практике?

Тема про структуры данных, конечно, безграничная. В Python есть базовые
струтуры данных, типа *typle, list, dict, set*, они используются повсеместно и наверняка вы с ними знакомы. Сложность различных операция над этими стркутуравми данных можно 
посмотреть [здесь](https://wiki.python.org/moin/TimeComplexity).

Еще есть стандартная библиотека, и модуль [collections](http://docs.python.org/2/library/collections.html) в частности, там есть *deque, Counter, OrderedDict, defaultdict* и др. Ну 
и разумеется, никто не запрещает написать что-нибудь свое или стащить чужое(*GitHub вам в помощь*) :).

Если говорить о более продвинутых структурах данных, то могу порекомендовать [эту статью](http://pypix.com/python/advanced-data-structures-python/). Также, настоятельно рекомендую почитать [Кормана](http://www.ozon.ru/context/detail/id/22421471/), что бы лучше понимать откуда ноги расту. Эта книга очень популярна у **Jav**истов и **Си**шников, а вот **питон**исты её незаслуженно обходят стороной. А зря, очень хорошая книга! *...хотя местами нудная*

## Что нового в Python 3?

Версия питона 2.7 является завершаюшей и далнейшее развитие второй версии 
языка не планируется, поэтому многие компании начинают активно *присматриваться* к третьей версии. Именно *присматриваться*, потому что реально на третью версию питона перешли единицы. Сам я только пару раз использовала Python 3, причем это всегда были небольшие тестовые проекты.

В Python 3 появились [новыe струттуры данных](http://docs.python.org/3.4/library/collections.html), `print` стал функцией, `input()` убриали совсем, все строки теперь в Unicode и многое другое, но **самое важно** это то, что третья версия не имеет обратной совместимости со второй. Поэтому...

<img  src="/images/cant_simply_py3.jpg" style="border:30px solid black; height: 250px;" align='center'/>

Первым делом лучше проверить [Python 3 Wall of Superpowers](https://python3wos.appspot.com/), там находится список распространенных библиотек, которые уже портированы на Python 3. Многие уже портированы, но вот некотороные зависли в неопределенном положении. Если вы не нашли своей любимой библиотеки, то придется искать аналог.

Далее вам потредуется утилита `2to3`, что бы мигрировать код под новый синтаксис. Процесс миграии подробно описан [здесь](http://python3porting.com/). 

* Полный список изменений доступен в [официальной документации](http://docs.python.org/3.0/whatsnew/index.html)
* Видео докланд Павла Зановкина, [Миграция на Python 3](http://moscowdjango.ru/meetup/8/whats-new-python3/)
* [Знакомство с Python 3: Часть 1. Что нового в новой версии](https://www.ibm.com/developerworks/ru/library/l-python3-1/)
* Отделдьно хочется отметить модуль [asyncio](http://docs.python.org/3.4/library/asyncio.html) и оператор `yield from`, который появился в версии 3.4 
* Видеодоклад Feihong Hsu [Asynchronous I/O in Python 3 ](http://www.youtube.com/watch?v=jMgRUI7V_mk))

## Цепи маркова и машинное обучение

На собеседовании в [Mail.RU](http://mail.ru/) меня попросили написать *генератор бреда*. Для этого нужно было использовать [Цепи Маркова](http://ru.wikipedia.org/wiki/%D0%A6%D0%B5%D0%BF%D1%8C_%D0%9C%D0%B0%D1%80%D0%BA%D0%BE%D0%B2%D0%B0) N-го порядка. С проектом я успешно справился и даже выложил его в [открытый доступ](https://github.com/amezhenin/driveling). 

Это был самый запоминающий проект, ведь на каждый день интересуются твоими знаниями в машинном обучении и теории вероятности.

К питону это пункт не имеет прямого отношения, так что решайте сами, интересно вам это или нет. Тема довольно обширная и парой ссылок на статьи тут не отделаешь - нужны фундаментальные знания. 

## Протокол HTTP

Как вводная, очень хороша статья на PyPix [HTTP: The Fundamentals](http://pypix.com/tools-and-tips/http-fundamentals/), а за подробностями можно обратиться к [RFC2616](https://www.ietf.org/rfc/rfc2616.txt)*(сам я правда его так и не прочел)*


== Cracking coding interview - book