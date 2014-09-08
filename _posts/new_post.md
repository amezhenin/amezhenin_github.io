---
layout: post
title: "Избранные ссылки #8"
description: ""
category: favorite
tags: [избранное, favorite]
published: false
---
{% include JB/setup %}

http://joshslauson.com/blog/how-to-install-sense-chrome-extension-from-source/

http://docs.scala-lang.org/overviews/collections/performance-characteristics.html


object Test {
  val a = 2 :: "bar" :: 3.14 :: List(1,2,3) :: Nil

  def m(x: Any): String = x match {
    case _: Int => "Number"
    case _: Float => "Float"
    case _: String => "String"
    case _: List[_] => "List"
    case _ => "What is that?"
  }
  for (i <- a) yield (m(i))

}


http://blog.fogus.me/2009/03/26/baysick-a-scala-dsl-implementing-basic/
