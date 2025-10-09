const cup_gold = require('../../assets/cup_gold.png')
const cup_silver = require('../../assets/cup_silver.png')
const cup_bronze = require('../../assets/cup_bronze.png')
const medal = require('../../assets/medal.png')
const crown = require('../../assets/crown.png')

const titles = {
    "1653": [{
        title: "The Twelve League I Champion",
        img: cup_gold,
        textColor: 'gold'
    }],
    "1107": [{
        title: "The Twelve League VI Champion",
        img: cup_gold,
        textColor: 'gold'
    }],
    "235": [
        {
            title: "Lord of Sitenor Season 1",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Wastiaxus Season 3",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2603": [
        {
            title: "Lord of Sitenor Season 11",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Druggorial Season 11",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Vedrenon Season 15",
            img: crown,
            textColor: 'gold'
        }
    ],
    "3080": [{
        title: "Lord of Sitenor Season 3",
        img: crown,
        textColor: 'gold'
    }],
    "864": [{
        title: "Lord of Opherus Season 15",
        img: crown,
        textColor: 'gold'
    }],
    "1565": [{
        title: "Lord of Oceorah Season 15",
        img: crown,
        textColor: 'gold'
    }],
    "2957": [{
        title: "Lord of Sitenor Season 15",
        img: crown,
        textColor: 'gold'
    }],
    "3045": [{
        title: "Lord of Sitenor Season 14",
        img: crown,
        textColor: 'gold'
    }],
    "635": [{
        title: "Lord of Sitenor Season 13",
        img: crown,
        textColor: 'gold'
    }],
    "558": [{
        title: "Lord of Druggorial Season 13",
        img: crown,
        textColor: 'gold'
    }],
    "1386": [{
        title: "Lord of Druggorial Season 14",
        img: crown,
        textColor: 'gold'
    }],
    "1813": [
        {
            title: "Lord of Opherus Season 14",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 14",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Wastiaxus Season 14",
            img: crown,
            textColor: 'gold'
        }
    ],
    "490": [
        {
            title: "Lord of Vedrenon Season 13",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 13",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Oceorah Season 14",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2985": [{
        title: "Lord of Oceorah Season 13",
        img: crown,
        textColor: 'gold'
    }],
    "2521": [
        {
            title: "Lord of Sitenor Season 7",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 8",
            img: crown,
            textColor: 'gold'
        }
    ],
    "905": [
        {
            title: "Lord of Sitenor Season 8",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League V 10th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "531": [{
        title: "Lord of Opherus Season 10",
        img: crown,
        textColor: 'gold'
    }],
    "3083": [
        {
            title: "Lord of Bremonon Season 8",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Oceorah Season 10",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 12",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Vedrenon Season 14",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Druggorial Season 15",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2094": [
        {
            title: "Lord of Sitenor Season 2",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League IV 3rd place",
            img: cup_bronze,
            textColor: '#cd7f32'
        }
    ],
    "3081": [{
        title: "The Twelve League V 3rd place",
        img: cup_bronze,
        textColor: '#cd7f32'
    }],
    "1700": [{
        title: "The Twelve League VI 3rd place",
        img: cup_bronze,
        textColor: '#cd7f32'
    }],
    "1865": [{
        title: "Lord of Druggorial Season 1",
        img: crown,
        textColor: 'gold'
    }],
    "3075": [
        {
            title: "Lord of Druggorial Season 4",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Vedrenon Season 4",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Vedrenon Season 6",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Vedrenon Season 7",
            img: crown,
            textColor: 'gold'
        }
    ],
    "1425": [{
        title: "Lord of Druggorial Season 2",
        img: crown,
        textColor: 'gold'
    }],
    "1471": [
        {
            title: "Lord of Druggorial Season 3",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League III 6th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "1016": [
        {
            title: "Lord of Bremonon Season 1",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 5",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2755": [
        {
            title: "Lord of Bremonon Season 3",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League III 5th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "815": [
        {
            title: "Lord of Bremonon Season 2",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Opherus Season 3",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 3",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Opherus Season 4",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 4",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League III 3rd place",
            img: cup_bronze,
            textColor: '#cd7f32'
        }
    ],
    "1818": [
        {
            title: "Lord of Vedrenon Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Sitenor Season 12",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2107": [
        {
            title: "Lord of Vedrenon Season 1",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 2",
            img: crown,
            textColor: 'gold'
        }
    ],
    "226": [
        {
            title: "Lord of Vedrenon Season 2",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Oceorah Season 3",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 3",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League III 8th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "714": [{
        title: "The Twelve League III 9th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1488": [{
        title: "The Twelve League III 11th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "289": [{
        title: "The Twelve League III 12th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2028": [
        {
            title: "The Twelve League V 7th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "Lord of Opherus Season 13",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2269": [{
        title: "The Twelve League V 8th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2557": [{
        title: "The Twelve League V 9th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "143": [
        {
            title: "Lord of Vedrenon Season 3",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League III 10th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "The Twelve League V 6th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "2564": [{
        title: "Lord of Oceorah Season 1",
        img: crown,
        textColor: 'gold'
    }],
    "3069": [{
        title: "Lord of Ulidalar Season 1",
        img: crown,
        textColor: 'gold'
    }],
    "2719": [{
        title: "Lord of Ulidalar Season 9",
        img: crown,
        textColor: 'gold'
    }],
    "2312": [{
        title: "Lord of Oceorah Season 11",
        img: crown,
        textColor: 'gold'
    }],
    "159": [{
        title: "Lord of Opherus Season 11",
        img: crown,
        textColor: 'gold'
    }],
    "1231": [
        {
            title: "Lord of Wastiaxus Season 9",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Vedrenon Season 11",
            img: crown,
            textColor: 'gold'
        }
    ],
    "1211": [{
        title: "Lord of Ulanara Season 9",
        img: crown,
        textColor: 'gold'
    }],
    "976": [
        {
            title: "Lord of Ulidalar Season 4",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 6",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League IV 12th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "Lord of Bremonon Season 7",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2932": [
        {
            title: "Lord of Ulidalar Season 2",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League IV 10th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "2570": [
        {
            title: "Lord of Wastiaxus Season 1",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League IV 5th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "2154": [{
        title: "The Twelve League IV 4th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "224": [{
        title: "The Twelve League VI 4th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2960": [{
        title: "The Twelve League IV 4th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2421": [{
        title: "The Twelve League IV 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "3078": [
        {
            title: "Lord of Wastiaxus Season 2",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Sitenor Season 4",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Wastiaxus Season 4",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League III 4th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "Lord of Sitenor Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Druggorial Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Wastiaxus Season 6",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League IV 11th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "Lord of Wastiaxus Season 8",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Opherus Season 9",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Bremonon Season 9",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Sitenor Season 10",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Wastiaxus Season 10",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Bremonon Season 11",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League V Champion",
            img: cup_gold,
            textColor: 'gold'
        },
        {
            title: "Lord of Oceorah Season 12",
            img: crown,
            textColor: 'gold'
        }
    ],
    "488": [
        {
            title: "Lord of Opherus Season 2",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 8",
            img: crown,
            textColor: 'gold'
        }
    ],
    "1522": [
        {
            title: "Lord of Druggorial Season 10",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 10",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Wastiaxus Season 12",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Bremonon Season 13",
            img: crown,
            textColor: 'gold'
        }
    ],
    "254": [
        {
            title: "Lord of Ulanara Season 6",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Oceorah Season 7",
            img: crown,
            textColor: 'gold'
        }
    ],
    "1850": [{
        title: "Lord of Oceorah Season 6",
        img: crown,
        textColor: 'gold'
    }],
    "2528": [{
        title: "Lord of Ulanara Season 12",
        img: crown,
        textColor: 'gold'
    }],
    "1227": [{
        title: "Lord of Bremonon Season 12",
        img: crown,
        textColor: 'gold'
    }],
    "603": [{
        title: "Lord of Wastiaxus Season 11",
        img: crown,
        textColor: 'gold'
    }],
    "2928": [{
        title: "Lord of Ulanara Season 11",
        img: crown,
        textColor: 'gold'
    }],
    "644": [
        {
            title: "Lord of Ulanara Season 10",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 11",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Bremonon Season 15",
            img: crown,
            textColor: 'gold'
        }
    ],
    "752": [
        {
            title: "Lord of Bremonon Season 10",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 15",
            img: crown,
            textColor: 'gold'
        }
    ],
    "15": [{
        title: "Lord of Opherus Season 12",
        img: crown,
        textColor: 'gold'
    }],
    "529": [{
        title: "Lord of Wastiaxus Season 15",
        img: crown,
        textColor: 'gold'
    }],
    "1589": [
        {
            title: "Lord of Vedrenon Season 10",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League V 5th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "2296": [{
        title: "Lord of Druggorial Season 9",
        img: crown,
        textColor: 'gold'
    }],
    "2712": [{
        title: "Lord of Vedrenon Season 12",
        img: crown,
        textColor: 'gold'
    }],
    "1481": [{
        title: "Lord of Bremonon Season 14",
        img: crown,
        textColor: 'gold'
    }],
    "1264": [
        {
            title: "Lord of Vedrenon Season 9",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Druggorial Season 12",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 14",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 15",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2743": [{
        title: "Lord of Oceorah Season 9",
        img: crown,
        textColor: 'gold'
    }],
    "2122": [{
        title: "Lord of Opherus Season 7",
        img: crown,
        textColor: 'gold'
    }],
    "1512": [{
        title: "Lord of Vedrenon Season 8",
        img: crown,
        textColor: 'gold'
    }],
    "986": [
        {
            title: "Lord of Wastiaxus Season 13",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League VI 2nd place",
            img: cup_silver,
            textColor: '#c0c0c0'
        }
    ],
    "257": [
        {
            title: "Lord of Wastiaxus Season 7",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Druggorial Season 8",
            img: crown,
            textColor: 'gold'
        }
    ],
    "1822": [
        {
            title: "The Twelve League I 2nd place",
            img: cup_silver,
            textColor: '#c0c0c0'
        },
        {
            title: "The Twelve League II 4th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "1361": [{
        title: "The Twelve League I 3rd place",
        img: cup_bronze,
        textColor: '#cd7f32'
    }],
    "1280": [{
        title: "The Twelve League I 4th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1614": [{
        title: "The Twelve League I 5th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1520": [{
        title: "The Twelve League VI 5th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1871": [{
        title: "The Twelve League I 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1544": [{
        title: "The Twelve League VI 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "854": [{
        title: "The Twelve League I 7th place",
        img: medal,
        textColor: "#cd7f32"
    }],
    "11": [{
        title: "The Twelve League VI 7th place",
        img: medal,
        textColor: "#cd7f32"
    }],
    "137": [
        {
            title: "The Twelve League III 7th place",
            img: medal,
            textColor: "#cd7f32"
        },
        {
            title: "Lord of Bremonon Season 6",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulanara Season 7",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Oceorah Season 8",
            img: crown,
            textColor: 'gold'
        }
    ],
    "1117": [
        {
            title: "The Twelve League I 8th place",
            img: medal,
            textColor: "#cd7f32"
        },
        {
            title: "Lord of Ulanara Season 4",
            img: crown,
            textColor: 'gold'
        }
    ],
    "1443": [
        {
            title: "The Twelve League I 9th place",
            img: medal,
            textColor: "#cd7f32"
        },
        {
            title: "Lord of Oceorah Season 4",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League III Champion",
            img: cup_gold,
            textColor: 'gold'
        },
        {
            title: "The Twelve League V 12th place",
            img: medal,
            textColor: "#cd7f32"
        }
    ],
    "1379": [{
        title: "The Twelve League I 10th place",
        img: medal,
        textColor: "#cd7f32"
    }],
    "2047": [{
        title: "The Twelve League I 11th place",
        img: medal,
        textColor: "#cd7f32"
    }],
    "94": [{
        title: "The Twelve League I 12th place",
        img: medal,
        textColor: "#cd7f32"
    }],
    "1995": [
        {
            title: "The Twelve League II 12th place",
            img: medal,
            textColor: "#cd7f32"
        },
        {
            title: "Lord of Ulanara Season 1",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Oceorah Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League IV Champion",
            img: cup_gold,
            textColor: "gold"
        }
    ],
    "1391": [{
        title: "The Twelve League II 11th place",
        img: medal,
        textColor: "#cd7f32"
    }],
    "2840": [
        {
            title: "The Twelve League II 10th place",
            img: medal,
            textColor: "#cd7f32"
        },
        {
            title: "The Twelve League IV 7th place",
            img: medal,
            textColor: "#cd7f32"
        }
    ],
    "233": [{
        title: "The Twelve League II 9th place",
        img: medal,
        textColor: "#cd7f32"
    }],
    "1077": [
        {
            title: "The Twelve League II 8th place",
            img: medal,
            textColor: "#cd7f32"
        },
        {
            title: "Lord of Opherus Season 1",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Oceorah Season 2",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Opherus Season 6",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Opherus Season 8",
            img: crown,
            textColor: 'gold'
        }
    ],
    "890": [{
        title: "The Twelve League II 7th place",
        img: medal,
        textColor: "#cd7f32"
    }],
    "1313": [{
        title: "The Twelve League II 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "311": [
        {
            title: "The Twelve League II 5th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "Lord of Opherus Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Druggorial Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Sitenor Season 6",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League IV 9th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "Lord of Druggorial Season 7",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Ulidalar Season 7",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Sitenor Season 9",
            img: crown,
            textColor: 'gold'
        }
    ],
    "540": [
        {
            title: "The Twelve League II 3rd place",
            img: cup_bronze,
            textColor: '#cd7f32'
        },
        {
            title: "Lord of Ulidalar Season 13",
            img: crown,
            textColor: 'gold'
        }
    ],
    "2377": [{
        title: "The Twelve League II 2nd place",
        img: cup_silver,
        textColor: '#c0c0c0'
    }],
    "3079": [
        {
            title: "The Twelve League IV 2nd place",
            img: cup_silver,
            textColor: '#c0c0c0'
        },
        {
            title: "The Twelve League V 2nd place",
            img: cup_silver,
            textColor: '#c0c0c0'
        }
    ],
    "1726": [{
        title: "The Twelve League III 2nd place",
        img: cup_silver,
        textColor: '#c0c0c0'
    }],
    "765": [{
        title: "The Twelve League II Champion",
        img: cup_gold,
        textColor: 'gold'
    }],
    "1269": [{
        title: "The Apprentice League I Champion",
        img: cup_gold,
        textColor: 'gold'
    }],
    "709": [{
        title: "The Apprentice League IV Champion",
        img: cup_gold,
        textColor: 'gold'
    }],
    "45": [{
        title: "The Apprentice League V Champion",
        img: cup_gold,
        textColor: 'gold'
    }],
    "2401": [
        {
            title: "The Apprentice League II Champion",
            img: cup_gold,
            textColor: 'gold'
        },
        {
            title: "The Twelve League V 11th place",
            img: medal,
            textColor: "#cd7f32"
        }
    ],
    "526": [
        {
            title: "The Apprentice League III Champion",
            img: cup_gold,
            textColor: 'gold'
        },
        {
            title: "The Apprentice League IV 3rd place",
            img: cup_bronze,
            textColor: '#cd7f32'
        }
    ],
    "2181": [{
        title: "The Apprentice League I 2nd place",
        img: cup_silver,
        textColor: '#c0c0c0'
    }],
    "1960": [{
        title: "The Apprentice League V 2nd place",
        img: cup_silver,
        textColor: '#c0c0c0'
    }],
    "651": [{
        title: "The Apprentice League IV 2nd place",
        img: cup_silver,
        textColor: '#c0c0c0'
    }],
    "2216": [{
        title: "The Apprentice League II 2nd place",
        img: cup_silver,
        textColor: '#c0c0c0'
    }],
    "1998": [{
        title: "The Apprentice League III 2nd place",
        img: cup_silver,
        textColor: '#c0c0c0'
    }],
    "2714": [{
        title: "The Apprentice League I 3rd place",
        img: cup_bronze,
        textColor: '#cd7f32'
    }],
    "1947": [{
        title: "The Apprentice League II 3rd place",
        img: cup_bronze,
        textColor: '#cd7f32'
    }],
    "816": [{
        title: "The Apprentice League III 3rd place",
        img: cup_bronze,
        textColor: '#cd7f32'
    }],
    "13": [{
        title: "The Apprentice League V 3rd place",
        img: cup_bronze,
        textColor: '#cd7f32'
    }],
    "706": [
        {
            title: "The Apprentice League II 4th place",
            img: medal,
            textColor: '#cd7f32'
    }],
    "2358": [
        {
            title: "The Apprentice League I 4th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "Lord of Wastiaxus Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "Lord of Bremonon Season 5",
            img: crown,
            textColor: 'gold'
        },
        {
            title: "The Twelve League IV 8th place",
            img: medal,
            textColor: "#cd7f32"
        }
    ],
    "2765": [{
        title: "The Apprentice League I 5th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "718": [{
        title: "The Apprentice League V 4th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "379": [{
        title: "The Apprentice League V 5th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2727": [{
        title: "The Apprentice League V 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "738": [{
        title: "The Apprentice League V 7th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "386": [{
        title: "The Apprentice League V 8th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2695": [{
        title: "The Twelve League VI 8th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1114": [{
        title: "The Twelve League VI 9th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2670": [{
        title: "The Twelve League VI 11th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "724": [{
        title: "The Twelve League VI 12th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "268": [{
        title: "The Twelve League VI 10th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "812": [{
        title: "The Apprentice League V 9th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2482": [{
        title: "The Apprentice League V 10th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1629": [{
        title: "The Apprentice League II 5th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "6": [{
        title: "The Apprentice League III 4th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "3082": [{
        title: "The Apprentice League III 5th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1321": [{
        title: "The Apprentice League IV 5th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "105": [{
        title: "The Apprentice League II 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2548": [{
        title: "The Apprentice League IV 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "273": [{
        title: "The Apprentice League III 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2070": [{
        title: "The Apprentice League II 7th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "385": [{
        title: "The Apprentice League IV 7th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "155": [{
        title: "The Apprentice League III 7th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1222": [{
        title: "The Apprentice League III 8th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "135": [{
        title: "The Apprentice League IV 8th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1458": [
        {
            title: "The Apprentice League II 9th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "The Apprentice League III 11th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "26": [{
        title: "The Apprentice League III 9th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2121": [{
        title: "The Apprentice League IV 9th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2771": [{
        title: "The Apprentice League II 10th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "318": [{
        title: "The Apprentice League IV 10th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "2110": [{
        title: "The Apprentice League III 10th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "936": [{
        title: "The Apprentice League II 11th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "662": [{
        title: "The Apprentice League IV 11th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "927": [{
        title: "The Apprentice League II 12th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "658": [{
        title: "The Apprentice League IV 12th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "176": [{
        title: "The Apprentice League III 12th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "731": [{
        title: "The Farmers League I Champion",
        img: cup_gold,
        textColor: '#cd7f32'
    }],
    "1001": [{
        title: "The Farmers League II Champion",
        img: cup_gold,
        textColor: '#cd7f32'
    }],
    "703": [
        {
            title: "The Farmers League I 2nd place",
            img: cup_silver,
            textColor: '#c0c0c0'
        },
        {
            title: "The Farmers League II 2nd place",
            img: cup_silver,
            textColor: '#c0c0c0'
        }
    ],
    "1957": [{
        title: "The Farmers League I 3rd place",
        img: cup_bronze,
        textColor: '#cd7f32'
    }],
    "253": [{
        title: "The Farmers League I 4th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "98": [{
        title: "The Farmers League II 4th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1472": [
        {
            title: "The Farmers League I 5th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "The Farmers League II 3rd place",
            img: cup_bronze,
            textColor: '#cd7f32'
        }
    ],
    "846": [
        {
            title: "The Farmers League I 6th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "The Apprentice League II 8th place",
            img: medal,
            textColor: '#cd7f32'
        },
        {
            title: "The Apprentice League IV 4th place",
            img: medal,
            textColor: '#cd7f32'
        }
    ],
    "1699": [{
        title: "The Farmers League II 6th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1952": [{
        title: "The Farmers League II 5th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "349": [{
        title: "The Farmers League I 7th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "621": [{
        title: "The Farmers League II 7th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "690": [{
        title: "The Farmers League I 8th place",
        img: medal,
        textColor: '#cd7f32'
    }],
    "1993": [{
        title: "The Farmers League II 8th place",
        img: medal,
        textColor: '#cd7f32'
    }],
}

export default titles
