import React, { Component } from 'react';
import { connect } from 'react-redux'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import { doc, updateDoc, collection, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Rainbow from 'rainbowvis.js'
import fight from './common/CalcFight'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import getBoxWidth from './common/GetBoxW'
import allSpells from './common/Spells'
import { calcLevelWizard } from './common/CalcLevelWizard'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadSingleNft,
    getInfoItemEquipped,
    setSfida
} from '../actions'
import { CTA_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID, REVEAL_CAP } from '../actions/types'

import "../css/Fight.css"


class DoFight extends Component {
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
            isEnd: false
        }

        this.player1 = {}
		this.player2 = {}
    }

    componentDidMount() {
        document.title = "PvP - Wizards Arena"

        const { sfida } = this.props

        //console.log(sfida);

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        if (!sfida || !sfida.pvpWeek) {
            this.props.history.replace("/pvp")
            return
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
            this.loadNft(sfida.player1.id, true)
        }, 500)
    }

    refactorSpellSelected(spellSelected) {

        const refactorSpellSelected = allSpells.find(i => i.name === spellSelected.name)

        //console.log(refactorSpellSelected);

        return refactorSpellSelected
    }

    async loadNft(idNft, isPlayer1) {
		const { chainId, gasPrice, gasLimit, networkUrl, sfida } = this.props

        const ring = await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, idNft)
        //console.log(ring);
        const pendant = await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, `${idNft}pendant`)

        if (isPlayer1) {
            this.player1 = sfida.player1
            this.player1.level = calcLevelWizard(this.player1)
            this.player1.attack = this.player1.attack.int
            this.player1.damage = this.player1.damage.int
            this.player1.defense = this.player1.defense.int
            this.player1.hp = this.player1.hp.int
            this.player1.speed = this.player1.speed.int
            this.player1.spellSelected = this.refactorSpellSelected(sfida.player1.spellSelected)

            //console.log(this.player1);
            if (ring && ring.equipped) {
                const stats = ring.bonus.split(",")
                stats.map(i => {
                    const infos = i.split("_")
                    this.player1[infos[1]] += parseInt(infos[0])
                })

                this.player1.ring = ring
            }

            if (pendant && pendant.equipped) {
                this.player1.pendant = pendant
            }

            this.player1InitialHp = this.player1.hp

            this.loadNft(sfida.player2.id, false)
        }
        else {
            this.player2 = sfida.player2
            this.player2.level = calcLevelWizard(this.player2)
            this.player2.attack = this.player2.attack.int
            this.player2.damage = this.player2.damage.int
            this.player2.defense = this.player2.defense.int
            this.player2.hp = this.player2.hp.int
            this.player2.speed = this.player2.speed.int
            this.player2.spellSelected = this.refactorSpellSelected(sfida.player2.spellSelected)

            if (ring && ring.equipped) {
                const stats = ring.bonus.split(",")
                //console.log("stats ring 2", stats);
                stats.map(i => {
                    const infos = i.split("_")
                    //console.log(infos[1], infos[0]);
                    this.player2[infos[1]] += parseInt(infos[0])
                })

                this.player2.ring = ring
            }

            if (pendant && pendant.equipped) {
                this.player2.pendant = pendant
            }

            this.player2InitialHp = this.player2.hp

            //console.log(this.player1, this.player2);

            fight(this.player1, this.player2, undefined, (history, winner) => {
                //console.log(history, winner);

                this.setState({ winner, loading: false }, () => {
                    this.history = history

                    //console.log(this.history);
                    //console.log(winner);

                    this.updateFirebase(sfida, this.player1, this.player2, winner, this.history, sfida.fightsStart)

                    this.indexShow = 0

                    setTimeout(() => {
                        this.showFight()
                    }, 600)
                })

            })
        }
	}

    async updateFirebase(sfida, player1, player2, winner, history, fightsStart) {

        let keyDb = fightsStart ? "pvp_results" : "pvp_training"

        const docRef = doc(firebasedb, keyDb, `${sfida.pvpWeek}_#${winner}`)
        try {
            await updateDoc(docRef, {
                "win": increment(1)
            })
        }
        catch (error) {
            console.log(error);
        }

        const loser = player1.id === winner ? player2.id : player1.id

        const docRef2 = doc(firebasedb, keyDb, `${sfida.pvpWeek}_#${loser}`)
        try {
            await updateDoc(docRef2, {
                "lose": increment(1)
            })
        }
        catch (error) {
            console.log(error);
        }

        if (fightsStart) {
            const fightObj = {
                actions: history,
                idnft1: player1.id,
                idnft2: player2.id,
                pvpWeek: sfida.pvpWeek,
                winner,
                info1: player1,
                info2: player2,
                hp1: this.player1InitialHp,
                hp2: this.player2InitialHp,
                wizards: [player1.id, player2.id],
                timestamp: serverTimestamp()
            }

            //console.log(fightObj);

            const fightRef = doc(collection(firebasedb, "fights_pvp"))
            const newDoc = setDoc(fightRef, fightObj)
        }
    }

    showFight() {
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

    nextTurn() {
        if (this.turnTimeout) {
            clearTimeout(this.turnTimeout)
            this.turnTimeout = undefined
        }

        this.showFight()
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


    getName(item) {

		let type = "Wizard"
		if (parseInt(item.id) >= 1023 && parseInt(item.id) < 2048) {
			type = "Cleric"
		}
        if (parseInt(item.id) >= 2048 && parseInt(item.id) < REVEAL_CAP) {
			type = "Druid"
		}

		if (item.nickname) {
            return `${item.name} ${item.nickname}`
        }

        return `${type} ${item.name}`
	}


    renderBoxHp(width, item, initialHp, currentHp, level, index, isMobile) {
        const { mainTextColor, isDarkmode } = this.props

        const innerWidth = width - 40

        const colorLevel = getColorTextBasedOnLevel(level, isDarkmode)

        return (
            <div style={Object.assign({}, styles.boxHp, { width })}>

                <div style={{ justifyContent: 'space-between', alignItems: 'center', width: innerWidth, flexDirection: isMobile ? 'column' : 'row' }}>

                    <button
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            this.props.setSfida(undefined)
                            this.props.history.push(`/nft/${item.id}`)
                        }}
                    >
                        <p style={{ fontSize: 15, color: TEXT_SECONDARY_COLOR }} className="text-bold">
                            {this.getName(item)}
                        </p>
                    </button>

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
                        item.ring && item.ring.url &&
                        <img
                            style={{ width: 32, height: 32, marginRight: 10 }}
                            src={item.ring.url}
                            alt={item.ring.name}
                        />
                    }

                    <div style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <p style={{ color: mainTextColor, fontSize: 12, marginBottom: 3 }}>
                            hp {item.hp} - def {item.defense} - atk {item.attack + item.spellSelected.atkBase + item['upgrades-spell'].attack.int} - dmg {item.damage + item.spellSelected.dmgBase + item['upgrades-spell'].damage.int} - speed {item.speed}
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

    renderBody(isMobile) {
        const { historyShow, loading, isEnd } = this.state

        let { boxW } = getBoxWidth(isMobile)

        if (boxW > 1050) {
            boxW = 1050
        }

        //console.log(historyShow, this.player1InitialHp);

        const player1CurrentHp = historyShow.length > 0 ? historyShow[0][`hp_${this.player1.id}`] : this.player1InitialHp
        const player2CurrentHp = historyShow.length > 0 ? historyShow[0][`hp_${this.player2.id}`] : this.player2InitialHp

        const widthSide = (boxW / 2) - 20

        const pctImg = isMobile ? 90 : 60
        const widthImg = widthSide * pctImg / 100

        if (loading) {
            return (
                <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                    <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                </div>
            )
        }

        return (
            <div style={{ width: boxW, flexDirection: 'column' }}>

                <div style={{ justifyContent: 'space-between', width: boxW, position: 'relative' }}>

                    <div style={{ width: widthSide, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>

                        <div style={{ height: isMobile ? 15 : 60 }} />

                        {this.renderBoxHp(widthSide, this.player2, this.player2InitialHp, player2CurrentHp, this.player2.level, 1, isMobile)}

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
                        </div>

                        {this.renderBoxHp(widthSide, this.player1, this.player1InitialHp, player1CurrentHp, this.player1.level, 2, isMobile)}

                        <div style={{ height: isMobile ? 15 : 30 }} />

                    </div>

                </div>

                <div style={styles.boxDesc}>
                    {
                        historyShow.length > 0 &&
                        historyShow.map((item, index) => {
                            return this.renderDesc(item, index)
                        })
                    }

                    <button
                        className="btnH"
                        style={styles.btnOverlay}
                        onClick={() => {
                            if (isEnd) {
                                this.props.history.replace("/pvp")
                            }
                            else {
                                this.nextTurn()
                            }
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }}>
                            {isEnd ? "Back to PvP" : "Next turn"}
                        </p>
                    </button>

                    {
                        !isEnd &&
                        <button
                            className="btnH"
                            style={styles.btnOverlayTop}
                            onClick={() => {
                                if (isEnd) {
                                    this.props.history.replace("/pvp")
                                }
                                else {
                                    this.showResult()
                                }
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }}>
                                Show result
                            </p>
                        </button>
                    }

                </div>
            </div>
        )
    }

    render() {
		return (
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<Media
					query="(max-width: 600px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 601px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
	container: {
		flexDirection: 'column',
		alignItems: 'center',
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
        borderColor: TEXT_SECONDARY_COLOR,
        borderStyle: 'solid',
        borderRadius: 4
    },
    boxDesc: {
        position: 'relative',
        height: 160,
        borderWidth: 2,
        borderColor: TEXT_SECONDARY_COLOR,
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
    }
}

const mapStateToProps = (state) => {
	const { sfida, chainId, gasPrice, gasLimit, networkUrl, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { sfida, chainId, gasPrice, gasLimit, networkUrl, mainTextColor, mainBackgroundColor, isDarkmode };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    loadSingleNft,
    getInfoItemEquipped,
    setSfida
})(DoFight)
