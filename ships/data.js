// Ship cards: lat/lon = real place, dlat/dlon = where the pin sits on the map (nudged so pins don't overlap)
window.SHIPS=[
 {id:'egypt',name:'Egyptian Boat',year:-2000,when:'About 4,000 years ago',place:'Egypt',lat:26,lon:32,dlat:22,dlon:34,sound:'oars',
  say:'Long, long ago in Egypt, people rowed boats on the Nile River. The very first boats were made of reeds tied together. This little wooden model was found in a tomb.'},
 {id:'viking',name:'Viking Longship',year:900,when:'About 1,100 years ago',place:'Norway',lat:61,lon:6,dlat:68,dlon:14,sound:'oars',
  say:'Vikings rowed and sailed long, skinny ships. They could cross the cold sea, and even go up shallow rivers.'},
 {id:'hokulea',name:'Polynesian Voyaging Canoe',year:1000,when:'About 1,000 years ago',place:'Hawaii',lat:20,lon:-157,dlat:8,dlon:-163,sound:'waves',
  say:'This canoe has two hulls side by side, so it is very steady. Polynesian sailors crossed the giant Pacific Ocean by watching the stars, the waves, and the birds.'},
 {id:'dhow',name:'Arab Dhow',year:1100,when:'About 900 years ago, and still today',place:'Arabia and East Africa',lat:-6,lon:39,dlat:-8,dlon:52,sound:'wind',
  say:'A dhow has a big triangle sail. Sailors waited for the seasonal winds to carry them to Africa and India, and then back home.'},
 {id:'junk',name:'Chinese Junk',year:1400,when:'About 600 years ago',place:'China',lat:22,lon:114,dlat:26,dlon:122,sound:'wind',
  say:'A junk has stiff sails with bamboo sticks, like a folding fan. Chinese sailors built huge junks long before most other countries had big ships.'},
 {id:'galleon',name:'Spanish Galleon',year:1550,when:'About 475 years ago',place:'Spain',lat:37,lon:-6,dlat:30,dlon:-30,sound:'cannon',
  say:'Galleons were big wooden ships with many sails and cannons. They carried gold and silver across the ocean.'},
 {id:'mayflower',name:'The Mayflower',year:1620,when:'In 1620, about 400 years ago',place:'England to America',lat:42,lon:-70.6,dlat:54,dlon:-56,sound:'creak',
  say:'The Mayflower carried the Pilgrims across the ocean to America. The trip took more than two months on a crowded, bumpy ship.'},
 {id:'pirate',name:'Pirate Ship',year:1715,when:'About 300 years ago',place:'The Caribbean Sea',lat:18,lon:-75,dlat:6,dlon:-72,sound:'cannon',
  say:'Pirates sailed fast ships and chased slow treasure ships. In this painting, pirates are climbing onto a galleon.'},
 {id:'clipper',name:'Clipper Ship',year:1853,when:'About 170 years ago',place:'America',lat:40.7,lon:-74,dlat:30,dlon:-60,sound:'wind',
  say:'Clipper ships were the fastest sailing ships ever. They had lots and lots of sails to catch the wind.'},
 {id:'steam',name:'Steamboat',year:1860,when:'About 165 years ago',place:'Mississippi River',lat:32,lon:-91,dlat:30,dlon:-95,sound:'steam',
  say:'A steamboat burns wood or coal to boil water. The steam turns a big paddle wheel that pushes the boat up the river. Toot toot!'},
 {id:'titanic',name:'Ocean Liner Titanic',year:1912,when:'In 1912, about 110 years ago',place:'England',lat:50.9,lon:-1.4,dlat:56,dlon:-30,sound:'liner',
  say:'The Titanic was a giant ship for people to cross the ocean. It had four tall smokestacks. On its very first trip, it hit an iceberg and sank.'},
 {id:'bb',name:'Battleship',year:1944,when:'About 80 years ago',place:'Now a museum in Hawaii',lat:21.3,lon:-157.9,dlat:28,dlon:-148,sound:'horn',
  say:'Battleships had thick steel walls and giant guns. This one, the USS Missouri, is now a museum in Hawaii that you can walk on.'},
 {id:'cv',name:'Aircraft Carrier',year:1961,when:'About 60 years ago, and still today',place:'Pacific Ocean',lat:32.7,lon:-117,dlat:24,dlon:-128,sound:'jet',
  say:'An aircraft carrier is like a floating airport. Jets take off and land on its long, flat deck.'},
 {id:'sub',name:'Submarine',year:1983,when:'About 40 years ago, and still today',place:'Atlantic Ocean',lat:30,lon:-45,dlat:10,dlon:-42,sound:'sonar',
  say:'A submarine can dive under the water. It fills tanks with water to sink down, and pushes the water out with air to come back up.'},
 {id:'ice',name:'Icebreaker',year:1999,when:'About 25 years ago, and still today',place:'The Arctic, near Alaska',lat:72,lon:-155,dlat:72,dlon:-150,sound:'ice',
  say:'An icebreaker has a super strong front. It slides up onto the ice and cracks it with its heavy weight, so other ships can follow.'},
 {id:'cont',name:'Container Ship',year:2015,when:'Today',place:'All around the world',lat:49.5,lon:0.1,dlat:44,dlon:-6,sound:'horn',
  say:'Container ships carry big metal boxes full of toys, food, and clothes. One ship can carry thousands of boxes!'}
];
window.OBJECTS=[
 {id:'apple',name:'Apple',d:.82,w:120,h:116,say:'The apple floats! It has lots of air inside.'},
 {id:'rock',name:'Rock',d:2.7,w:120,h:100,say:'The rock sinks. Rock is heavy for its size.'},
 {id:'duck',name:'Rubber duck',d:.22,w:128,h:110,say:'The duck floats high! It is hollow and full of air.'},
 {id:'key',name:'Key',d:8.5,w:130,h:114,say:'The key sinks. Metal is heavy for its size.'},
 {id:'cork',name:'Cork',d:.24,w:110,h:100,say:'The cork floats! It is full of tiny air bubbles.'},
 {id:'penny',name:'Penny',d:7.1,w:78,h:78,say:'The penny sinks. It is small, but it is heavy for its size.'},
 {id:'wood',name:'Wood',d:.6,w:110,h:110,say:'The wood floats! Wood is lighter than the same amount of water. That is why the first ships were made of wood.'},
 {id:'marble',name:'Marble',d:2.5,w:64,h:64,say:'The marble sinks. Glass is heavier than water.'},
 {id:'spoon',name:'Spoon',d:8.4,w:40,h:150,say:'The spoon sinks. Metal is heavy for its size.'}
];
// Parts-of-a-ship hotspots on assets/constitution.jpg (fractions of width/height)
window.PARTS=[
 {id:'bow',name:'Bow',x:.395,y:.785,say:'The bow is the front of the ship.'},
 {id:'stern',name:'Stern',x:.055,y:.87,say:'The stern is the back of the ship.'},
 {id:'hull',name:'Hull',x:.255,y:.885,say:'The hull is the body of the ship. It keeps the water out.'},
 {id:'mast',name:'Mast',x:.306,y:.70,say:'The mast is the tall pole that holds up the sails.'},
 {id:'sail',name:'Sail',x:.30,y:.43,say:'Sails catch the wind to push the ship along.'},
 {id:'flag',name:'Flag',x:.105,y:.668,say:'The flag shows which country the ship is from. This is the American flag.'},
 {id:'bowsprit',name:'Bowsprit',x:.56,y:.49,say:'The bowsprit is the long pole that sticks out the front.'},
 {id:'rigging',name:'Rigging',x:.46,y:.26,say:'The rigging is all the ropes. They hold up the masts and move the sails.'},
 {id:'nest',name:'Lookout',x:.307,y:.27,say:'High up the mast is a lookout spot, called a crow\u2019s nest. A sailor climbed up to look far, far away.'},
 {id:'ports',name:'Gun ports',x:.15,y:.845,say:'These little square doors are gun ports. Cannons poked out of them.'}
];
