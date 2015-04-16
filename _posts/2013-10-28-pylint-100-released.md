---
layout: post
title: "Pylint 1.0.0 released"
description: ""
category: python
tags: [python, eclipse, pylint]
---


<style>
    .fig {
        margin-bottom: 30px;
    }
</style>


<p class="fig">
<a href="http://www.flickr.com/photos/71491274@N08/7980590254/in/photolist-dadBrG-48njsb-amQTGL-7fCN5a-dWqNrK-dWwrZC-c7DQfJ-kYp9o-3ccJJ-eBMM2y-6pLeHf-eM7hLB-dxZYEa-8wrKHt-8irmyY-5zSBNQ-5zNjGt-2h8um5-2tEMuD-fC4MaD-fC4Quz-fCj9WY-fCj9dE-fCja1U-fC4Lea-fCj9RA-fC4N14-fCj7Xu-fCj8Wb-fC4PkP-fCj9Ch-fC4NAx-fC4Met-fC4PfR-fC4NhK-fC4LTr-fC4NNt-fC4Qai-fCj4vQ-fCj8Jh-fC4PMg-fC4Nu6-fC4Nb6-fC4MPr-fwUrY1-79EVn6-byJjx-fC4N5z-fC4Pqz-fCj6Lq-fCj8w3" target="_blank">
<img src="/images/pylint_100.jpg" style="width: 100%;" align='center'/>
</a>
</p>

*Тихо и незаметно* вышла первая стабильная версия [pylint](http://www.pylint.org/). **pylint** - это статический анализатор Python-кода, который можно интегрировать разные IDE,  например в **Eclipse**.

 Правда радость выхода новой версии, огорчается тем, что в новой версии отсутствует параметр командной строки `--include-ids`, который используется в [PyDev](http://pydev.org/). Из-за этого ломается отображение сообщений об ошибках в рабочей области Eclipse. На [Stackoverflow](http://stackoverflow.com/) эту тему уже успели обсудить [тут](http://stackoverflow.com/questions/18133264/how-do-i-get-pylint-message-ids-to-show-up-after-pylint-1-0-0) и [тут](http://stackoverflow.com/questions/18362779/pylint-1-0-0-with-pydev-eclipse-include-ids-option-no-longer-allowed-break).
 
Что бы вернуть корректоное отображение сообщений вместе с их ID, необходимо зайти в **Eclipse** в `Preferences -> PyDev -> PyLint` и добавить следующий аргумент в параметры запуска **pylint**:

    --msg-template='{msg_id}:{line:3d},{column}:{msg}'
    
Этот параметр поменяет формат вывода сообщений, на старый.