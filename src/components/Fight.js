import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import { doc, getDoc } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Header from './Header'
import getImageUrl from './common/GetImageUrl'
import cardStats from './common/CardStats'
import { calcLevelWizard, getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import { MAIN_NET_ID, BACKGROUND_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadSingleNft
} from '../actions'
import '../css/NftCardChoice.css'

class Fight extends Component {
    constructor(props) {
        super(props)

        this.state = {
			loading: true,
            actions: [],
            tournament: undefined,
            winner: undefined,
            u1: undefined,
            u2: undefined,
            error: '',
            showOnlyOne: false
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
        this.setState({ actions: data.actions, tournament: data.tournament, winner: data.winner })

        if (data.actions[0].includes("to show up")) {
            this.setState({ showOnlyOne: true })

            if (data.info1 && data.info1.defense) {
                this.setState({ u1: data.info1, loading: false })
            }
            else {
                this.loadNft('u1', data.idnft1)
            }
        }
        else {
            if (data.info1 && data.info1.defense) {
                this.setState({ u1: data.info1 })
            }
            else {
                this.loadNft('u1', data.idnft1)
            }

            if (data.info2 && data.info2.defense) {
                this.setState({ u2: data.info2, loading: false })
            }
            else {
                this.loadNft('u2', data.idnft2)
            }
        }
    }

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

    renderSingleNft(info, width) {
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
            info["speed"] = info.speed + 4
        }


        const level = calcLevelWizard(objLevel)

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

                    <p style={{ color: getColorTextBasedOnLevel(level), fontSize: 20 }}>
                        {level}
                    </p>
                </div>

                {cardStats(info, undefined, '80%')}
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

    renderBody(isMobile) {
        const { u1, u2, actions, winner, error, showOnlyOne } = this.state

        let boxW = Math.floor(window.innerWidth * (isMobile ? 90 : 70) / 100)
		if (boxW > 1100) boxW = 1100;

		let spaceImage = (boxW / 2) - 40

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
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 30, alignItems: 'center' }}>

                <div style={{ width: boxW, justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>

                    {this.renderSingleNft(u1, spaceImage)}

                    <p style={{ fontSize: 28, color: TEXT_SECONDARY_COLOR }}>
                        VS
                    </p>

                    {this.renderSingleNft(u2, spaceImage)}
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
