import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import { doc, getDoc } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Rainbow from 'rainbowvis.js'
import Header from './Header'
import getImageUrl from './common/GetImageUrl'
import cardStats from './common/CardStats'
import getRingBonuses from './common/GetRingBonuses'
import { calcLevelWizard, getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import { MAIN_NET_ID, BACKGROUND_COLOR, TEXT_SECONDARY_COLOR, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadSingleNft
} from '../actions'
import '../css/NftCardChoice.css'
import "../css/Fight.css"


class Fight extends Component {
    constructor(props) {
        super(props)

        this.dataCurrentHP = {}
        this.indexFightActions = 0

        this.state = {
			loading: true,
            actions: [],
            tournament: undefined,
            winner: undefined,
            u1: undefined,
            u2: undefined,
            error: '',
            showOnlyOne: false,
            showResult: false,
            showBar: false,
            fightActions: [],
            levels: {}
        }
    }

    componentDidMount() {
		document.title = "Fight - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		setTimeout(() => {
			this.getPathFight()
		}, 500)
	}

    getPathFight() {
        const { pathname } = this.props.location;
		const idFight = pathname.replace('/fight/', '')

        //console.log(idFight)

        if (idFight.includes('fight')) {
            //errore!
            this.setState({ error: 'Ops.. it looks like something has gone wrong', loading: false })
        }
        else {
            this.loadFight(idFight)
        }

    }

    async loadFight(idFight) {
        const docRef = doc(firebasedb, "fights", idFight)
        const docSnap = await getDoc(docRef)

        //console.log(docSnap.data());

        const data = docSnap.data()

        let actionsDict = {}

        if (data.info2 && data.info2.defense) {

            actionsDict[`${data.idnft1}_initialhp`] = data.info1.hp
            this.dataCurrentHP[`#${data.idnft1}`] = data.info1.hp

            actionsDict[`${data.idnft2}_initialhp`] = data.info2.hp
            this.dataCurrentHP[`#${data.idnft2}`] = data.info2.hp
            actionsDict['actions'] = []

            for (var i = 0; i < data.actions.length; i++) {
                const d = data.actions[i]

                const arrayOfWords = d.split(" ")
                //console.log(arrayOfWords);

                const idxHits = arrayOfWords.findIndex(i => i === "hits")
                if (idxHits > -1) {
                    //console.log(idxHits);
                    let whoLoseDmg = arrayOfWords[idxHits+1].replace(",", "")
                    const whoDealDmg = arrayOfWords[idxHits-1].replace(",", "")

                    const idxDeals = arrayOfWords.findIndex(i => i === "deals")
                    if (idxDeals > -1) {
                        const dmg = parseInt(arrayOfWords[idxDeals+1])
                        //console.log("dmg = ", dmg);

                        const obj = { [whoLoseDmg]: dmg, [whoDealDmg]: 0, hasAction: true }
                        actionsDict['actions'].push(obj)
                    }
                    else {
                        let whoLoseDmg = arrayOfWords[idxHits+2]

                        const obj = { [whoLoseDmg]: 100, [whoDealDmg]: 0, hasAction: true }
                        actionsDict['actions'].push(obj)
                    }
                }
                else {
                    actionsDict['actions'].push({ hasAction: false })
                }
            }

            //console.log(actionsDict);
        }

        this.setState({ actions: data.actions, tournament: data.tournament, winner: data.winner, actionsDict })

        //per quando non ci sono accoppiamenti
        if (data.actions[0].includes("to show up")) {
            this.setState({ showOnlyOne: true })

            if (data.info1 && data.info1.defense) {
                this.setState({ u1: data.info1, loading: false })

                this.loadLevel(data.info1)
            }
            else {
                this.loadNft('u1', data.idnft1)
            }
        }
        else {
            if (data.info1 && data.info1.defense) {
                this.setState({ u1: data.info1 })

                this.loadLevel(data.info1)
            }
            else {
                this.loadNft('u1', data.idnft1)
            }

            if (data.info2 && data.info2.defense) {
                this.setState({ u2: data.info2, loading: false })

                this.loadLevel(data.info2)
            }
            else {
                this.loadNft('u2', data.idnft2)
            }
        }
    }

    //callback method if no info nft in fight object
    loadNft(u, idNft) {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		this.props.loadSingleNft(chainId, gasPrice, gasLimit, networkUrl, idNft, (response) => {
            //console.log(response);
			if (response.name) {
				//console.log(response)
				this.loadStats(u, idNft, response)
			}
			else {
				this.setState({ error: 'Ops.. it looks like something has gone wrong', loading: false })
			}
		})
	}

    async loadStats(u, idNft, infoNft) {
		const docRef = doc(firebasedb, "stats", `#${idNft}`)

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

		if (data) {
			//console.log(data)

            let finalO = Object.assign(infoNft, data)

            //console.log(finalO)
            this.loadLevel(data)

			this.setState({ [u]: finalO }, () => {
                if (this.state.showOnlyOne) {
                    this.setState({ loading: false })
                }
                else {
                    if (this.state.u1 && this.state.u2) {
                        this.setState({ loading: false })
                    }
                }

            })
		}
		else {
			console.log('no stats');
		}
	}

    stepFight() {
        const { actions, actionsDict } = this.state

        const fightActions = Object.assign([], this.state.fightActions)

        if (actions[this.indexFightActions]) {

            const obj = {
                action: actions[this.indexFightActions],
                turn: this.indexFightActions+1
            }

            fightActions.splice(0, 0, obj)

            const currentAction = actionsDict.actions[this.indexFightActions]
            //console.log(currentAction);

            if (currentAction.hasAction) {
                //console.log(currentAction);

                Object.keys(currentAction).map(key => {
                    if (this.dataCurrentHP[key]) {
                        this.dataCurrentHP[key] = this.dataCurrentHP[key] - currentAction[key]
                    }
                })

                //console.log(this.dataCurrentHP);
            }

            this.indexFightActions += 1

            const element = document.getElementById("mainBox")

            this.setState({ fightActions })
            /*
            setTimeout(() => {
                //console.log(window.scrollY);
                window.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
            }, 100)
            */

            setTimeout(() => {
                this.stepFight()
            }, 2000)
        }
    }

    loadLevel(info) {
        const { tournament } = this.state
        //console.log(tournament);

        let tournamentNumber = tournament.split("_")[0].replace("t", "")

        //console.log(info);

        const objLevel = {
            hp: { int: info.hp },
            defense: { int: info.defense },
            attack: { int: info.attack },
            damage: { int: info.damage },
            speed: {int: info.speed ? info.speed : 0 }
        }

        //console.log(objLevel);

        if (info.potion && info.potion === "hp") {
            if (parseInt(tournamentNumber) <= 11) {
                info["hp"] = info.hp + 5
            }
            else {
                info["hp"] = info.hp + 8
            }
        }

        if (info.potion && info.potion === "defense") {
            info["defense"] = info.defense + 2
        }

        if (info.potion && info.potion === "attack") {
            info["attack"] = info.attack + 2
        }

        if (info.potion && info.potion === "damage") {
            if (parseInt(tournamentNumber) <= 11) {
                info["damage"] = info.damage + 3
            }
            else {
                info["damage"] = info.damage + 4
            }
        }

        if (info.potion && info.potion === "speed") {
            info["speed"] = info.speed ? info.speed + 4 : 4
        }

        const level = calcLevelWizard(objLevel)


        const levels = Object.assign({}, this.state.levels)
        levels[info.id] = level

        this.setState({ levels })
    }

    renderSingleNft(info, width) {
        const { levels } = this.state

        //console.log(info);

        let infoEquipment;
        if (info.ring && info.ring.bonus) {
            infoEquipment = getRingBonuses(info.ring)
        }

        return (
            <div className="containerChoice" style={{ marginRight: 0, width, height: '100%' }}>
                <img
                    style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2, marginBottom: 10 }}
                    src={getImageUrl(info.id, "1")}
                    alt={`#${info.id}`}
                />

                <div style={{ width: '80%', marginBottom: 5 }}>
                    {
                        info.nickname ?
                        <p style={{ color: 'white', fontSize: 18 }}>
                            {info.name} {info.nickname}
                        </p>
                        :
                        <p style={{ color: 'white', fontSize: 19 }}>
                            {info.name}
                        </p>
                    }
                </div>

                <div style={{ width: '80%', marginBottom: 5, alignItems: 'center' }}>
                    <p style={{ color: '#c2c0c0', fontSize: 16, marginRight: 8 }}>
                        LEVEL
                    </p>

                    <p style={{ color: getColorTextBasedOnLevel(levels[info.id]), fontSize: 20 }}>
                        {levels[info.id]}
                    </p>
                </div>

                {cardStats(info, undefined, '80%', infoEquipment ? infoEquipment.bonusesDict : undefined)}
            </div>
        )
    }

    renderAction(item, index, boxW) {
        return (
            <div key={index} style={{ width: boxW, marginBottom: 15 }}>
                <p style={{ fontSize: 14, color: TEXT_SECONDARY_COLOR, width: 78, minWidth: 78 }}>
                    turn {index+1}:
                </p>

                <p style={{ fontSize: 16, color: 'white' }}>
                    {item.trim()}
                </p>
            </div>
        )
    }

    renderActionFight(item, index, boxW) {
        return (
            <div key={index} style={{ width: boxW, marginBottom: 15 }}>
                <p style={{ fontSize: 14, color: TEXT_SECONDARY_COLOR, width: 78, minWidth: 78 }}>
                    turn {item.turn}:
                </p>

                <p style={{ fontSize: 16, color: 'white' }}>
                    {item.action.trim()}
                </p>
            </div>
        )
    }

    calcWidthHp(width, max, current) {
        //console.log(width, max, current);
        let w = width * current / max
        if (w < 0) {
            w = 0
        }

        return w
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

    renderBody(isMobile) {
        const { u1, u2, actions, winner, error, showOnlyOne, actionsDict, showResult, showBar, fightActions } = this.state

        let boxW = Math.floor(window.innerWidth * (isMobile ? 90 : 70) / 100)
		if (boxW > 900) boxW = 900;

		let spaceImage = (boxW / 2) - 40
        if (spaceImage > 400) {
            spaceImage = 400
        }

        if (error) {
            return (
                <div style={{ justifyContent: 'center', alignItems: 'center', marginTop: 50, width: boxW }}>
                    <p style={{ fontSize: 22, color: 'white' }}>
                        {error}
                    </p>
                </div>
            )
        }

        if (showOnlyOne && u1) {
            return (
                <div style={{ flexDirection: 'column', width: boxW, marginTop: 30, alignItems: 'center' }}>

                    <div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>

                        {this.renderSingleNft(u1, spaceImage)}
                    </div>

                    <p style={{ fontSize: 22, marginBottom: 15, color: TEXT_SECONDARY_COLOR }}>
                        ACTIONS
                    </p>

                    {actions && actions.map((item, index) => this.renderAction(item, index, boxW))}

                    <p style={{ fontSize: 22, marginTop: 10, marginBottom: 10, color: TEXT_SECONDARY_COLOR }}>
                        WINNER
                    </p>

                    <p style={{ fontSize: 32, color: TEXT_SECONDARY_COLOR, marginBottom: 30  }}>
                        #{winner}
                    </p>

                </div>
            )
        }

        if (!u1 || !u2) {
            return <div></div>
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 30, alignItems: 'center' }} id="mainBox">

                <div style={{ width: boxW, justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>

                    <div style={{ flexDirection: 'column' }}>
                        {this.renderSingleNft(u1, spaceImage)}

                        {
                            showBar &&
                            <div style={{ width: spaceImage, height: 16, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', borderRadius: 2, alignItems: 'center' }}>
                                <div
                                    className="hpBar"
                                    style={{ width: this.calcWidthHp(spaceImage, actionsDict[`${u1.id}_initialhp`], this.dataCurrentHP[`#${u1.id}`]), height: 16, backgroundColor: this.getColorHpBar(this.dataCurrentHP[`#${u1.id}`], actionsDict[`${u1.id}_initialhp`]) }}
                                />
                            </div>
                        }
                    </div>

                    <p style={{ fontSize: 28, color: TEXT_SECONDARY_COLOR }}>
                        VS
                    </p>

                    <div style={{ flexDirection: 'column' }}>
                        {this.renderSingleNft(u2, spaceImage)}

                        {
                            showBar &&
                            <div style={{ width: spaceImage, height: 16, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', borderRadius: 2 }}>
                                <div
                                    className="hpBar"
                                    style={{ width: this.calcWidthHp(spaceImage, actionsDict[`${u2.id}_initialhp`], this.dataCurrentHP[`#${u2.id}`]), height: 16, backgroundColor: this.getColorHpBar(this.dataCurrentHP[`#${u2.id}`], actionsDict[`${u2.id}_initialhp`]) }}
                                />
                            </div>
                        }
                    </div>
                </div>

                {
                    !showResult && !showBar &&
                    <div style={{ justifyContent: 'space-around', alignItems: 'center' }}>
                        <button
                            style={Object.assign({}, styles.btnChoice, { marginRight: 50 })}
                            onClick={() => this.setState({ showResult: true })}
                        >
                            <p style={{ fontSize: 17, color: 'white' }}>
                                SHOW RESULT
                            </p>
                        </button>

                        <button
                            style={styles.btnChoice}
                            onClick={() => {
                                this.setState({ showBar: true }, () => {
                                    setTimeout(() => {
                                        this.stepFight()
                                    }, 500)
                                })

                            }}
                        >
                            <p style={{ fontSize: 17, color: 'white' }}>
                                SHOW FIGHT
                            </p>
                        </button>
                    </div>
                }

                {
                    showResult &&
                    <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <p style={{ fontSize: 22, marginBottom: 15, color: TEXT_SECONDARY_COLOR }}>
                            ACTIONS
                        </p>

                        {actions && actions.map((item, index) => this.renderAction(item, index, boxW))}

                        <p style={{ fontSize: 22, marginTop: 10, marginBottom: 10, color: TEXT_SECONDARY_COLOR }}>
                            WINNER
                        </p>

                        <p style={{ fontSize: 32, color: TEXT_SECONDARY_COLOR, marginBottom: 30  }}>
                            #{winner}
                        </p>
                    </div>
                }

                {
                    showBar &&
                    <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <p style={{ fontSize: 22, marginBottom: 15, color: TEXT_SECONDARY_COLOR }}>
                            ACTIONS
                        </p>

                        {fightActions && fightActions.map((item, index) => this.renderActionFight(item, index, boxW))}

                        {
                            fightActions.length === actions.length &&
                            <div style={{ flexDirection: 'column' }}>
                                <p style={{ fontSize: 22, marginTop: 10, marginBottom: 10, color: TEXT_SECONDARY_COLOR }}>
                                    WINNER
                                </p>

                                <p style={{ fontSize: 32, color: TEXT_SECONDARY_COLOR, marginBottom: 30  }}>
                                    #{winner}
                                </p>
                            </div>
                        }

                    </div>
                }

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='settings'
					account={account}
					isMobile={isMobile}
                    history={this.props.history}
				/>
			</div>
		)
	}

    render() {
        const { loading } = this.state

		return (
			<div style={styles.container}>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderTopHeader(false)}
				/>

                {
					loading &&
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
				}

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
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
    btnChoice: {
        width: 180,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR,
        borderRadius: 2
    }
}

const mapStateToProps = (state) => {
	const { account, netId, chainId, gasPrice, gasLimit, networkUrl } = state.mainReducer;

	return { account, netId, chainId, gasPrice, gasLimit, networkUrl };
}

export default connect(mapStateToProps, {
    setNetworkUrl,
    setNetworkSettings,
    loadSingleNft
})(Fight)
