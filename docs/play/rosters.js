/* Ball Knowledge — roster pools v1 (randomized squads)
   Real players by league + decade, with canonical jersey numbers.
   v1 randomizes; hand-picking is the fast-follow. */
const ROSTERS = {
  nba: {
    "60s": {
      PG:[{n:"Oscar Robertson",num:14},{n:"Bob Cousy",num:14},{n:"K.C. Jones",num:25}],
      SG:[{n:"Jerry West",num:44},{n:"Sam Jones",num:24},{n:"Hal Greer",num:15}],
      SF:[{n:"Elgin Baylor",num:22},{n:"John Havlicek",num:17},{n:"Rick Barry",num:24}],
      PF:[{n:"Bob Pettit",num:9},{n:"Jerry Lucas",num:32},{n:"Bailey Howell",num:18}],
      C:[{n:"Bill Russell",num:6},{n:"Wilt Chamberlain",num:13},{n:"Nate Thurmond",num:42}]
    },
    "70s": {
      PG:[{n:"Walt Frazier",num:10},{n:"Nate Archibald",num:1},{n:"Jo Jo White",num:10}],
      SG:[{n:"Earl Monroe",num:15},{n:"David Thompson",num:33},{n:"Pete Maravich",num:7}],
      SF:[{n:"Julius Erving",num:6},{n:"Elvin Hayes",num:11},{n:"Bob Dandridge",num:10}],
      PF:[{n:"Dave DeBusschere",num:22},{n:"Spencer Haywood",num:24},{n:"George McGinnis",num:30}],
      C:[{n:"Kareem Abdul-Jabbar",num:33},{n:"Willis Reed",num:19},{n:"Dave Cowens",num:18}]
    },
    "80s": {
      PG:[{n:"Magic Johnson",num:32},{n:"Isiah Thomas",num:11},{n:"John Stockton",num:12}],
      SG:[{n:"Michael Jordan",num:23},{n:"Clyde Drexler",num:22},{n:"Sidney Moncrief",num:4}],
      SF:[{n:"Larry Bird",num:33},{n:"Dominique Wilkins",num:21},{n:"James Worthy",num:42}],
      PF:[{n:"Charles Barkley",num:34},{n:"Kevin McHale",num:32},{n:"Karl Malone",num:32}],
      C:[{n:"Hakeem Olajuwon",num:34},{n:"Patrick Ewing",num:33},{n:"Robert Parish",num:0}]
    },
    "90s": {
      PG:[{n:"Gary Payton",num:20},{n:"Penny Hardaway",num:1},{n:"Tim Hardaway",num:10}],
      SG:[{n:"Michael Jordan",num:23},{n:"Reggie Miller",num:31},{n:"Clyde Drexler",num:22}],
      SF:[{n:"Scottie Pippen",num:33},{n:"Grant Hill",num:33},{n:"Glen Rice",num:41}],
      PF:[{n:"Karl Malone",num:32},{n:"Dennis Rodman",num:91},{n:"Tim Duncan",num:21}],
      C:[{n:"Shaquille O'Neal",num:32},{n:"Hakeem Olajuwon",num:34},{n:"David Robinson",num:50}]
    },
    "00s": {
      PG:[{n:"Steve Nash",num:13},{n:"Jason Kidd",num:5},{n:"Allen Iverson",num:3}],
      SG:[{n:"Kobe Bryant",num:8},{n:"Dwyane Wade",num:3},{n:"Vince Carter",num:15}],
      SF:[{n:"LeBron James",num:23},{n:"Carmelo Anthony",num:15},{n:"Paul Pierce",num:34}],
      PF:[{n:"Tim Duncan",num:21},{n:"Kevin Garnett",num:21},{n:"Dirk Nowitzki",num:41}],
      C:[{n:"Shaquille O'Neal",num:34},{n:"Yao Ming",num:11},{n:"Dwight Howard",num:12}]
    },
    "10s": {
      PG:[{n:"Stephen Curry",num:30},{n:"Chris Paul",num:3},{n:"Russell Westbrook",num:0}],
      SG:[{n:"James Harden",num:13},{n:"Klay Thompson",num:11},{n:"DeMar DeRozan",num:10}],
      SF:[{n:"LeBron James",num:23},{n:"Kevin Durant",num:35},{n:"Kawhi Leonard",num:2}],
      PF:[{n:"Anthony Davis",num:23},{n:"Blake Griffin",num:32},{n:"Draymond Green",num:23}],
      C:[{n:"Marc Gasol",num:33},{n:"Joel Embiid",num:21},{n:"Rudy Gobert",num:27}]
    },
    "20s": {
      PG:[{n:"Luka Doncic",num:77},{n:"Ja Morant",num:12},{n:"Shai Gilgeous-Alexander",num:2}],
      SG:[{n:"Devin Booker",num:1},{n:"Anthony Edwards",num:5},{n:"Donovan Mitchell",num:45}],
      SF:[{n:"Jayson Tatum",num:0},{n:"Jimmy Butler",num:22},{n:"Jaylen Brown",num:7}],
      PF:[{n:"Giannis Antetokounmpo",num:34},{n:"Zion Williamson",num:1},{n:"Paolo Banchero",num:5}],
      C:[{n:"Nikola Jokic",num:15},{n:"Joel Embiid",num:21},{n:"Victor Wembanyama",num:1}]
    }
  },
  wnba: {
    "00s": {
      PG:[{n:"Sue Bird",num:10},{n:"Dawn Staley",num:5},{n:"Ticha Penicheiro",num:21}],
      SG:[{n:"Cynthia Cooper",num:14},{n:"Katie Smith",num:30},{n:"Becky Hammon",num:25}],
      SF:[{n:"Sheryl Swoopes",num:22},{n:"Tamika Catchings",num:24},{n:"Chamique Holdsclaw",num:1}],
      PF:[{n:"Lisa Leslie",num:9},{n:"Tina Thompson",num:7},{n:"Yolanda Griffith",num:33}],
      C:[{n:"Margo Dydek",num:12},{n:"Lauren Jackson",num:15},{n:"Janeth Arcain",num:11}]
    },
    "10s": {
      PG:[{n:"Sue Bird",num:10},{n:"Skylar Diggins",num:4},{n:"Courtney Vandersloot",num:22}],
      SG:[{n:"Diana Taurasi",num:3},{n:"Seimone Augustus",num:33},{n:"Allie Quigley",num:14}],
      SF:[{n:"Maya Moore",num:23},{n:"Elena Delle Donne",num:11},{n:"Angel McCoughtry",num:35}],
      PF:[{n:"Candace Parker",num:3},{n:"Nneka Ogwumike",num:30},{n:"Breanna Stewart",num:30}],
      C:[{n:"Brittney Griner",num:42},{n:"Sylvia Fowles",num:34},{n:"Liz Cambage",num:8}]
    },
    "20s": {
      PG:[{n:"Caitlin Clark",num:22},{n:"Chelsea Gray",num:12},{n:"Sabrina Ionescu",num:20}],
      SG:[{n:"Kelsey Plum",num:10},{n:"Jackie Young",num:0},{n:"Arike Ogunbowale",num:24}],
      SF:[{n:"Kahleah Copper",num:2},{n:"Napheesa Collier",num:24},{n:"Satou Sabally",num:0}],
      PF:[{n:"A'ja Wilson",num:22},{n:"Alyssa Thomas",num:25},{n:"Aliyah Boston",num:7}],
      C:[{n:"Jonquel Jones",num:35},{n:"Brittney Griner",num:42},{n:"Angel Reese",num:5}]
    }
  },
  world: {
    "ANY": {
      PG:[{n:"Magic Johnson",num:15},{n:"Ricky Rubio",num:9},{n:"Steve Nash",num:7}],
      SG:[{n:"Michael Jordan",num:9},{n:"Manu Ginobili",num:5},{n:"Drazen Petrovic",num:4}],
      SF:[{n:"Larry Bird",num:7},{n:"Kevin Durant",num:5},{n:"Luka Doncic",num:77}],
      PF:[{n:"Charles Barkley",num:14},{n:"Dirk Nowitzki",num:14},{n:"Giannis Antetokounmpo",num:34}],
      C:[{n:"Patrick Ewing",num:6},{n:"Yao Ming",num:13},{n:"Pau Gasol",num:4}]
    }
  },
  big3: {
    "ANY": {
      PG:[{n:"Mario Chalmers",num:15},{n:"Nate Robinson",num:2},{n:"Jason Terry",num:31}],
      SF:[{n:"Joe Johnson",num:2},{n:"Al Harrington",num:3},{n:"Stephen Jackson",num:5},{n:"Corey Maggette",num:50}],
      C:[{n:"Amar'e Stoudemire",num:1},{n:"Jermaine O'Neal",num:7},{n:"Greg Oden",num:52},{n:"Kenyon Martin",num:4}]
    }
  }
};
