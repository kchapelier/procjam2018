# Graph.ical

http://www.kchapelier.com/graph.ical/

A procedural texture authoring application developed for [PROCJAM 2018](http://www.procjam.com/).

The main objective of this project is to have a free, intuitive and efficient graph-based web application for said authoring.

## Potential use

 * Create procedural height maps for 3D applications.
 * Procedurally generate a full set of tileable textures (diffuse, normal maps, height maps, specular maps, ...) for 3D applications.
 * Generate tileable variations from a given tileable texture with very simple patch-based synthesis ([graph](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/07869fb98c5348605cd9dffd104580e5)). Works best with highdensity textures such as sand, gravels, dirt, ...
 * Generate a tileable textures from a given non-tileable texture ([graph](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/b70aef495c97e306291b35dd57d9ddb3)). Works best with highdensity textures such as sand, gravels, dirt, ...
 * Generate a normal map from a given image ([graph](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/f0e5741103160c1f7f89b8eb4a14e1a1)).
 * Combine multiple b/w maps in a single image ([graph](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/c8cc088bdca781c421666656e0ea6723))
 * Create complex custom effects to apply to images.
 * Usable as a prototyping tool for creative coding, without the coding ([example](https://twitter.com/kchplr/status/1058008232063627266), [graph](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/5a4648b643c914d676f6f62891cd2407))
 * Generate black and white maps to use in page transitions in websites ([example](https://twitter.com/kchplr/status/1061616749697744896), [graph](http://www.kchapelier.com/graph.ical/?gist=http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/be0b5de96b712fddcdf6d912078394ef)).

## More examples

 * [Examples of each noise generator nodes](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/65608b65fd726c3f77ed9522e0524a56)
 * [Custom kaleidoscope](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/69c85cb68ee4610a30548facf69e8bf9)
 * [Cartoonish shiny stones](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/b801ea0ed3443dfb1af939f80f6b435f)
 * [Cords](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/b60f7b9b3f39895ec3082dc2f82fa520)
 * [Black sea](http://www.kchapelier.com/graph.ical/?gist=https://gist.github.com/kchapelier/a5a8e30cd99307d0920cdb6826055d08), simplified port of my first [PROCJAM projet](https://github.com/kchapelier/procjam2014)

## How to use

Check the [wiki](https://github.com/kchapelier/procjam2018/wiki/Help).

## Restrictions

 * The application is only supported on Firefox and Chrome as it depends on multiple modern API not available yet on other browsers.
 * The tool only deals with square textures. There is no plan to support the generation of non square textures.
 * The tool can currently only generate textures of 1024x1024 pixels.
 * The color control are currently rather limited, gradient maps have to be provided by the user.

## How to report an issue ?

Either create an issue on Github or contact me on [Twitter](https://twitter.com/kchplr). Please provide the following information when applicable :

 * Your config (browser, browser version, os and graphic card)
 * A save of your graph
 * A screenshot of the issue (if it is a graphical bug)

## How to contribute ?

Make sure to contact me, either on [Twitter](https://twitter.com/kchplr) or through an issue on Github, so we can discuss the change(s) you'd like to make.

## History

 * **1.1.0 (2018-11-22):** [Changelog](https://github.com/kchapelier/procjam2018/wiki/Changelogs#110-2018-11-22)
 * **1.0.1 (2018-11-17):** [Changelog](https://github.com/kchapelier/procjam2018/wiki/Changelogs#101-2018-11-17)
 * **1.0.0 (2018-11-11):** First release

