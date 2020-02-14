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
let entrance = new Room('entrance', 'The first room in the house', [], 'foyer', false, 'exit', false)
entrance.south.locked = true
entrance.south.description = `\nThe main entrance is locked.  You need to find a key\n`
let foyer = new Room('foyer', 'A small and dirty mudroom', ['boots', 'coin'], 'mainHall', false, 'entrance', false)
let mainHall = new Room('mainHall', 'The Main hall! Big staircase and stuff', ['phonebook', 'phone'], 'upstairsHall', 'kitchen', 'foyer', 'lounge')
mainHall.west.locked = true
mainHall.west.description = `\nIt's super locked.  PERHAPS A KEY WOULD HELP\n`
let upstairsHall = new Room('upstairsHall', 'The top of the stairs', [], 'bedroom', false, 'mainHall', false)
let kitchen = new Room('kitchen', 'Dusty, old kitchen full of rats and spiders', ['coin'], 'pantry', false, false, 'mainHall')
let pantry = new Room('pantry', 'Closet with untouched, probably expired food', ['Werther\'s Originals', 'Prune Juice', 'Bran Cereal'], false, false, 'kitchen', false)
let bedroom = new Room('bedroom', 'Scary looking bedroom with broken windows and a dead man lying in the bed', [], false, false, 'upstairsHall', false)
let lounge = new Room('lounge', 'Room with a bar and a pool table', ['key', 'liquor', 'pool cue'], false, 'mainHall', false, false)
///////////////////////////////////////////////////Item objects/////////////////////////////////////////////////////
let boots = new Item('boots', "A pair of boots covered in dry, cracked mud")
let coin = new Item('coin', 'a dull gold goin.  kinda spooky.')
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
}
/////////////////////////////////////Reference arrays (for valid commands)///////////////////////////////////////////
let ansArray = ['north', 'east', 'south', 'west', 'inventory', 'i', 'inspect']
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
      console.log(`\nHello, ${player.name}\n`)
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
    console.log(chalk.green('Current room: ' + player.currentRoom))
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
    //inventory function
    if (answer === "inventory" || answer == "i") {
      console.log(chalk.yellowBright(`\nInventory:`))
      for (let i of player.inventory) {
        console.log(chalk.yellowBright(i))
      }
      console.log('\n')
    }
    // inspect function
    if (answer.includes('inspect')) {
      let item = answer.slice(7).trim()
      if (player.inventory.includes(item)) {
        console.log('\n' + chalk.blueBright(itemLookUp[item].description) + '\n')
      } else console.log(chalk.redBright(`\nYou can't inspect the ${item} because you don't have the ${item}\n`))
      return prompt()
    }
    //move function (checks if room is locked)
    if (moveArr.includes(answer) && lookUpTable[player.currentRoom][answer].room !== false) {
      if (lookUpTable[player.currentRoom][answer].locked == true) {
        console.log(lookUpTable[player.currentRoom][answer].description)
        return prompt()
      } else {
        player.currentRoom = lookUpTable[player.currentRoom][answer].room
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

//locked doors
//item look up table
//item inspect function
//game logic{
//   mission: 
// inspecting phone book gives a clue: tells the player to pick up coins
//pick up 2 coins 
//turn upstairs light on
//put coins on body
//get key1
//key1 opens lounge : lounge has key2
//}
//

// block locked doors
//item lookup table
//unique triggers 
//check inventory
//inspect room