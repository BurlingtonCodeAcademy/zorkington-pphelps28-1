const readline = require('readline');
const chalk = require('chalk')
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}


start();
async function start() {
  //Room class, builds 'enviornment' at start of program
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
  //creates instances of Room class
  let entrance = new Room('entrance', 'The first room in the house', [], 'foyer', false, 'exit', false)
  entrance.south.locked = true
  let foyer = new Room('foyer', 'A small and dirty mudroom', ['boots', 'coin'], 'mainHall', false, 'entrance', false)
  let mainHall = new Room('mainHall', 'The Main hall! Big staircase and stuff', ['phonebook', 'phone'], 'upstairsHall', 'kitchen', 'foyer', 'lounge')
  mainHall.west.locked = true
  let upstairsHall = new Room('upstairsHall', 'The top of the stairs', ['light switch 1', 'light switch 2'], 'bedroom', false, 'mainHall', false)
  let kitchen = new Room('kitchen', 'Dusty, old kitchen full of rats and spiders', ['coin'], 'pantry', false, false, 'mainHall')
  let pantry = new Room('pantry', 'Closet with untouched, probably expired food', ['Werther\'s Originals', 'Prune Juice', 'Bran Cereal'], false, false, 'kitchen', false)
  let bedroom = new Room('bedroom', 'Scary looking bedroom with broken windows and a dead man lying in the bed', [], false, false, 'upstairsHall', false)
  let lounge = new Room('lounge', 'Room with a bar and a pool table', ['key', 'liquor', 'pool cue'], false, 'mainHall', false, false)
  //player object, mutable
  let player = {
    name: 'PlayerOne',
    currentRoom: 'entrance',
    inventory: [],
    status: ''
  }
  //answer check array (for valid options)
  let ansArray = ['north', 'east', 'south', 'west']
  let moveArr = ['north', 'east', 'south', 'west']
  //lookup table initializes the room instances
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

  prompt()
  async function prompt() {
    console.log(chalk.green('\ncurrenty in: ' + player.currentRoom))
    console.log(chalk.blue(`\n${lookUpTable[player.currentRoom].description}\n`))
    console.log(`player's inventory: ${player.inventory}`)
    console.log(lookUpTable[player.currentRoom])
    let answer = await ask('\nWhere are you going?\n');
    answer = answer.trim().toLowerCase()
    if (answer.includes('pick up')) {
      let item = answer.split('').slice(7).join('').trim()
      if (lookUpTable[player.currentRoom].inventory.includes(item)) {
        console.log(`You picked up ${item}`)
        player.inventory.push(item)
        lookUpTable[player.currentRoom].inventory = lookUpTable[player.currentRoom].inventory.filter(e => e != item)
      return prompt()
      }
      else console.log(`I don't see the ${item}`)
      return prompt()
    }
    //drop function
    if (answer.includes('drop')) {
      let item = answer.split('').slice(4).join('').trim() 
      if (player.inventory.includes(item)) {
        console.log(`You dropped ${item}`)
        lookUpTable[player.currentRoom].inventory.push(player.inventory.splice(player.inventory.indexOf(item),1)[0])
      return prompt()
      }
      else console.log(`Can't drop what you don't got Dingus`)
      return prompt()
    }
    //arr2.push(arr.splice(arr.indexOf('item),1)[0])
    else while (!ansArray.includes(answer)) {
      console.log(chalk.redBright(`\nSorry, I don't know what you mean by "${answer}"\n`))
      return prompt()
    }// check move logic to bar locked doors
    if (moveArr.includes(answer) && lookUpTable[player.currentRoom][answer].room !== false) {
      player.currentRoom = lookUpTable[player.currentRoom][answer].room
      return prompt()
    }
    return prompt()
  }
}


