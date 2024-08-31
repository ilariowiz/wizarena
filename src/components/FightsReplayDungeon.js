import React, { Component } from 'react';
import { connect } from 'react-redux'
import Media from 'react-media';
import moment from 'moment'
import DotLoader from 'react-spinners/DotLoader';
import { doc, getDoc } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Rainbow from 'rainbowvis.js'
import Header from './Header'
import ModalEndEndurance from './common/ModalEndEndurance'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import getBoxWidth from './common/GetBoxW'
import getName from './common/GetName'
import getAuraForElement from '../assets/gifs/AuraForElement'
import {
    setNetworkSettings,
    setNetworkUrl
} from '../actions'
import { CTA_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID, REVEAL_CAP } from '../actions/types'

import "../css/Fight.css"

const orc_berserker = require('../assets/monsters/orc_1.png')
const orc_defensive = require('../assets/monsters/orc_defensive.png')
const orc_average = require('../assets/monsters/orc_average.png')
const orc_ninja = require('../assets/monsters/orc_ninja.png')
const dungeons_bg = require('../assets/bg_fights/dungeons_bg_hd.jpg')


class FightsReplayDungeon extends Component {
    constructor(props) {
        super(props)

        this.blinkInterval = undefined

        this.player1InitialHp = 0
        this.player2InitialHp = 0

        this.hp1bar = undefined
        this.hp2bar = undefined

        this.indexFight = 0

        this.indexShow = 0
        this.turnTimeout = undefined

        this.history = []

        this.state = {
            loading: true,
            historyShow: [],
            isEnd: false,
            fightInfo: {},
            orcOpacity: 1,
            hideNext: false,
            showModalEnd: false
        }

        this.player1 = {}
		this.player2 = {}
    }

    componentDidMount() {
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

        const firstFight = data.actions[0]

        this.history = firstFight.actions

        this.player2 = firstFight.info2
        this.player2['image'] = this.getOrcImage(this.player2)

        this.player1InitialHp = firstFight.hp1
        this.player2InitialHp = firstFight.hp2

        this.setState({ loading: false, fightInfo: data })
        setTimeout(() => {
            this.showFight()
        }, 500)
    }

    showFight() {
        const { fightInfo } = this.state

        let historyToShow = this.history[this.indexShow]

        //console.log(this.history);

        historyToShow["turn"] = this.indexShow+1

        let historyShow = Object.assign([], this.state.historyShow)

        historyShow.splice(0, 0, historyToShow)

        this.setState({ historyShow }, () => {
            //console.log(this.history.length, this.indexShow);
            if (this.history.length > this.indexShow+1) {
                this.indexShow += 1
                this.turnTimeout = setTimeout(() => {
                    this.showFight()
                }, 1400)
            }
            else {
                //console.log("is END");

                if (fightInfo.actions[this.indexFight+1]) {
                    this.startBlinkAnimation()

                    setTimeout(() => {
                        clearInterval(this.blinkInterval)
                        this.setState({ hideNext: false, orcOpacity: 1 })
                        this.nextOrc()
                    }, 2600)
                }
                else {
                    this.setState({ isEnd: true }, () => {
                        setTimeout(() => {
                            this.setState({ showModalEnd: true })
                        }, 1000)
                    })
                }

            }
        })
    }

    nextOrc() {
        const { fightInfo } = this.state

        this.indexFight += 1
        if (fightInfo.actions[this.indexFight]) {
            const newFight = fightInfo.actions[this.indexFight]
            this.history = newFight.actions
            this.player2 = newFight.info2
            this.player2['image'] = this.getOrcImage(this.player2)

            this.player2InitialHp = newFight.hp2

            this.indexShow = 0

            this.turnTimeout = setTimeout(() => {
                this.showFight()
            }, 200)
        }
        else {
            this.setState({ isEnd: true })
        }
    }

    nextTurn() {
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout)
            this.turnTimeout = undefined
        }

        this.showFight()
    }

    startBlinkAnimation() {
        this.blinkInterval = setInterval(() => {
            this.setState({ orcOpacity: this.state.orcOpacity === 1 ? 0 : 1, hideNext: true })
            //console.log(this.state.orcOpacity);
        }, 400)
    }

    getOrcImage(info) {
        const orcType = info.type

        if (orcType === "Defensive") {
            return orc_defensive
        }
        if (orcType === "Average") {
            return orc_average
        }
        if (orcType === "Ninja") {
            return orc_ninja
        }
        if (orcType === "Berserker") {
            return orc_berserker
        }

        return orc_berserker
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

        return `${item.name}`
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

        atk += item['upgrades-spell'].attack.int
        dmg += item['upgrades-spell'].damage.int

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
                            hp {initialHp} - def {item.defense} - atk {atk} - dmg {dmg} - speed {item.speed}
                        </p>
                        {
                            !isMobile &&
                            <p style={{ color: mainTextColor, fontSize: 12 }}>
                                resistance {item.resistance} - weakness {item.weakness} - spell {item.spellSelected.name} ({item.element})
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

    renderBody(isMobile) {
        const { historyShow, loading, isEnd, fightInfo, showModalEnd } = this.state
        const { mainTextColor, mainBackgroundColor } = this.props

        let { boxW, modalW } = getBoxWidth(isMobile)

        if (boxW > 1050) {
            boxW = 1050
        }

        //console.log(historyShow);

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

        const player1CurrentHp = historyShow.length > 0 ? historyShow[0][`hp_${this.player1.id}`] : this.player1InitialHp
        const player2CurrentHp = historyShow.length > 0 ? historyShow[0][`hp_${this.player2.id}`] : this.player2InitialHp

        const widthSide = (boxW / 2) - 20

        const pctImg = isMobile ? 90 : 60
        const widthImg = widthSide * pctImg / 100

        const rgbBackgroundColor = this.hexToRgb(mainBackgroundColor)
        const headerHeight = document.getElementById('headerbox').offsetHeight;

        return (
            <div style={{ width: boxW, flexDirection: 'column' }}>

                {
                    !isMobile &&
                    <img
                        style={{ position: 'absolute', top: headerHeight-1, left: 0, width: '100%' }}
                        src={dungeons_bg}
                    />
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
            					style={{ width: widthImg , height: widthImg, opacity: this.state.orcOpacity }}
                                src={this.player2.image}
            					alt=""
            				/>

                            {
                                this.state.orcOpacity > 0 &&
                                <div
                                    style={{ height: 15, width: widthImg/2, position: 'absolute', top: widthImg+15, left: ((widthImg/2)-(widthImg/4)), backgroundColor: 'black', opacity: 0.5, borderRadius: '50%' }}
                                />
                            }
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

                    {/*
                        !isEnd && !this.state.hideNext &&
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
                    */}

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

                {
                    showModalEnd &&
                    <ModalEndEndurance
                        showModal={true}
                        onCloseModal={() => this.setState({ showModalEnd: false })}
                        width={modalW}
                        text={`You won ${fightInfo.actions.length - 1} orc ears before falling...`}
                        mainTextColor={mainTextColor}
                        mainBackgroundColor={mainBackgroundColor}
                    />
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
    setNetworkUrl
})(FightsReplayDungeon)
