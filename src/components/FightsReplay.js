import React, { Component } from 'react';
import { connect } from 'react-redux'
import Media from 'react-media';
import moment from 'moment'
import DotLoader from 'react-spinners/DotLoader';
import { doc, getDoc } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Rainbow from 'rainbowvis.js'
import Header from './Header'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import getName from './common/GetName'
import getAuraForElement from '../assets/gifs/AuraForElement'
import {
    setNetworkSettings,
    setNetworkUrl,
} from '../actions'
import { CTA_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID, REVEAL_CAP } from '../actions/types'

import "../css/Fight.css"

const druggorial_bg = require('../assets/bg_fights/druggorial_bg_hd.jpg')
const oceorah_bg = require('../assets/bg_fights/oceorah_bg_hd.jpg')
const sitenor_bg = require('../assets/bg_fights/sitenor_bg_hd.jpg')
const wastiaxus_bg = require('../assets/bg_fights/wastiaxus_bg_hd.jpg')
const vedrenon_bg = require('../assets/bg_fights/vedrenon_bg_hd.jpg')
const bremonon_bg = require('../assets/bg_fights/bremonon_bg_hd.jpg')
const opherus_bg = require('../assets/bg_fights/opherus_bg_hd.jpg')
const ulanara_bg = require('../assets/bg_fights/ulanara_bg_hd.jpg')
const ulidalar_bg = require('../assets/bg_fights/ulidalar_bg_hd.jpg')
const pvp_bg = require('../assets/bg_fights/pvp_bg_hd.jpg')
const arena_bg = require('../assets/bg_fights/arena_bg_hd.jpg')



class FightsReplay extends Component {
    constructor(props) {
        super(props)

        this.player1InitialHp = 0
        this.player2InitialHp = 0

        this.hp1bar = undefined
        this.hp2bar = undefined

        this.indexShow = 0
        this.turnTimeout = undefined

        this.history = []

        this.state = {
            loading: true,
            historyShow: [],
            winner: undefined,
            isEnd: false,
            showOnlyOne: false,
            fightInfo: {}
        }

        this.player1 = {}
		this.player2 = {}
    }

    async componentDidMount() {
        document.title = "Fight Replay - Wizards Arena"

        setTimeout(() => {
            this.loadFight()
        }, 500)
    }

    async loadFight() {
        const { pathname } = this.props.location;

        //console.log(pathname.split("/"));

        const paths = pathname.split("/")
        const db = paths[2]
        const fightId = paths[3]

        //console.log(fightId);
        const docRef = doc(firebasedb, db, fightId)

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

        //console.log(data);

        this.preloadFight(data)
    }

    preloadFight(data) {

        this.player1 = data.info1
        this.history = data.actions

        if (data.info2 && data.info2.id) {
            this.player2 = data.info2

            this.player1InitialHp = this.player1.hp
            this.player2InitialHp = this.player2.hp

            this.setState({ loading: false, fightInfo: data })
            setTimeout(() => {
                this.showFight()
            }, 500)
        }
        else {
            this.setState({ loading: false, showOnlyOne: true, fightInfo: data })
            setTimeout(() => {
                this.showResult()
            }, 500)
        }
    }

    showFight() {

        //console.log(this.history);

        let historyToShow = this.history[this.indexShow]
        historyToShow["turn"] = this.indexShow+1

        let historyShow = Object.assign([], this.state.historyShow)

        historyShow.splice(0, 0, historyToShow)

        this.setState({ historyShow }, () => {

            //console.log(this.history.length, this.indexShow);
            if (this.history.length > this.indexShow+1) {
                this.indexShow += 1
                this.turnTimeout = setTimeout(() => {
                    this.showFight()
                }, 3500)
            }
            else {
                this.setState({ isEnd: true })
            }
        })
    }

