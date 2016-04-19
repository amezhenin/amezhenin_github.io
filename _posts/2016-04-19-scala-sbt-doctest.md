---
layout: post
title: "Writing doctests in Scala"
description: ""
category: scala
tags: [scala, programming]
published: true
---
{% include JB/setup %}

I was going to write this short note on [sbt-doctest](https://github.com/tkawachi/sbt-doctest) for a very long time. Python [doctest](https://docs.python.org/2/library/doctest.html)s are really handy when it comes to testing small _stateless_ function with simple input. They might not be that useful in huge projects, but I've found them ideal for testing algorithmic functions when I was solving different [CodeChef](https://www.codechef.com/) programming contests. 

I thought, that Scala should have similar tool and I was right. Installation process is trivial, just add couple of lines to `project/plugins.sbt`:


    addSbtPlugin("com.github.tkawachi" % "sbt-doctest" % "0.4.0")


   and to `build.sbt`:
   
    doctestWithDependencies := false
    
    libraryDependencies ++= Seq(
      "org.scalatest"  %% "scalatest"  % "2.2.3"  % "test",
      "org.scalacheck" %% "scalacheck" % "1.12.1" % "test"
      // And other library dependencies.
    )

and you are ready to go!

## Example

Here is [one](https://github.com/amezhenin/codechef_problems/blob/master/contests/DTCT2015/virat.scala) of many examples that I have: 

{% highlight scala %}

    /**
     * Problem: http://www.codechef.com/DTCT2015/problems/VIRAT
     * GitHub: https://github.com/amezhenin/codechef_problems
     */
    object Main {
    
      /**
       * Checkout https://github.com/amezhenin/codechef_scala_template to test your solutions with sbt-doctest
{% raw %}       * {{{
{% endraw %}       * >>> Main.alg(List(1, 5))
       * 1
       *
       * >>> Main.alg(List(1, -2, 3, -4, 5))
       * -60
       *
       * >>> Main.alg(List(-1, -5))
       * -5
       *
       * >>> Main.alg(List(22))
       * 22
       *
       * >>> Main.alg(List(2, 3, 4))
       * 2
       *
       * >>> Main.alg(List(100, 100, 100, 100, 100, 100, 100, 100, 100, -100))
       * -100000000000000000000
       *
       * }}}
       * */
      def alg(a: List[Int]):BigInt = {
    
        def sol(l: List[Int], acc: BigInt): BigInt = l match {
          case x :: xs =>
            val v = sol(xs, acc)
            val w = sol(xs, acc * x)
            if (v < w) v else w
          case _ => acc
        }
    
        val aa = a.sorted
        sol(aa.tail, aa.head)
      }
    
      def main(args : Array[String]) = {
        val n = readInt()
        val a = readLine().split(" ").map(_.toInt).toList
        val res = alg(a)
        println(res)
      }
    }
    
{% endhighlight %}


All you need to do is to map input file data from problem description into the comment to your solution as shown above. After that you can use `sbt test` command to see it you solution is working:


    $ sbt test
    [info] Loading project definition from /home/mezhenin/workspace/codechef_scala_template/project
    [info] Set current project to codechef_scala_template (in build file:/home/mezhenin/workspace/codechef_scala_template/)
    [info] Compiling 1 Scala source to /home/mezhenin/workspace/codechef_scala_template/target/scala-2.11/classes...
    [warn] there were two deprecation warnings; re-run with -deprecation for details
    [warn] one warning found
    [info] Compiling 1 Scala source to /home/mezhenin/workspace/codechef_scala_template/target/scala-2.11/test-classes...
    [info] + Main.scala.alg.example at line 10: Main.alg(List(1, 5)): OK, proved property.
    [info] + Main.scala.alg.example at line 13: Main.alg(List(1, -2, 3, -4, 5)): OK, proved property.
    [info] + Main.scala.alg.example at line 16: Main.alg(List(-1, -5)): OK, proved property.
    [info] + Main.scala.alg.example at line 19: Main.alg(List(22)): OK, proved property.
    [info] + Main.scala.alg.example at line 22: Main.alg(List(2, 3, 4)): OK, proved property.
    [info] + Main.scala.alg.example at line 25: Main.alg(List(100, 100, 100, 100, 100, 100, 100, 100, 100, - ...: OK, proved property.
    [info] ScalaTest
    [info] Run completed in 139 milliseconds.
    [info] Total number of tests run: 0
    [info] Suites: completed 0, aborted 0
    [info] Tests: succeeded 0, failed 0, canceled 0, ignored 0, pending 0
    [info] No tests were executed.
    [info] Passed: Total 6, Failed 0, Errors 0, Passed 6
    [success] Total time: 6 s, completed Apr 19, 2016 4:33:52 AM

Output should look similar to this one.