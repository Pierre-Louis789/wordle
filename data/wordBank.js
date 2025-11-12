// 📚 LogicLine Word Bank
// ===========================

// Words the game will actually pick as the "target word"
const solutionWords = [
 // 5-letter
  "FRAME","CLOUD","MUSIC","LIGHT","RIVER","STORM","BRAVE","WORLD","TABLE","WATER","VESTE","CREAM","ALICE","TREAT","LOUIS","WEEKS","SICOT","PLANT","STONE","HEART","DREAM","NIGHT","SOUND","FLAME","GLASS","HOUSE","MOUSE","PLATE","QUICK","RANCH","SCALE","TOWER","UNITY","VOICE","WHEEL","YOUNG","ZEBRA","BREAD","CHAIR","DANCE","ELDER","FIELD","GRASS","HONEY","IDEAL","JELLY","KNIFE","LEMON","MAGIC","NURSE","OCEAN","PARTY","QUEEN","ROBIN","SUGAR","TREND","UNDER","VIOLET","WHISK","YEAST","ZESTY","BRICK","CANDY","DRINK","EVENT","FLOOR","GIANT","HAPPY","INPUT","JOKER","KNOCK","LADDER","MOTOR","NIGHT","OASIS","PILOT","QUOTA","RIVER","SHEEP","TABLE","ULTRA","VIRUS","WAGON","YACHT","ZONAL","APPLE","BERRY","CHART","DELTA","ENJOY","FORCE","GRACE","HUMOR","IDEAS","JUDGE","LARGE","MIGHT","OFFER","PLAIN","RIGHT","TRAIN","VALUE","YEARS", 
];

// Larger dictionary of acceptable guesses
let validGuesses = [
  ...solutionWords,
 // 5-letter extras
  "ABOUT","AFTER","AGAIN","BEACH","CRISP","GHOST","NIGHT","QUIET","SHINE","STORY",
  "THING","WHITE","YOUTH","ZONAL","ADULT","BRIEF","CHART","DRIVE","ENJOY","FORCE",
  "GRACE","HUMOR","IDEAS","JUDGE","KNOWS","LARGE","MIGHT","NURSE","OFFER","PLAIN",
  "QUICK","RIGHT","SCALE","TRAIN","UNITY","VALUE","WORLD","YEARS","ZEBRA",];

// Load external dictionary (one word per line in data/dictionary.txt)
fetch("data/dictionary.txt")
  .then(res => res.text())
  .then(text => {
    const words = text
      .split(/\r?\n/)
      .map(w => w.trim().toUpperCase())
      .filter(w => w.length >= 4 && w.length <= 6); // only keep 4–6 letter words
    validGuesses = [...new Set([...validGuesses, ...words])]; // merge + dedupe
  });