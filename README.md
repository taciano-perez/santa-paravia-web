# Santa Paravia e Fiumaccio (Web Version)
Web Game inspired by the classic BASIC game Santa Paravia e Fiumaccio. [Play the game.](https://taciano-perez.github.io/santa-paravia-web/)

The original BASIC game for the TRS-80 was created by George Blank (1978) and published on [SoftSide Magazine](https://archive.org/details/softside-magazine-03/page/n7/mode/2up?view=theater).

This Javascript implementation is mostly based on the [C implementation by Thomas Knox](https://github.com/darkf/paravia/blob/master/paravia.c) (2000).

I have kept the game interaction mechanics, but the UI and look & feel have been redesigned. I haven't added some features to the map, namely the castle with variable size and the farmer with the plow indicating the food production level, as I felt they would be awkward in this UI and add little to the game. Please let me know if you disagre...

Thanks to [motrhelp](https://github.com/motrhelp), I've noticed that the game was unbalanced (too easy). After some hunting, I've found out that the original BASIC game represented levels of difficulty from 6 to 9, whereas the later C version uses 1 to 4. Since the difficulty level is part of the formula that calculates the nobility ranks, this was the main cause of inbalance.

[This article](https://datadrivengamer.blogspot.com/2021/05/game-255-santa-paravia-and-fiumaccio.html) discusses strategies for playing the game.

[This page](https://gamesnostalgia.com/story/166/the-fascinating-story-of-santa-paravia-and-fiumaccio) explores in detail the history of the game.

# Resources
- The open game art comes from [Nicu's Clipart Collection](http://clipart.nicubunu.ro/?gallery=rpg_map).
- The font is [Vecna](https://www.pixelsagas.com/?download=vecna) by Neale Davidson.