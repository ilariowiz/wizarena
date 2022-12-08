import React, { Component } from 'react';
import { connect } from 'react-redux'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import { doc, updateDoc, collection, setDoc, increment } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Rainbow from 'rainbowvis.js'
import Header from './Header'
import ModalPvPWinner from './common/ModalPvPWinner';
import { calcLevelWizard, getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import getBoxWidth from './common/GetBoxW'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadSingleNft
} from '../actions'
import { BACKGROUND_COLOR, CTA_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID } from '../actions/types'

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

        this.state = {
            loading: true,
            history: [],
            historyShow: [],
            winner: undefined,
            showModalWinner: false,
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
            this.loadNft(sfida.player1.idnft, true)
        }, 500)
    }

    refactorSpellSelected(spellSelected) {

        let conditionSpell = {}
		if (spellSelected.condition.name) {
			conditionSpell = {
				effect: spellSelected.condition.effect,
				name: spellSelected.condition.name,
				pct: spellSelected.condition.pct.int,
				element: spellSelected.condition.element
			}
		}

		const refactorSpellSelected = {
			dmgBase: spellSelected.dmgBase.int,
			name: spellSelected.name,
			atkBase: spellSelected.atkBase.int,
			condition: conditionSpell,
			element: spellSelected.element
		}

        return refactorSpellSelected
    }

    loadNft(idNft, isPlayer1) {
		const { chainId, gasPrice, gasLimit, networkUrl, sfida } = this.props

		this.props.loadSingleNft(chainId, gasPrice, gasLimit, networkUrl, idNft, (response) => {
            //console.log(response);
            if (response.name) {
                if (isPlayer1) {
                    this.player1 = response
                    this.player1.level = calcLevelWizard(this.player1)
                    this.player1.attack = this.player1.attack.int
                    this.player1.damage = this.player1.damage.int
                    this.player1.defense = this.player1.defense.int
                    this.player1.hp = this.player1.hp.int
                    this.player1.spellSelected = this.refactorSpellSelected(sfida.player1.spellSelected)

                    this.player1InitialHp = this.player1.hp

                    //console.log(this.player1);

                    this.loadNft(sfida.player2.idnft, false)
                }
                else {
                    this.player2 = response
                    this.player2.level = calcLevelWizard(this.player2)
                    this.player2.attack = this.player2.attack.int
                    this.player2.damage = this.player2.damage.int
                    this.player2.defense = this.player2.defense.int
                    this.player2.hp = this.player2.hp.int
                    this.player2.spellSelected = this.refactorSpellSelected(sfida.player2.spellSelected)

                    this.player2InitialHp = this.player2.hp

                    this.startFight(this.player1, this.player2)
                }
			}
			else {
				this.setState({ error: '404', loading: false })
			}
		})
	}


    startFight(s1, s2, callback) {
        let s1copy = Object.assign({}, s1)
        let s2copy = Object.assign({}, s2)
        s1copy['condizione'] = {}
        s2copy['condizione'] = {}

        let iniziativa = Math.floor(Math.random() * 10) + 1; //da 1 a 10

        if (iniziativa <= 5) {
            this.turno(s1copy, s2copy)
        }
        else {
            this.turno(s2copy, s1copy)
        }
    }

    convertConditionName(name) {
        //console.log(name);
        if (name.includes("Poison")) {
            return "is poisoned"
        }
        else if (name.includes("Burn")) {
            return "is burned"
        }
        else if (name.includes("Confuse")) {
            return "is confused"
        }
        else if (name.includes("Freeze")) {
            return "is frozen"
        }
        else if (name.includes("Slow")) {
            return "is slowed"
        }
        else if (name.includes("Paralyze")) {
            return "is paralyzed"
        }
        else if (name.includes("Shock")) {
            return "is shocked"
        }
        else if (name.includes("Blind")) {
            return "is blinded"
        }
        else if (name.includes("Exhaust")) {
            return "is exhausted"
        }
    }

    convertConditionNamePositive(name) {
        if (name.includes("Poison")) {
            return "is no longer poisoned"
        }
        else if (name.includes("Burn")) {
            return "is no longer burned"
        }
        else if (name.includes("Confuse")) {
            return "is no longer confused"
        }
        else if (name.includes("Freeze")) {
            return "is no longer frozen"
        }
        else if (name.includes("Slow")) {
            return "is no longer slowed"
        }
        else if (name.includes("Paralyze")) {
            return "is no longer paralyzed"
        }
        else if (name.includes("Shock")) {
            return "is no longer shocked"
        }
        else if (name.includes("Blind")) {
            return "is no longer blinded"
        }
        else if (name.includes("Exhaust")) {
            return "is no longer exhausted"
        }
    }

    turno(attaccante, difensore) {

        //console.log(attaccante, difensore);

        let malus = 0
        let malusTipo = ''
        let skipTurn = false

        let desc = ""

        if (attaccante.condizione.name) {

            //console.log(attaccante.condizione);

            if (attaccante.condizione.effect.includes("skip")) {
                let checkSkip = Math.floor(Math.random() * 100) + 1; //da 1 a 100
                //console.log(checkSkip, attaccante.condizione.pct);
                if (checkSkip <= attaccante.condizione.pct) {
                    const textCondizione = this.convertConditionName(attaccante.condizione.name)
                    desc = `${attaccante.name} ${textCondizione}! Skip his turn! `
                    //console.log("condizione skip", desc);
                    skipTurn = true
                }
                else {
                    const textCondizione = this.convertConditionNamePositive(attaccante.condizione.name)
                    desc = `${attaccante.name} ${textCondizione}! `
                    //console.log("condizione superata", desc);
                    attaccante.condizione = {}
                }
            }
            else {
                let checkCondizione = Math.floor(Math.random() * 100) + 1; //da 1 a 100

                if (attaccante.condizione.pct < checkCondizione) {
                    const textCondizione = this.convertConditionNamePositive(attaccante.condizione.name)
                    desc = `${attaccante.name} ${textCondizione}! `
                    //console.log("condizione superata", desc);
                    attaccante.condizione = {}
                }
                else {
                    const infoMalus = attaccante.condizione.effect.split("_")
                    malus = infoMalus[1]
                    malusTipo = infoMalus[2]
                    const textCondizione = this.convertConditionName(attaccante.condizione.name)
                    desc = `${attaccante.name} ${textCondizione}! `
                    //console.log("condizione malus", desc);
                }
            }
        }

        if (skipTurn) {
            this.fineTurno(attaccante, difensore, desc, false)
        }
        else {
            const spellSelectedAtk = attaccante.spellSelected
            let atkAttaccante = attaccante.attack + spellSelectedAtk.atkBase

            if (malusTipo && malusTipo === "atk") {
                atkAttaccante -= parseInt(malus)
            }

            let tiro = Math.floor(Math.random() * 20) + 1; //da 1 a 20
            let atkTot = tiro + atkAttaccante

            let hasDebolezza = false
            let hasResistenza = false

            let difesaDif = difensore.defense
            if (difensore.condizione.name) {
                if (difensore.condizione.effect.includes("def")) {
                    const infoMalus = difensore.condizione.effect.split("_")
                    difesaDif -= parseInt(infoMalus[1])
                }
            }

            if (atkTot >= difesaDif) {

                const dannoBase = attaccante.damage
                let dannoSpell = dannoBase + attaccante.spellSelected.dmgBase

                if (malusTipo === "dmg") {
                    dannoSpell -= parseInt(malus)
                }

                let danno = dannoSpell + (Math.floor(Math.random() * 5) - 2)

                if (attaccante.element.toLowerCase() === difensore.weakness) {
                    danno *= 2
                    hasDebolezza = true
                }
                else if (attaccante.element.toLowerCase() === difensore.resistance) {
                    danno = Math.floor(danno/2)
                    hasResistenza = true
                }

                difensore.hp -= danno

                if (difensore.hp > 0) {
                    if (attaccante.spellSelected.condition.name) {
                        const textCondizione = this.convertConditionName(attaccante.spellSelected.condition.name)
                        desc = `${difensore.name} ${textCondizione}! `
                        difensore.condizione = attaccante.spellSelected.condition
                    }

                    if (!hasDebolezza && !hasResistenza) {
                        if (desc.includes("no longer")) {
                            desc = `${desc}${attaccante.name} hits ${difensore.name} and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left).`
                        }
                        else {
                            desc = `${attaccante.name} hits ${difensore.name} and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left). ${desc}`
                        }
                    }
                    else if (hasDebolezza) {
                        if (desc.includes("no longer")) {
                            desc = `${desc}${attaccante.name} hits ${difensore.name}, who is weak to ${attaccante.element}, and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left).`
                        }
                        else {
                            desc = `${attaccante.name} hits ${difensore.name}, who is weak to ${attaccante.element}, and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left). ${desc}`
                        }
                    }
                    else if (hasResistenza) {
                        if (desc.includes("no longer")) {
                            desc = `${desc}${attaccante.name} hits ${difensore.name}, who is ${attaccante.element} resistant, and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left).`
                        }
                        else {
                            desc = `${attaccante.name} hits ${difensore.name}, who is ${attaccante.element} resistant, and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left). ${desc}`
                        }
                    }

                    this.fineTurno(attaccante, difensore, desc, false)
                }
                else {
                    desc = `${desc}${attaccante.name} hits and ${difensore.name} is K.O., the round is over!`
                    this.fineTurno(attaccante, difensore, desc, true)
                }
            }
            else {
                desc = `${desc}${attaccante.name} misses ${difensore.name}`
                this.fineTurno(attaccante, difensore, desc, false)
            }
        }
    }

    fineTurno(attaccante, difensore, desc, end) {
        //console.log(attaccante, difensore, desc, end);
        const { history } = this.state
        const { sfida } = this.props

        const newH = Object.assign([], history)

        //console.log(newH);

        let currentHp1;
        let currentHp2;
        if (attaccante.name === this.player1.name) {
            currentHp1 = attaccante.hp
            currentHp2 = difensore.hp
        }
        else {
            currentHp1 = difensore.hp
            currentHp2 = attaccante.hp
        }

        const obj = { desc, player1CurrentHp: currentHp1, player2CurrentHp: currentHp2 }
        newH.push(obj)

        //console.log(currentHp1, currentHp2);

        if (end) {
            //console.log(attaccante, difensore, desc, end);

            this.setState({ loading: false, winner: attaccante.name, history: newH }, () => {

                const docRef = doc(firebasedb, "pvp_results", `${sfida.pvpWeek}_#${attaccante.id}`)
				updateDoc(docRef, {
		            "win": increment(1)
		        })

                const docRef2 = doc(firebasedb, "pvp_results", `${sfida.pvpWeek}_#${difensore.id}`)
				updateDoc(docRef2, {
		            "lose": increment(1)
		        })

                const fightObj = {
                    actions: newH,
                    idnft1: attaccante.id,
                    idnft2: difensore.id,
                    pvpWeek: sfida.pvpWeek,
                    winner: attaccante.id
                }

                const fightRef = doc(collection(firebasedb, "fights_pvp"))
                const newDoc = setDoc(fightRef, fightObj)

                this.indexShow = 0

                setTimeout(() => {
                    this.showFight()
                }, 2000)
            })
        }
        else {
            this.setState({ history: newH }, () => {
                this.turno(difensore, attaccante)
            })

        }
    }

    showFight() {
        const { history } = this.state

        let historyToShow = history[this.indexShow]
        historyToShow["turn"] = this.indexShow+1

        let historyShow = Object.assign([], this.state.historyShow)

        historyShow.splice(0, 0, historyToShow)

        this.setState({ historyShow }, () => {

            //console.log(history.length, this.indexShow);
            if (history.length > this.indexShow+1) {
                this.indexShow += 1
                this.turnTimeout = setTimeout(() => {
                    this.showFight()
                }, 4000)
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

    renderBoxHp(width, name, initialHp, currentHp, level, index, isMobile) {

        const innerWidth = width - 40

        const colorLevel = getColorTextBasedOnLevel(level)

        return (
            <div style={Object.assign({}, styles.boxHp, { width })}>

                <div style={{ justifyContent: 'space-between', alignItems: 'center', width: innerWidth, flexDirection: isMobile ? 'column' : 'row' }}>
                    <p style={{ fontSize: isMobile ? 15 : 20, color: TEXT_SECONDARY_COLOR }}>
                        Wizard {name}
                    </p>

                    <div style={{ alignItems: 'center' }}>
                        <p style={{ fontSize: isMobile ? 15 : 17, color: 'white', marginRight: 8 }}>
                            LEVEL
                        </p>

                        <p style={{ fontSize: isMobile ? 15 : 20, color: colorLevel }}>
                            {level}
                        </p>
                    </div>

                </div>

                <div style={{ position: 'relative', width: innerWidth, height: 15, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
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
                        <p style={{ fontSize: 16, color: 'white', marginLeft: 15 }}>
                            {currentHp < 0 ? 0 : currentHp}/{initialHp}
                        </p>
                    </div>
                </div>

            </div>
        )
    }

    renderDesc(item, index) {

        //console.log(item);

        return (
            <div key={index} style={{ marginBottom: 15 }}>
                <p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR, marginRight: 10 }}>
                    Turn {item.turn}:
                </p>
                <p className="textDesc">
                    {item.desc}
                </p>
            </div>
        )
    }

    renderBody(isMobile) {
        const { historyShow, loading, isEnd } = this.state

        let { boxW, modalW } = getBoxWidth(isMobile)

        if (boxW > 1050) {
            boxW = 1050
        }

        //console.log(historyShow);

        const player1CurrentHp = historyShow.length > 0 ? historyShow[0].player1CurrentHp : this.player1InitialHp
        const player2CurrentHp = historyShow.length > 0 ? historyShow[0].player2CurrentHp : this.player2InitialHp

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

                <div style={{ justifyContent: 'space-between' }}>

                    <div style={{ width: widthSide, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>

                        <div style={{ height: isMobile ? 15 : 60 }} />

                        {this.renderBoxHp(widthSide, this.player2.name, this.player2InitialHp, player2CurrentHp, this.player2.level, 1, isMobile)}

                        <img
        					style={{ width: widthImg, marginTop: isMobile ? 70 : 110 }}
        					src={`https://storage.googleapis.com/wizarena/wizards_nobg_back/${this.player1.id}.png`}
        					alt={this.player1.id}
        				/>
                    </div>


                    <div style={{ width: widthSide, flexDirection: 'column', alignItems: 'center', height: 'fit-content' }}>
                        <img
        					style={{ width: widthImg , height: widthImg, marginBottom: isMobile ? 70 : 110 }}
                            src={`https://storage.googleapis.com/wizarena/wizards_nobg/${this.player2.id}.png`}
        					alt={this.player2.id}
        				/>

                        {this.renderBoxHp(widthSide, this.player1.name, this.player1InitialHp, player1CurrentHp, this.player1.level, 2, isMobile)}

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
                        style={Object.assign({}, styles.btnOverlay, { backgroundColor: isEnd ? CTA_COLOR : BACKGROUND_COLOR })}
                        onClick={() => {
                            if (isEnd) {
                                this.props.history.replace("/pvp")
                            }
                            else {
                                this.nextTurn()
                            }
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            {isEnd ? "Back to PVP" : "Next Turn"}
                        </p>
                    </button>
                </div>


                <ModalPvPWinner
                    showModal={this.state.showModalWinner}
                    width={modalW}
                    winner={this.state.winner}
                    history={this.props.history}
                />
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='fightpvp'
					section={1}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={styles.container}>
				<Media
					query="(max-width: 600px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 601px)"
					render={() => this.renderTopHeader(false)}
				/>

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
		backgroundColor: BACKGROUND_COLOR
	},
    boxHp: {
        flexDirection: 'column',
        minHeight: 70,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND_COLOR,
        borderWidth: 2,
        borderColor: TEXT_SECONDARY_COLOR,
        borderStyle: 'solid',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 2,
        borderTopRightRadius: 2,
        borderBottomRightRadius: 10
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
        overflow: 'scroll'
    },
    btnOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 160,
        height: 40,
        borderWidth: 2,
        borderRadius: 2,
        borderColor: CTA_COLOR,
        borderStyle: "solid"
    }
}

const mapStateToProps = (state) => {
	const { sfida, chainId, gasPrice, gasLimit, networkUrl } = state.mainReducer;

	return { sfida, chainId, gasPrice, gasLimit, networkUrl };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    loadSingleNft
})(DoFight)
