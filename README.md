# Font transition

This is javascript solution to the problem posed in Stackoverflow:<br>
https://stackoverflow.com/questions/65680948/css-transition-with-fonts

As no one answered this, with help from comments by Robby Cornelissen who pointed out the excellent opentype javascript library:<br>
https://github.com/opentypejs/opentype.js<br>
and another crucial hint from:<br>
https://css-tricks.com/svg-shape-morphing-works/<br>
managed to provide a preliminary answer here.<br>

It works for characters which are homeomorphic to a simple circular disc (like H, X, S, C etc.) and also ones with one hole (like O, Q, A, P, etc) .<br>
It also seems to work for "B" (which has two holes) but that is just a fluke and needs to be put on a firm footing.


