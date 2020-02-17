/////////////////////////////////////Modules/////////////////////////////////
const readline = require('readline');
const chalk = require('chalk')
const readlineInterface = readline.createInterface(process.stdin, process.stdout);
const fs = require('fs');
//////////////////////Intro and map text///////////////////////////////
const lines = fs.readFileSync('./read.txt').toString()
const mapText = fs.readFileSync('./map.txt').toString()
//////////////////////////////User Input Prompt//////////////////////////////////////////////
function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}
////////////////////////////TextWrap Function//////////////////////////////////////////////////////////////////
///////takes string as argument, creates an array of formatted lines, and iterates/logs them
//second argument accepts a string based on the chalk module's style properties
function textWrap(str, chalkStyle) {
  function readArray(array) {
    for (let line of array) {
      console.log('\n' + chalk[chalkStyle](line))
    }
    console.log('\n')
    return
  }
  let num = Math.round(process.stdout.columns * .95)
  let readArr = []
  let resetNum = num
  let targetNum = str.length
  while (readArr.join('').length <= targetNum) {
    if (str.length <= resetNum) {
      readArr.push(str)
      readArray(readArr)
    }
    while (str[num] != ' ' && str.length > num) {
      num--
    }
    readArr.push(str.slice(0, num))
    str = str.slice(num)
    num = resetNum
  }
}

///////////////////////////////////////////////////////Classes///////////////////////////////////////////
let Room = class {
  constructor(name, description, inventory, north, east, south, west) {
    this.name = name;
    this.description = description;
    this.inventory = inventory;
    this.north = {
      room: north || false,
      locked: false
    }
    this.east = {
      room: east || false,
      locked: false
    }
    this.south = {
      room: south,
      locked: false
    }
    this.west = {
      room: west,
      locked: false
    }
  }
}
let Item = class {
  constructor(name, description) {
    this.name = name;
    this.description = description
  }
}
/////////////////////////////////////////////////////Room Objects/////////////////////////////////////////
let entrance = new Room('Entrance', 'A grand entrance with stone floors and an enormous, intricately carved door.  There is a map of the house on the wall, for some reason. convenient.', ['map'], 'foyer', false, 'exit', false)
entrance.south.locked = true
entrance.south.description = `\nThe main entrance is locked.  You need to find a key\n`
let foyer = new Room('Foyer', 'A small arched hallway that opens up to the rest of the mansion.', ['boots', 'coin'], 'mainHall', false, 'entrance', false)
let mainHall = new Room('Main Hall', 'A giant room with cathedral ceiling, a delapidated chandelier hanging in the center and a grand staircase.', ['phonebook', 'phone'], 'upstairsHall', 'kitchen', 'foyer', 'lounge')
mainHall.west.locked = true
mainHall.west.description = `\nIt's super locked.  PERHAPS A KEY WOULD HELP\n`
let upstairsHall = new Room('Upstairs Hall', 'Hall at the top of the stairs leading to the bedroom', [], 'bedroom', false, 'mainHall', false)
let kitchen = new Room('Kitchen', 'Dusty, old kitchen full of rats and spiders with dishes and utensils left like they were suddenly abandoned', ['coin'], 'pantry', false, false, 'mainHall')
let pantry = new Room('Pantry', 'Closet with untouched, probably expired food', ['werther\'s originals', 'prune juice', 'bran cereal'], false, false, 'kitchen', false)
let bedroom = new Room('Bedroom', 'Scary looking bedroom with broken windows and a corpse lying in the four-post bed in the center of the room', [], false, false, 'upstairsHall', false)
let lounge = new Room('Lounge', 'A one-time classy lounge with an enormous bar, bookshelves, a fireplace and a billiards table.', ['front entrance key', 'liquor', 'pool cue'], false, 'mainHall', false, false)
let exit = new Room('Exit', 'SUCCESS! FREEDOM!! SWEET, SWEET FREEDOM!!!!', [], 'entrance', false, false, false)
///////////////////////////////////////////////////Item objects/////////////////////////////////////////////////////
let boots = new Item('boots', "A pair of boots covered in dry, cracked mud")
let coin = new Item('coin', 'A dull gold goin.  kinda spooky.')
let phonebook = new Item('phonebook', 'A phonebook (a relic from a long time ago used for short people to sit on) that appears to have a note sticking out a little\n (NOTE ADDED TO INVENTORY)')
phonebook.inspected = false
let phone = new Item('phone', 'An old phone with a dial on the front')
let werthers = new Item('werther\'s originals', 'A hard, caramel candy that starts getting sent to you when you turn 60')
let pruneJuice = new Item('prune juice', 'Gross')
let corpseKey = new Item('key', 'A small key found in the mouth of a decrepit corpse')
let frontEntranceKey = new Item('front entrance key', 'A large, heavy ornate key.  Label says, "FRONT ENTRANCE"\nCould be your ticket out of here...')
let liquor = new Item('liquor', 'A dusty bottle of scotch sitting on the bar')
let poolCue = new Item('pool cue', 'A wooden pool cue leaning on the pool table')
let note = new Item('note', 'A folded piece of paper with text that reads:\nPlace the coins where he weeps and his soul forever sleeps')
let map = new Item('map', mapText)
let branCereal = new Item('bran cereal', 'lots of stuff to keep the body happy.  and like, really regular')
//////////////////////////////////////////////////Player Object//////////////////////////////////////////////////////
let player = {
  name: 'PlayerOne',
  currentRoom: 'entrance',
  inventory: [],
  status: ''
}
//////////////////////////////////////////////////Room Look Up Table////////////////////////////////////////////
let lookUpTable = {
  'entrance': entrance,
  'foyer': foyer,
  'mainHall': mainHall,
  'upstairsHall': upstairsHall,
  'kitchen': kitchen,
  'pantry': pantry,
  'bedroom': bedroom,
  'lounge': lounge,
  'exit': exit
}
//////////////////////////////////////////////////Item lookup table//////////////////////////////////////////////////
const itemLookUp = {
  'boots': boots,
  'coin': coin,
  'phonebook': phonebook,
  'phone': phone,
  'werther\'s originals': werthers,
  'prune juice': pruneJuice,
  'key': corpseKey,
  'front entrance key': frontEntranceKey,
  'liquor': liquor,
  'pool cue': poolCue,
  'note': note,
  'map': map,
  'bran cereal': branCereal
}

