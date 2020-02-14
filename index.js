const readline = require('readline');
const chalk = require('chalk')
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
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
let entrance = new Room('entrance', 'A grand entrance with stone floors and an enormous, intricately carved door.', [], 'foyer', false, 'exit', false)
entrance.south.locked = true
entrance.south.description = `\nThe main entrance is locked.  You need to find a key\n`
let foyer = new Room('foyer', 'A small arched hallway that opens up to the rest of the mansion.', ['boots', 'coin'], 'mainHall', false, 'entrance', false)
let mainHall = new Room('mainHall', 'A giant room with cathedral ceiling, a delapidated chandelier hanging in the center and a grand staircase.', ['phonebook', 'phone'], 'upstairsHall', 'kitchen', 'foyer', 'lounge')
mainHall.west.locked = true
mainHall.west.description = `\nIt's super locked.  PERHAPS A KEY WOULD HELP\n`
let upstairsHall = new Room('upstairsHall', 'Hall at the top of the stairs leading to the bedroom', [], 'bedroom', false, 'mainHall', false)
let kitchen = new Room('kitchen', 'Dusty, old kitchen full of rats and spiders with dishes and utensils left like they were suddenly abandoned', ['coin'], 'pantry', false, false, 'mainHall')
let pantry = new Room('pantry', 'Closet with untouched, probably expired food', ['Werther\'s Originals', 'prune juice', 'Bran Cereal'], false, false, 'kitchen', false)
let bedroom = new Room('bedroom', 'Scary looking bedroom with broken windows and a corpse lying in the four-post bed in the center of the room', [], false, false, 'upstairsHall', false)
let lounge = new Room('lounge', 'A one-time classy lounge with an enormous bar, bookshelves, a fireplace and a billiards table.', ['key', 'liquor', 'pool cue'], false, 'mainHall', false, false)

///////////////////////////////////////////////////Item objects/////////////////////////////////////////////////////
let boots = new Item('boots', "A pair of boots covered in dry, cracked mud")
let coin = new Item('coin', 'A dull gold goin.  kinda spooky.')
let phonebook = new Item('phonebook', 'A phonebook (a relic from a long time ago used for short people to sit on) that appears to have a note sticking out a little')
let phone = new Item('phone', 'An old phone with a dial on the front')
let werthers = new Item('Werther\'s Originals', 'A hard, caramel candy that starts getting sent to you when you turn 60')
let pruneJuice = new Item('prune juice', 'Gross')
let corpseKey = new Item('corpse key', 'A small key')
let frontEntranceKey = new Item('front entrance key', 'A large, heavy ornate key')
let liquor = new Item('liquor', 'A dusty bottle of scotch sitting on the bar')
let poolCue = new Item('pool cue', 'A wooden pool cue leaning on the pool table')
let note = new Item('note', 'A folded piece of paper with text that reads:\nPlace the coins where he weeps\nand his soul forever sleeps')
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
  'lounge': lounge
}
//////////////////////////////////////////////////Item lookup table//////////////////////////////////////////////////
const itemLookUp = {
  'boots': boots,
  'coin': coin,
  'phonebook': phonebook,
  'phone': phone,
  'werther\'s originals': werthers,
  'prune juice': pruneJuice,
  'corpse key': corpseKey,
  'front entrance key': frontEntranceKey,
  'liquor': liquor,
  'pool cue': poolCue,
  'note': note
}

/////////////////////////////////////Reference arrays (for valid commands)///////////////////////////////////////////
let ansArray = ['north', 'east', 'south', 'west', 'inventory', 'i', 'inspect', 'commands', 'c', 'examine room']
let moveArr = ['north', 'east', 'south', 'west']
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
start();
async function start() {

  //////////////////////////////////////////Game Start////////////////////////////////////////////////////////////////
  let name = await ask("\nWhat's your name?\n")
  if (name) {
    console.log(`\nYou entered: ${name}.\n`)
    let ans = await ask('Are you sure? (y/n)')
    if (ans === 'y') {
      player.name = name
      console.log(`\nHello, ${player.name}!\ntype "c" at any time for a list of valid commands\n`)
      prompt()
    } else if (ans === 'n') {
      return start()
    } else {
      console.log(chalk.redBright('\nOk, wiseguy.\n'))
      return start()
    }
  }
  //////////////////////////////////////////////User Inputs////////////////////////////////////////////////////////////
  async function prompt() {
    console.log(chalk.green('You are currently in the ' + lookUpTable[player.currentRoom].name))
    console.log(chalk.yellowBright(lookUpTable[player.currentRoom].description))
    let answer = await ask('\nWhat do you want to do?\n');
    answer = answer.trim().toLowerCase()
    //pick up function
    if (answer.includes('pick up')) {
      let item = answer.split('').slice(7).join('').trim()
      if (lookUpTable[player.currentRoom].inventory.includes(item)) {
        console.log(`\nYou picked up ${item}\n`)
        player.inventory.push(item)
        lookUpTable[player.currentRoom].inventory = lookUpTable[player.currentRoom].inventory.filter(e => e != item)
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
      if (player.inventory.includes(item)) {
        console.log('\n' + chalk.blueBright(itemLookUp[item].description) + '\n')
      } else if (item == '') {
        console.log(chalk.redBright(`\nWait, what are you trying to inspect?\n`))
        return prompt()
      } else console.log(chalk.redBright(`\nYou can't inspect the ${item} because you don't have the ${item}\n`))
      return prompt()
    }
    //move function (checks if room is locked, or if it exists at all)
    if (moveArr.includes(answer) && lookUpTable[player.currentRoom][answer].room == false) {
      console.log(chalk.redBright(`\nSorry, you can't go ${answer}.  There's like, nothing there.\n`))
    }
    if (moveArr.includes(answer) && lookUpTable[player.currentRoom][answer].room !== false) {
      if (lookUpTable[player.currentRoom][answer].locked == true) {
        console.log(lookUpTable[player.currentRoom][answer].description)
        return prompt()
      }
      else {
        player.currentRoom = lookUpTable[player.currentRoom][answer].room
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
      console.log(chalk.yellow(`
      "north"
      "east"
      "south"
      "west"
      "pick up [item]"
      "inspect [item]" (if in inventory)
      "drop [item]"
      "use [item]"
      "inventory" or "i"
      "examine room"
      `))
    }
    //examine room function
    if (answer === "examine room") {
      if (lookUpTable[player.currentRoom].inventory.length == 0) {
        console.log(chalk.yellowBright(`\nNothing of note in the ${player.currentRoom}\n`))
        return prompt()
      }
      console.log(chalk.yellowBright(`\nWhile in the ${chalk.blueBright(lookUpTable[player.currentRoom].name)}, you see the following things of note:\n`))
      for (let i of lookUpTable[player.currentRoom].inventory) {
        console.log(`${i}\n`)
        return prompt()
      }
    }
    //throw function
    else while (!ansArray.includes(answer)) {
      console.log(chalk.redBright(`\nSorry, I don't know what you mean by "${answer}"\n`))
      return prompt()
    }// check move logic to bar locked doors
    return prompt()
  }
}


//updated room descriptions 
//unique conditionals
