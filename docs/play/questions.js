/* Ball Knowledge — question bank v1.1 (league-tagged)
   t: 1 easy · 2 medium · 3 hard
   l: 'nba' | 'wnba' | 'big3' | 'any' (rules/universal)
   Big3 mode also draws from the NBA pool (its players are NBA vets). */
const QUESTIONS = [
  /* ---------- ANY (rules & universal) ---------- */
  {t:1,l:"any",cat:"Origins",q:"Who invented basketball in 1891?",c:["James Naismith","Phog Allen","Amos Alonzo Stagg","Walter Camp"],a:0},
  {t:2,l:"any",cat:"Origins",q:"Basketball's first hoops were actually what object?",c:["Peach baskets","Milk crates","Barrel rings","Fishing nets"],a:0},

  /* ---------- NBA ---------- */
  {t:1,l:"nba",cat:"Dynasties",q:"Michael Jordan won six championships with which team?",c:["Chicago Bulls","Detroit Pistons","New York Knicks","Boston Celtics"],a:0},
  {t:1,l:"nba",cat:"Franchise",q:"Stephen Curry has played his entire career for which team?",c:["Golden State Warriors","Cleveland Cavaliers","Charlotte Hornets","Sacramento Kings"],a:0},
  {t:1,l:"nba",cat:"Franchise",q:"The Lakers play their home games in which city?",c:["Los Angeles","San Diego","Las Vegas","Sacramento"],a:0},
  {t:1,l:"nba",cat:"Legends",q:"What position did Shaquille O'Neal play?",c:["Center","Point guard","Small forward","Shooting guard"],a:0},
  {t:1,l:"nba",cat:"Nicknames",q:"Which superstar is known as “King James”?",c:["LeBron James","James Harden","James Worthy","Mark Jackson"],a:0},
  {t:1,l:"nba",cat:"Hardware",q:"The NBA championship trophy is named after which commissioner?",c:["Larry O'Brien","David Stern","Adam Silver","Walter Kennedy"],a:0},
  {t:2,l:"nba",cat:"History",q:"What year did the NBA introduce the 3-point line?",c:["1979","1969","1984","1992"],a:0},
  {t:2,l:"nba",cat:"Records",q:"Who is the NBA's all-time career assists leader?",c:["John Stockton","Magic Johnson","Chris Paul","Jason Kidd"],a:0},
  {t:2,l:"nba",cat:"Dynasties",q:"Which team won a record 73 games in the 2015–16 season?",c:["Golden State Warriors","San Antonio Spurs","Chicago Bulls","Cleveland Cavaliers"],a:0},
  {t:2,l:"nba",cat:"Records",q:"Who scored 100 points in a single game in 1962?",c:["Wilt Chamberlain","Bill Russell","Elgin Baylor","Jerry West"],a:0},
  {t:2,l:"nba",cat:"The Finals",q:"Who won Finals MVP in 2015?",c:["Andre Iguodala","Stephen Curry","LeBron James","Klay Thompson"],a:0},
  {t:2,l:"nba",cat:"Records",q:"Who is the NBA's all-time leader in blocked shots?",c:["Hakeem Olajuwon","Dikembe Mutombo","Kareem Abdul-Jabbar","Tim Duncan"],a:0},
  {t:2,l:"nba",cat:"Records",q:"Who passed Kareem Abdul-Jabbar as the NBA's all-time scoring leader in 2023?",c:["LeBron James","Kevin Durant","James Harden","Giannis Antetokounmpo"],a:0},
  {t:2,l:"nba",cat:"Nicknames",q:"Which player's silhouette is famously said to be “The Logo”?",c:["Jerry West","Julius Erving","Oscar Robertson","Pete Maravich"],a:0},
  {t:2,l:"nba",cat:"Records",q:"Dennis Rodman led the NBA seven straight years in what stat?",c:["Rebounds","Steals","Blocks","Technical fouls"],a:0},
  {t:2,l:"nba",cat:"Drafts",q:"Which franchise drafted Kobe Bryant in 1996 before trading him to the Lakers?",c:["Charlotte Hornets","New Jersey Nets","Vancouver Grizzlies","Philadelphia 76ers"],a:0},
  {t:3,l:"nba",cat:"The Shot",q:"Who hit “The Shot” over Craig Ehlo at the buzzer in the 1989 playoffs?",c:["Michael Jordan","Scottie Pippen","Isiah Thomas","Reggie Miller"],a:0},
  {t:3,l:"nba",cat:"The Finals",q:"How many points did Michael Jordan score in the 1997 “Flu Game”?",c:["38","45","32","50"],a:0},
  {t:3,l:"nba",cat:"Legends",q:"How many championships did Bill Russell win as a player?",c:["11","8","13","9"],a:0},
  {t:3,l:"nba",cat:"Records",q:"How many 3-pointers did Stephen Curry hit in his record 2015–16 season?",c:["402","337","286","414"],a:0},
  {t:3,l:"nba",cat:"Records",q:"The 1971–72 Lakers won how many consecutive games?",c:["33","26","44","28"],a:0},
  {t:3,l:"nba",cat:"Scoring",q:"Kobe Bryant dropped 81 points in 2006 against which team?",c:["Toronto Raptors","Dallas Mavericks","New York Knicks","Memphis Grizzlies"],a:0},

  /* ---------- WNBA ---------- */
  {t:1,l:"wnba",cat:"The W",q:"What does WNBA stand for?",c:["Women's National Basketball Association","World National Basketball Alliance","Women's New Basketball Association","World Nations Basketball Association"],a:0},
  {t:1,l:"wnba",cat:"The W",q:"Caitlin Clark was drafted #1 overall in 2024 by which team?",c:["Indiana Fever","Chicago Sky","Las Vegas Aces","New York Liberty"],a:0},
  {t:1,l:"wnba",cat:"The W",q:"A'ja Wilson stars for which WNBA team?",c:["Las Vegas Aces","Seattle Storm","Phoenix Mercury","Atlanta Dream"],a:0},
  {t:2,l:"wnba",cat:"The W",q:"The first WNBA season was played in what year?",c:["1997","1992","2000","1989"],a:0},
  {t:2,l:"wnba",cat:"The W",q:"Diana Taurasi played her entire WNBA career with which team?",c:["Phoenix Mercury","Seattle Storm","Las Vegas Aces","Connecticut Sun"],a:0},
  {t:2,l:"wnba",cat:"The W",q:"Which team won the WNBA's first four championships?",c:["Houston Comets","Los Angeles Sparks","New York Liberty","Cleveland Rockers"],a:0},
  {t:2,l:"wnba",cat:"The W",q:"Who was the first player signed to the WNBA in 1996?",c:["Sheryl Swoopes","Lisa Leslie","Rebecca Lobo","Cynthia Cooper"],a:0},
  {t:2,l:"wnba",cat:"The W",q:"Sue Bird spent her entire legendary career with which franchise?",c:["Seattle Storm","Minnesota Lynx","Washington Mystics","Chicago Sky"],a:0},
  {t:3,l:"wnba",cat:"The W",q:"Who won the WNBA's first MVP award in 1997?",c:["Cynthia Cooper","Lisa Leslie","Sheryl Swoopes","Rebecca Lobo"],a:0},
  {t:3,l:"wnba",cat:"The W",q:"Who is the WNBA's all-time leading scorer?",c:["Diana Taurasi","Tina Charles","Tamika Catchings","Maya Moore"],a:0},
  {t:3,l:"wnba",cat:"The W",q:"Who threw down the first dunk in WNBA history in 2002?",c:["Lisa Leslie","Sylvia Fowles","Candace Parker","Brittney Griner"],a:0},
  {t:3,l:"wnba",cat:"The W",q:"Who won BOTH Rookie of the Year and MVP in the same season (2008)?",c:["Candace Parker","Maya Moore","Breanna Stewart","Seimone Augustus"],a:0},

  /* ---------- WORLD / OLYMPIC ---------- */
  {t:1,l:"world",cat:"Olympics",q:"The legendary Dream Team dominated the Olympics in what year?",c:["1992","1988","1996","2000"],a:0},
  {t:1,l:"world",cat:"Olympics",q:"Which country has won the most Olympic men's basketball golds?",c:["USA","Soviet Union","Spain","Argentina"],a:0},
  {t:2,l:"world",cat:"Olympics",q:"The Dream Team debuted at the Olympics in which city?",c:["Barcelona","Atlanta","Seoul","Sydney"],a:0},
  {t:2,l:"world",cat:"World",q:"Manu Ginobili led which nation to Olympic gold in 2004?",c:["Argentina","Spain","Brazil","Italy"],a:0},
  {t:3,l:"world",cat:"Olympics",q:"Which team controversially beat the USA in the 1972 gold-medal game?",c:["Soviet Union","Yugoslavia","Brazil","Italy"],a:0},
  {t:3,l:"world",cat:"World",q:"Which country won the 2023 FIBA World Cup?",c:["Germany","USA","Serbia","France"],a:0},

  /* ---------- BIG3 ---------- */
  {t:1,l:"big3",cat:"Big3",q:"Which rapper and actor co-founded the Big3 league?",c:["Ice Cube","Snoop Dogg","Jay-Z","Master P"],a:0},
  {t:1,l:"big3",cat:"Big3",q:"Big3 games are played in what format?",c:["3-on-3 half court","5-on-5 full court","2-on-2","4-on-4"],a:0},
  {t:2,l:"big3",cat:"Big3",q:"What year did the Big3 play its first season?",c:["2017","2015","2019","2012"],a:0},
  {t:2,l:"big3",cat:"Big3",q:"The Big3 famously features a shot worth how many points?",c:["4","5","6","2 only"],a:0},
  {t:3,l:"big3",cat:"Big3",q:"Which Hall of Famer coached Tri-State in the Big3?",c:["Julius Erving","Charles Barkley","Rick Barry","George Gervin"],a:0},
  {t:3,l:"big3",cat:"Big3",q:"Big3 games are traditionally played to what winning score?",c:["50","21","100","75"],a:0}
];
