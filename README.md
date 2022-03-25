# Realtime player vs player game

"Kill the virus"
http://socket-slayers.herokuapp.com

### Languages used:

- Node.js
- Express
- Socket.io
- MongoDB

## Table of contents

- [Assignment](#assignment)
- [Tools](#tools)
- [Printscreen](#printscreen)

## Assignment

- Create a simple 2-player realtime game where the goal is to click on a virus as quickly as possible to exterminate it, and points will be awarded to the player with the most rapid reaction time.
- The assignment must be completed in a group of 3 students

#### Basic requirements

- Use Node.js, Express, Socket.io and MongoDB
- Version control using git
- Deploy to Heroku
- Users must be allowed to fill in their username / nickname
- All calculation regardin scores should be done on the server side
- Show timer and latest reaction time and the opponent's latest reaction time
- Several games should be able to run simultaneously
- When a player connects, “Waiting for another player…” or similar message should appear. As soon as two players are connected, a round starts

#### The game must follow this structure:

1. Start game - waiting for opponent
2. Once player have joined, start the game
3. Let the server randomize an x / y position with a random delay before displaying it
4. Measure reaction time.
5. Send the results to the server who decides which player that gets points
    5.a. If 10 rounds have not been played, go to step 3
    5.b. If 10 rounds have been played, go to step 6.
6. Show points and which player that won

#### Time limit

- 1,5 week

## Tools

- VS Code
- Heroku

## Printscreen

<img src="https://github.com/juliajespersdotter/socket-slayers/blob/main/public/assets/img/screenshot-virus-start.png" width=100%>

<img src="https://github.com/juliajespersdotter/socket-slayers/blob/main/public/assets/img/screenshot-virus-game.png" width=100%>