    nextTurn() {
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout)
            this.turnTimeout = undefined
        }

        this.showFight()
    }

    showResult() {
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout)
            this.turnTimeout = undefined
        }

        let historyShow = []

        this.history.map((item, index) => {
            item['turn'] = index+1

            historyShow.splice(0, 0, item)
        })

        //console.log(historyShow);

        this.setState({ historyShow, isEnd: true })
    }

    getColorHpBar(currentHp, maxHp) {
        if (!currentHp || !maxHp) {
            return "#3b9b63"
        }

        let rainbow = new Rainbow()
        rainbow.setSpectrum("#9e2b1e", "#3b9b63")
        rainbow.setNumberRange(0, maxHp)

        const color = rainbow.colourAt(currentHp)

        //console.log(color);

        return `#${color}`
    }


    calcWidthHp(width, max, current) {
        //console.log(width, max, current);
        let w = width * current / max
        if (w < 0) {
            w = 0
        }

        return w
    }

    getFullName(item) {

        const type = getName(item.id)

		if (item.nickname) {
            return `${item.name} ${item.nickname}`
        }

        return `${type} ${item.name}`
	}

    getFightDate() {
        const { fightInfo } = this.state

        let date;

        if (fightInfo && fightInfo.timestamp) {
            date = moment(fightInfo.timestamp.seconds * 1000)
            date = date.format("dddd, MMMM Do YYYY, h:mm:ss a")
            //console.log(date);
        }

        return date
    }

    renderBoxHp(width, item, initialHp, currentHp, level, index, isMobile, rgbBackgroundColor) {
        const { mainTextColor, isDarkmode, mainBackgroundColor } = this.props
        const { fightInfo } = this.state

        //console.log(item);

        const innerWidth = width - 40

        if (level && level.int) {
            level = level.int
        }

        let colorLevel = getColorTextBasedOnLevel(level, isDarkmode)

        let atk = item.attack + item.spellSelected.atkBase
        let dmg = item.damage + item.spellSelected.dmgBase

        //se è arena e il livello è maggiore di 160 allora calcoliamo anche spell upgrades
        if (fightInfo.region === "arena") {
            if (level > 160) {
                atk += item['upgrades-spell'].attack.int
                dmg += item['upgrades-spell'].damage.int
            }
        }
        //in tutti gli altri casi calcoliamo sempre spell-upgrades
        else {
            atk += item['upgrades-spell'].attack.int
            dmg += item['upgrades-spell'].damage.int
        }

        return (
            <div style={Object.assign({}, styles.boxHp, { width, backgroundColor: `rgba(${rgbBackgroundColor[0]}, ${rgbBackgroundColor[1]}, ${rgbBackgroundColor[2]}, 0.85)`, borderColor: mainTextColor })}>

                <div style={{ justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', width: innerWidth, flexDirection: isMobile ? 'column' : 'row' }}>

                    <p style={{ fontSize: 15, color: TEXT_SECONDARY_COLOR }} className="text-bold">
                        {this.getFullName(item)}
                    </p>

                    <div style={{ alignItems: 'center' }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginRight: 8 }}>
                            Level
                        </p>

                        <p style={{ fontSize: 17, color: colorLevel }} className="text-bold">
                            {level}
                        </p>
                    </div>

                </div>

                <div style={{ alignItems: 'center', flexDirection: 'row', width: innerWidth, justifyContent: 'flex-start', marginTop: 4 }}>

                    {
                        !isMobile &&
                        <div style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            {
                                item.ring && item.ring.url &&
                                <img
                                    style={{ width: 28, height: 28, marginRight: 3 }}
                                    src={item.ring.url}
                                    alt={item.ring.name}
                                />
                            }

                            {
                                item.pendant && item.pendant.url && item.pendant.equipped &&
                                <img
                                    style={{ width: 28, height: 28, marginRight: 3 }}
                                    src={item.pendant.url}
                                    alt={item.pendant.name}
                                />
                            }

                            {
                                item.aura && item.aura.bonus && item.aura.bonus.int > 0 &&
                                <img
                                    style={{ width: 24, height: 24, marginRight: 10 }}
                                    src={getAuraForElement(item.element)}
                                    alt="Aura"
                                />
                            }
                        </div>
                    }

                    <div style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <p style={{ color: mainTextColor, fontSize: 12, marginBottom: 3 }}>
                            hp {item.hp} - def {item.defense} - atk {atk} - dmg {dmg} - speed {item.speed}
                        </p>
                        {
                            !isMobile &&
                            <p style={{ color: mainTextColor, fontSize: 12 }}>
                                resistance {item.resistance} - weakness {item.weakness} - spell {item.spellSelected.name}
                            </p>
                        }
                    </div>
                </div>

                <div style={{ position: 'relative', width: innerWidth, height: 15, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
                    <div
                        className="hpBar"
                        ref={(ref) => {
                            index === 0 ?
                                this.hp1bar = ref
                                :
                                this.hp2bar = ref
                        }}
                        style={{ width: this.calcWidthHp(innerWidth, initialHp, currentHp), backgroundColor: this.getColorHpBar(currentHp, initialHp) }}
                    >
                        <p style={{ fontSize: 14, color: mainTextColor, marginLeft: 15 }} className="text-bold">
                            {currentHp < 0 ? 0 : currentHp}/{initialHp}
                        </p>
                    </div>
                </div>

            </div>
        )
    }

    renderDesc(item, index) {
        const { mainTextColor } = this.props
        //console.log(item);

        return (
            <div key={index} style={{ marginBottom: 15 }}>
                <p style={{ fontSize: 15, color: TEXT_SECONDARY_COLOR, marginRight: 10 }}>
                    Turn {item.turn}:
                </p>
                <p style={{ fontSize: 16, color: mainTextColor }}>
                    {item.desc}
                </p>
            </div>
        )
    }

    hexToRgb(hex) {

        if (hex === "white") {
            hex = "#FFFFFF"
        }

        return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
    }

    renderBgRegion() {
        const { fightInfo } = this.state

        if (!fightInfo || !fightInfo.region) {
            return undefined
        }

        const headerHeight = document.getElementById('headerbox').offsetHeight;

        let bgimage = oceorah_bg

        if (fightInfo.region.includes("Druggorial")) {
            bgimage = druggorial_bg
        }
        else if (fightInfo.region.includes("Oceorah")) {
            bgimage = oceorah_bg
        }
        else if (fightInfo.region.includes("Sitenor")) {
            bgimage = sitenor_bg
        }
        else if (fightInfo.region.includes("Wastiaxus")) {
            bgimage = wastiaxus_bg
        }
        else if (fightInfo.region.includes("Vedrenon")) {
            bgimage = vedrenon_bg
        }
        else if (fightInfo.region.includes("Bremonon")) {
            bgimage = bremonon_bg
        }
        else if (fightInfo.region.includes("Opherus")) {
            bgimage = opherus_bg
        }
        else if (fightInfo.region.includes("Ulanara")) {
            bgimage = ulanara_bg
        }
        else if (fightInfo.region.includes("Ulidalar")) {
            bgimage = ulidalar_bg
        }
        else if (fightInfo.region.includes("pvp")) {
            bgimage = pvp_bg
        }
        else if (fightInfo.region.includes("arena")) {
            bgimage = arena_bg
        }

        return (
            <img
                style={{ position: 'absolute', top: headerHeight-1, left: 0, width: '100%' }}
                src={bgimage}
            />
        )
    }

    renderBody(isMobile) {
        const { historyShow, loading, isEnd, showOnlyOne, fightInfo } = this.state
        const { mainTextColor, mainBackgroundColor } = this.props

        let { boxW } = getBoxWidth(isMobile)

        if (boxW > 1050) {
            boxW = 1050
        }

        if (loading) {
            return (
                <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                    <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                </div>
            )
        }

        if (historyShow.length === 0) {
            return <div />
        }

        if (showOnlyOne && this.player1 && this.player1.id && historyShow.length > 0) {

            return (
                <div style={{ flexDirection: 'column', width: boxW, overflowY: 'auto', overflowX: 'hidden', alignItems: 'center' }}>

                    <img
                        style={{ borderRadius: 4, borderColor: '#d7d7d7', borderStyle: 'solid', borderWidth: 1, width: 200, height: 200, marginBottom: 30 , marginTop: 30 }}
                        src={getImageUrl(this.player1.id)}
                    />

                    <p style={{ fontSize: 18, marginBottom: 15, color: TEXT_SECONDARY_COLOR }}>
                        Actions
                    </p>

                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }}>
                        {historyShow[0].desc}
                    </p>

                    <p style={{ fontSize: 18, marginTop: 10, marginBottom: 10, color: TEXT_SECONDARY_COLOR }}>
                        WINNER
                    </p>

                    <p style={{ fontSize: 22, color: TEXT_SECONDARY_COLOR, marginBottom: 30  }} className="text-bold">
                        #{this.player1.id}
                    </p>

                </div>
            )
        }

        const player1CurrentHp = historyShow.length > 0 ? historyShow[0][`hp_${this.player1.id}`] : this.player1InitialHp
        const player2CurrentHp = historyShow.length > 0 ? historyShow[0][`hp_${this.player2.id}`] : this.player2InitialHp

        //console.log(player1CurrentHp, player2CurrentHp);

        const widthSide = (boxW / 2) - 20

        const pctImg = isMobile ? 90 : 60
        const widthImg = widthSide * pctImg / 100

        //console.log(this.hexToRgb(mainBackgroundColor));

        const rgbBackgroundColor = this.hexToRgb(mainBackgroundColor)

        return (
            <div style={{ width: boxW, flexDirection: 'column' }}>

                {
                    !isMobile &&
                    this.renderBgRegion()
                }

                <div style={{ justifyContent: 'space-between', width: boxW, position: 'relative' }}>

                    <div style={{ width: widthSide, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>

                        <div style={{ height: isMobile ? 15 : 60 }} />

                        {this.renderBoxHp(widthSide, this.player2, this.player2InitialHp, player2CurrentHp, this.player2.level, 1, isMobile, rgbBackgroundColor)}

                        <div style={{ width: widthImg, marginTop: isMobile ? 70 : 110, position: 'relative' }}>
                            <img
            					style={{ width: widthImg }}
            					src={`https://storage.googleapis.com/wizarena/wizards_nobg_back/${this.player1.id}.png`}
            					alt={this.player1.id}
            				/>
                        </div>
                    </div>


                    <div style={{ width: widthSide, flexDirection: 'column', alignItems: 'center', height: 'fit-content' }}>

                        <div style={{ width: widthImg, height: widthImg, marginBottom: isMobile ? 70 : 110, position: 'relative' }}>
                            <img
            					style={{ width: widthImg , height: widthImg }}
                                src={`https://storage.googleapis.com/wizarena/wizards_nobg/${this.player2.id}.png`}
            					alt={this.player2.id}
            				/>

                            <div
                                style={{ height: 15, width: widthImg/2, position: 'absolute', top: widthImg+15, left: ((widthImg/2)-(widthImg/4)), backgroundColor: 'black', opacity: 0.5, borderRadius: '50%' }}
                            />
                        </div>

                        {this.renderBoxHp(widthSide, this.player1, this.player1InitialHp, player1CurrentHp, this.player1.level, 2, isMobile, rgbBackgroundColor)}

                        <div style={{ height: isMobile ? 15 : 30 }} />

                    </div>

                </div>

                <div style={Object.assign({}, styles.boxDesc, { backgroundColor: `rgba(${rgbBackgroundColor[0]}, ${rgbBackgroundColor[1]}, ${rgbBackgroundColor[2]}, 0.85)`, borderColor: mainTextColor })}>
                    {
                        historyShow.length > 0 &&
                        historyShow.map((item, index) => {
                            return this.renderDesc(item, index)
                        })
                    }

                    {
                        !isEnd &&
                        <button
                            className="btnH"
                            style={styles.btnOverlay}
                            onClick={() => {
                                this.nextTurn()
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }}>
                                Next turn
                            </p>
                        </button>
                    }

                    {
                        isEnd && this.props.history.length > 1 &&
                        <button
                            className="btnH"
                            style={styles.btnOverlay}
                            onClick={() => {
                                this.props.history.goBack()
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }}>
                                Back
                            </p>
                        </button>
                    }

                    {
                        !isEnd &&
                        <button
                            className="btnH"
                            style={styles.btnOverlayTop}
                            onClick={() => {
                                this.showResult()
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }}>
                                Show result
                            </p>
                        </button>
                    }

                </div>

                {
                    fightInfo.timestamp ?
                    <div style={{ justifyContent: 'flex-end' }}>
                        <div style={Object.assign({}, styles.boxDate, { backgroundColor: `rgba(${rgbBackgroundColor[0]}, ${rgbBackgroundColor[1]}, ${rgbBackgroundColor[2]}, 0.85)`, borderColor: mainTextColor })}>
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                Fight date: {this.getFightDate()}
                            </p>
                        </div>
                    </div>
                    : undefined
                }
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
				<Header
					page='nft'
					section={32}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
                <Media
                    query="(max-width: 999px)"
                    render={() => this.renderTopHeader(true)}
                />

                <Media
                    query="(min-width: 1000px)"
                    render={() => this.renderTopHeader(false)}
                />

                <div style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>

    				<Media
    					query="(max-width: 600px)"
    					render={() => this.renderBody(true)}
    				/>

    				<Media
    					query="(min-width: 601px)"
    					render={() => this.renderBody(false)}
    				/>
                </div>
			</div>
		)
	}
}

const styles = {
	container: {
		flexDirection: 'column',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
    boxHp: {
        flexDirection: 'column',
        minHeight: 90,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 4
    },
    boxDesc: {
        position: 'relative',
        height: 160,
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 4,
        padding: 10,
        flexDirection: 'column',
        overflowY: 'scroll',
        overflowX: 'hidden'
    },
    btnOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 120,
        height: 40,
        borderRadius: 4,
        backgroundColor: CTA_COLOR,
    },
    btnOverlayTop: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 120,
        height: 40,
        borderRadius: 4,
        backgroundColor: CTA_COLOR,
    },
    boxDate: {
        position: 'relative',
        minHeight: 15,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 4,
        padding: 5,
        overflowY: 'scroll',
        overflowX: 'hidden',
        width: "fit-content",
        marginTop: 10
    }
}

const mapStateToProps = (state) => {
	const { mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { mainTextColor, mainBackgroundColor, isDarkmode };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
})(FightsReplay)