/////////////////////////////////////Reference arrays (for valid commands)///////////////////////////////////////////
let ansArray = ['north', 'east', 'south', 'west', 'inventory', 'i', 'inspect', 'commands', 'c', 'look around']
let moveArr = ['north', 'east', 'south', 'west']
let coinArr = []
let count = 0
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
start();
//////////////////////////////////////////Game Start////////////////////////////////////////////////////////////////
//AskName function bars progresss until user agrees to name input
async function start() {
  askName()
  async function askName() {
    let name = await ask("\nNow then...What's your name?\n")
    if (name) {
      console.log(`\nYou entered: ${name}.\n`)
      let ans = await ask('Are you sure? (y/n)\n\n')
      ans = ans.toLowerCase()
      if (ans === 'y') {
        player.name = name
        textWrap((`Hello, ${player.name}. Now, let's begin.`), 'greenBright')
        textWrap(lines, 'yellowBright')
        prompt()
      } else if (ans === 'n') {
        return askName()
      } else {
        console.log(chalk.redBright('\nOk, wiseguy.\n'))
        return askName()
      }
    }
  }
  //////////////////////////////////////////////Gameplay////////////////////////////////////////////////////////////

  async function prompt() {
    console.log(chalk.greenBright('\rYou are currently in the ' + chalk.blueBright(lookUpTable[player.currentRoom].name)))
    textWrap('Type "c" at any time for a list of valid commands.', 'greenBright')
    textWrap((lookUpTable[player.currentRoom].description), 'yellowBright')
    let answer = await ask('\nWhat do you want to do?\n');
    answer = answer.trim().toLowerCase()
    console.clear()
    //use function
    if (answer.includes(`use`)) {
      let item = answer.split('').slice(3).join('').trim()
      if (!player.inventory.includes(item)) {
        console.log(chalk.redBright(`\nYou don't have ${item}`))
        return prompt()
      }
      if (player.inventory.includes('liquor') && item === 'liquor') {
        textWrap((`The room starts to spin`), 'blueBright')
        player.status = 'drunk'
        player.drunkcount = 0
        return prompt()
      }
      if (player.inventory.includes(item) && item === 'key' && player.currentRoom === 'mainHall') {
        mainHall.west.locked = false
        console.log(chalk.blueBright(`\nYou hear a *click*.  The door appears to be unlocked!\n`))
        return prompt()
      }
      if (player.inventory.includes(item) && item === 'coin' && player.currentRoom === 'bedroom') {
        coinArr.push('coin')
        lookUpTable[player.currentRoom].description = 'Scary looking bedroom with broken windows and a corpse with a coin on one eye lying in the four-post bed in the center of the room'
        player.inventory.splice(player.inventory.indexOf('coin'), 1)
        if (coinArr.length === 2) {
          console.log(chalk.blueBright(`You place the second coin on the corpse's remaining eye.\nIt's mouth slowly opens, revealing a key.\n`))
          lookUpTable[player.currentRoom].description = 'Scary looking bedroom with broken windows and a corpse with a coin on each eye lying in the four-post bed in the center of the room'
          lookUpTable[player.currentRoom].inventory.push('key')
          return prompt()
        }
        console.log(chalk.blueBright(`You place a coin on the corpses eye.\nYou swear you feel some breath escape it's lungs\n`))
        return prompt()
      }
      if (player.inventory.includes(item) && player.currentRoom === 'entrance' && item === 'front entrance key') {
        entrance.south.locked = false
        console.log(chalk.blueBright(`The key fits perfectly.  You turn it, and unlock the door with a satisfying *click*`))
        return prompt()
      }
    }
    //pick up function
    if (answer.includes('pick up')) {
      let item = answer.split('').slice(7).join('').trim()
      if (lookUpTable[player.currentRoom].inventory.includes(item)) {
        console.log(`\nYou picked up ${item}\n`)
        player.inventory.push(item)
        lookUpTable[player.currentRoom].inventory = lookUpTable[player.currentRoom].inventory.filter(e => e != item)
        if (!lookUpTable.entrance.inventory.includes('map')) {
          lookUpTable.entrance.description = 'A grand entrance with stone floors and an enormous, intricately carved door.'
        }
        return prompt()
      }
      else console.log(`\nI don't see the ${item}\n`)
      return prompt()
    }
    //drop function
    if (answer.includes('drop')) {
      let item = answer.split('').slice(4).join('').trim()
      if (player.inventory.includes(item)) {
        console.log(`\nYou dropped ${item}\n`)
        lookUpTable[player.currentRoom].inventory.push(player.inventory.splice(player.inventory.indexOf(item), 1)[0])
        return prompt()
      }
      else console.log(`\nCan't drop what you don't got. Dingus.\n`)
      return prompt()
    }
    // inspect function
    if (answer.includes('inspect')) {
      let item = answer.slice(7).trim()
      const regex = new RegExp(`\\b` + item + `\\b`)
      if (item === 'map' && (player.inventory.includes(item) || lookUpTable[player.currentRoom].inventory.includes(item))) {
        console.log(mapText)
        return prompt()
      }
      if (player.inventory.includes(item) && item === 'phonebook') {
        if (itemLookUp[item].inspected === false) {
          textWrap((itemLookUp[item].description), 'blueBright')
          player.inventory.push('note')
          itemLookUp[item].description = 'A phonebook(a relic from a long time ago used for short people to sit on)'
          itemLookUp[item].inspected = true
          return prompt()
        }
      }
      if (player.inventory.includes(item) || lookUpTable[player.currentRoom].inventory.includes(item)) {
        textWrap(('\n' + (itemLookUp[item].description) + '\n'), 'blueBright')
        return prompt()
      } else if (item == '') {
        console.log(chalk.redBright(`\nWait, what are you trying to inspect?\n`))
        return prompt()
      } else if (regex.test(lookUpTable[player.currentRoom].description)) {
        textWrap(`\nYou inspect the ${item}, but learn no new information from it\n`, 'blueBright')
        return prompt()
      } else {
        console.log(chalk.redBright(`\n${item}?? I don't see that...\n`))
        return prompt()
      }
    }

    //move function (checks if room is locked, or if it exists at all)
    if (moveArr.includes(answer) && lookUpTable[player.currentRoom][answer].room == false) {
      console.log(chalk.redBright(`\nSorry, you can't go ${answer}.  There's like, nothing there.\n`))
      return prompt()
    }
    if (moveArr.includes(answer) && lookUpTable[player.currentRoom][answer].room !== false) {
      //if room is locked, but it also exists
      if (lookUpTable[player.currentRoom][answer].locked == true) {
        console.log(chalk.redBright(lookUpTable[player.currentRoom][answer].description))
        return prompt()
      }
      else {
        //if you're drunk, there's a <10%  you miss your move
        if (player.status == 'drunk') {
          //random number within range
          let chance = Math.round(Math.random() * (10 - 1) + 1)
          if (chance === 1) {
            textWrap('\nThe liquor causes you to stumble into the wall, missing your mark.  Embarassing\n', 'blueBright')
            player.drunkcount++
            return prompt()
          }
          player.drunkcount++
          if (player.drunkcount >= 5) {
            console.log(`\nYour buzz has worn off.  Maybe focus on escape.`)
            player.status = ''
          }
          //sets player to new room
        }
        player.currentRoom = lookUpTable[player.currentRoom][answer].room
        count++
        //win condition
        if (player.currentRoom === 'exit') {
          console.log(chalk.cyanBright(`Fresh air greets your lungs.  You've escaped.  You're safe. For now...\nOr something, whatever.  Sorry you had to play this.`))
          console.log(`You escaped in ${count} moves`)
          console.log(`\nTHANKS, ${player.name.toUpperCase()}!!!!`)
          process.exit()
        }
        return prompt()
      }
    }
    //inventory function
    if (answer === "inventory" || answer == "i") {
      console.log(chalk.yellowBright(`\nInventory:`))
      for (let i of player.inventory) {
        console.log(chalk.yellowBright(i))
      }
      console.log('\n')
    }
    //commands function
    if (answer === "commands" || answer === "c") {
      let width = process.stdout.columns
      console.log(chalk.yellow(`
      VALID COMMANDS

      "north"
      "east"
      "south"
      "west"
      "pick up [item]"
      "inspect [item]"
      "drop [item]"
      "use [item]"
      "inventory" or "i"
      "look around"
      `))
    }
    //look around function
    if (answer === "look around") {
      if (lookUpTable[player.currentRoom].inventory.length == 0) {
        console.log(chalk.yellowBright(`\nNothing of note in the ${chalk.blueBright(lookUpTable[player.currentRoom].name)}\n`))
        return prompt()
      }
      console.log(chalk.yellowBright(`\nWhile in the ${chalk.blueBright(lookUpTable[player.currentRoom].name)}, you see the following things of note:\n`))
      for (let i of lookUpTable[player.currentRoom].inventory) {
        console.log(`${i}\n`)
      }
      return prompt()
    }
    //throw function
    else while (!ansArray.includes(answer)) {
      console.log(chalk.redBright(`\nSorry, I don't know what you mean by "${answer}"\n`))
      return prompt()
    }
    return prompt()
  }
}
// game syntax, more use conditions; things that don't develop story but are fun.
//play pool? rename items (corpse key)
// change default 'inspect' dialogue
//In room descriptions, have interactive items display in a different color
