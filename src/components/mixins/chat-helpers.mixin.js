const methods = {
    uuidv4 () {
        let seed = Date.now()
        const nValues = [8, 9, 'a', 'b']
        // "xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx"
        // x is one of [0-9, a-f] M is one of [1-5], and N is [8, 9, a, or b]
        return 'xxxxxxxx-xxxx-4xxx-Nxxx-xxxxxxxxxxxx'.replace(/[xN]/g, c => {
            if (c === 'N') {
                const key = Math.round(Math.random() * 10 % 3)
                return nValues[key].toString(16)
            } else {
                seed = seed / (1 + Math.random())
                return (seed % 16 | 0).toString(16)
            }
        })
    },
    monthTsKey (offset = 0, ts = 0) {
        const date = ts ? new Date(ts) : new Date()
        let month = date.getMonth()
        let year = date.getFullYear()
        date.setDate(1)
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
        
        if (offset > 0) {
            if(month >= 11) {
                date.setMonth(0) // month = 1
                date.setFullYear(++year) // year++
            } else {
                date.setMonth(++month) // month++
            }
        } else if (offset < 0) {
            if (month <= 0) {
                date.setMonth(11) // month = 12
                date.setFullYear(--year) // year--
            } else {
                date.setMonth(--month) // month--
            }
        }

        // return '01-' + month + '-' + year
        return date.getTime()
    },
    // https://stackoverflow.com/questions/18638900/javascript-crc32
    makeCRCTable () {
        var c;
        var crcTable = [];
        for(var n =0; n < 256; n++){
            c = n;
            for(var k =0; k < 8; k++){
                c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }
        return crcTable;
    },
    d_crc32 (str) {
        var crcTable = window.crcTable || (window.crcTable = this.makeCRCTable());
        var crc = 0 ^ (-1);
    
        for (var i = 0; i < str.length; i++ ) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
        }
    
        return (crc ^ (-1)) >>> 0;
    },
    copyToClipboard (text){
        if (!navigator.clipboard) {
            let to_copy = document.createElement('textarea');
            document.body.appendChild(to_copy);
            to_copy.value = text;
            to_copy.select();
            to_copy.setSelectionRange(0, 99999); /*For mobile devices*/
            /* Copy the text inside the text field */
            document.execCommand("copy");
            to_copy.remove();
        } else {
            navigator.clipboard.writeText(text).then(
                function(){
                    // alert("yeah!"); // success 
                })
              .catch(
                 function() {
                    // alert("err"); // error
              });
        }
    },
    pickRandomAlias () {
        const places = [ "Noble Crest Stables", "Gibb's Farm", "Triple Axes Pub", "Arrowhead Inn", "Yeomen's Manor", "Bootstraps & Buckles Cobbler", "Dwarf's Gullet Tavern", "Hollowvale Village", "Thunder Hoof Stables", "Clipper's County", "Gresgo's Pond", "Hemm's Tailors", "Ditch'n'Dagger Tavern", "Twin Horses Lake Town", "Boggs Landing", "Heatherstown Village", "Trekker's Square", "Embris Hollow", "Zagoroth Mountain Town", "Padsley Village", "Sleeping Dragon Inn", "Ramoth Lye Creek", "Dragmire Drove", "Archer's Ale House", "Peeker's Valley", "Anvil & Flint Blacksmithery", "Pale Thorn Cove", "Fang Peak", "Arc of the Holy Shield Monastery", "Breggo's Beard Brewery", "Golden Stalk Granary", "Saw and Splinter's Woodshop", "Siren's Shipyard", "Silver Fin Fishery", "Addler's Drove", "Black Morrow Marshes", "Shepherd's Field", "Honeyclover Meadow", "Finch & Fox Inn", "The Warren Pub", "Fennel & Fallow Bakery", "Rose & Crown Tavern", "Knight's Motte and Bailey", "White Elk Hall", "Briar Bridge Village", "Mighty Hart Furriers", "Ekhart Bridge", "The Magpie's Market", "Thresh's Cove", "Denmarrow Mountains", "Simple Beasts Watering Hole", "Lowly Strider Almshouse", "Miss Plunkerhouse's Grand Tailors", "White Lion Halls", "Thousand Lanterns Inn", "Wild Hare Country Tavern", "Laskerville Village", "Scout's Towers", "Golden Longbow Fields", "Tuckborrow Village", "Trader's Turn Plaza", "Stoneburrow Town", "Brather's Town", "Stout Dragon Tavern", "Dueling Swords Blacksmithery", "The Braided Plait Bakery", "Mossy Stone Cove", "Fairy Winds Beach", "Old Stone Giant Mill", "Sacred Scroll Holy Monastery", "King Rothenham Square", "Brewer's Bounty Alehouse", "Oslocrest Town", "Parsca's Plaza", "Old Mayfield Farms", "Fowler's Prize Furrers", "Iron Halberd Smithy", "Dukes Valley", "Burrowing Badger Inn", "Pork Belly's Butcher Shop", "Cast Iron Almshouse", "Three Braided Beards Tavern", "King's Own Tailors", "County Arms Smithy", "Golden Rise Bakery", "Spotted Finch Meadows", "Fairy Sisters Pasture", "Twin Owls Inn", "Snow Bard Village", "DarkVale Valley", "Tallard's Orchards", "Two Moons Cove", "Star Fin Shipyard", "White Wind Mill Bakery", "Troll's Hand Masons", "Vatrecastle Village", "Archer's Arm Tavern", "Throne of the Ancient One Temple", "Swift Axes Woodcutter Shoppe", "Evenly Yoked Stables", "Open Hands Almshouse", "Far Wren Village", "Aerilon", "Aquarin", "Aramoor", "Azmar", "Begger's Hole", "Black Hollow", "Blue Field", "Briar Glen", "Brickelwhyte", "Broken Shield", "Boatwright", "Bullmar", "Carran", "City of Fire", "Coalfell", "Cullfield", "Darkwell", "Deathfall", "Doonatel", "Dry Gulch", "Easthaven", "Ecrin", "Erast", "Far Water", "Firebend", "Fool's March", "Frostford", "Goldcrest", "Goldenleaf", "Greenflower", "Garen's Well", "Haran", "Hillfar", "Hogsfeet", "Hollyhead", "Hull", "Hwen", "Icemeet", "Ironforge", "Irragin", "Jarren's Outpost", "Jongvale", "Kara's Vale", "Knife's Edge", "Lakeshore", "Leeside", "Lullin", "Marren's Eve", "Millstone", "Moonbright", "Mountmend", "Nearon", "New Cresthill", "Northpass", "Nuxvar", "Oakheart", "Oar's Rest", "Old Ashton", "Orrinshire", "Ozryn", "Pavv", "Pella's Wish", "Pinnella Pass", "Pran", "Quan Ma", "Queenstown", "Ramshorn", "Red Hawk", "Rivermouth", "Saker Keep", "Seameet", "Ship's Haven", "Silverkeep", "South Warren", "Snake's Canyon", "Snowmelt", "Squall's End", "Swordbreak", "Tarrin", "Three Streams", "Trudid", "Ubbin Falls", "Ula'ree", "Veritas", "Violl's Garden", "Wavemeet", "Whiteridge", "Willowdale", "Windrip", "Wintervale", "Wellspring", "Westwend", "Wolfden", "Xan's Bequest", "Xynnar", "Yarrin", "Yellowseed", "Zao Ying", "Zeffari", "Zumka", "Ukkhilgar", "Nargathur", "Zigunal", "Gatharbar", "Kharbunul", "Tumunzar", "Narakzinb", "Sharamunz", "Badabar", "Shurazig" ]
        let index = Math.floor(Math.random() * places.length)
        return places[index]
    }
}

export default {
    methods
}