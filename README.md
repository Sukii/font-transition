# Font transition

This is a javascript solution to the problem posed in Stackoverflow:<br>
https://stackoverflow.com/questions/65680948/css-transition-with-fonts

For more details on this problem, see:<br>
See Chapter 13: Metafont, Metamathematics, and Metaphysics: Comments on Donald Knuth's Article "The Concept of a Meta-Font". in Douglas Hofstadter's book:
[Metamagical Themas: Questing for the essence of mind and pattern](https://www.amazon.in/Metamagical-Themas-Douglas-Hofstadter/dp/0465045669).<br>
(see also the [link](https://s3-us-west-2.amazonaws.com/visiblelanguage/pdf/V16N4_1982_E.pdf))

As no one answered this, with help from comments by Robby Cornelissen who pointed out the excellent opentype javascript library:<br>
https://github.com/opentypejs/opentype.js<br>
and another crucial hint from:<br>
https://css-tricks.com/svg-shape-morphing-works/<br>
managed to provide a preliminary answer here.<br>

It works for characters which are homeomorphic to a simple circular disc (like H, X, S, C etc.) and also ones with one hole (like O, Q, A, P, etc). It also seems to work for "B" (which has two holes) but that is just a fluke and needs to be put on a firm footing.


