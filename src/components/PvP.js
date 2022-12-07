import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDoc, doc } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import ModalTransaction from './common/ModalTransaction'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import NftCardChoicePvP from './common/NftCardChoicePvP'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
    getPvPweek,
    getPvPopen,
    subscribeToPvPweek,
    getAllSubscribersPvP,
    setSfida
} from '../actions'
import { BACKGROUND_COLOR, MAIN_NET_ID, TEXT_SECONDARY_COLOR, CTA_COLOR } from '../actions/types'
import '../css/Nft.css'


class PvP extends Component {
    constructor(props) {
        super(props)

        let isConnected = this.props.account && this.props.account.account

        this.state = {
            loading: true,
            isConnected,
            showModalConnection: false,
            typeModal: 'subscribe_pvp',
            nameNftToSubscribe: '',
            pvpOpen: false,
            pvpWeek: "",
            subscribers: [],
            yourSubscribers: [],
            yourSubscribersResults: [],
            userMintedNfts: []
        }
    }

    componentDidMount() {
		document.title = "PvP - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
			this.loadProfile()
		}, 500)
	}

    loadProfile() {
        this.loadPvpWeek()
        this.loadPvpOpen()
	}

    loadPvpWeek() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPvPweek(chainId, gasPrice, gasLimit, networkUrl, (res) => {
            this.setState({ pvpWeek: res })
            this.loadAllSubscribers(res)
            this.loadMinted()
        })
    }

    loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {
				this.setState({ loading: false, userMintedNfts: response })
			})
		}
	}

    loadPvpOpen() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPvPopen(chainId, gasPrice, gasLimit, networkUrl, (res) => {
            this.setState({ pvpOpen: res === "1" })
        })
    }

    loadAllSubscribers(week) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getAllSubscribersPvP(chainId, gasPrice, gasLimit, networkUrl, week, (res) => {
            //console.log(res);
            this.setState({ subscribers: res })
        })
    }

    subscribe(id, spellSelected) {
        const { account, chainId, gasPrice, netId } = this.props
        const { pvpWeek } = this.state

        this.setState({ nameNftToSubscribe: `#${id}` })

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

        this.props.subscribeToPvPweek(chainId, gasPrice, 5000, netId, account, pvpWeek, id, refactorSpellSelected)
    }

    sortById() {
        const { userMintedNfts } = this.state

        let sorted = []

        if (userMintedNfts && userMintedNfts.length > 0) {
            sorted = userMintedNfts.sort((a, b) => {
                return parseInt(a.id) - parseInt(b.id)
            })
        }

        return sorted
    }

    async loadResultsYourSub(item) {
        const { pvpWeek } = this.state

        const docRef = doc(firebasedb, "pvp_results", `${pvpWeek}_#${item.idnft}`)

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

        const finalData = {...data, ...item}

        //console.log(finalData);

        const temp = Object.assign([], this.state.yourSubscribersResults)

        //console.log(temp);

        temp.push(finalData)

        this.setState({ yourSubscribersResults: temp })
    }

    chooseOpponent(item) {
        const { subscribers, pvpWeek } = this.state

        this.setState({ loading: true })

        //rimuoviamo se stessi
        let subs = subscribers.filter(i => i.idnft !== item.idnft)

        //console.log(subs);

        if (subs.length === 0) {
            this.setState({ loading: false })
            return
        }

        const idxRandom = Math.floor(Math.random() * subs.length) //da 0 a subs.length -1

        let opponent = subs[idxRandom]

        const sfida = {
            player1: item,
            player2: opponent,
            pvpWeek: pvpWeek
        }

        //console.log(sfida);

        this.props.setSfida(sfida)

        this.setState({ loading: false }, () => {
            this.props.history.push('/fightpvp')
        })
    }

    calcWinRate(item) {

        const lose = item.lose
        const win = item.win

        const totalFights = lose + win

        const winRate = Math.round(win * 100 / totalFights)

        if (!winRate) {
            return 0
        }

        return winRate
    }

    renderRowChoise(item, index, modalWidth) {
        const { pvpWeek, pvpOpen } = this.state


        if (!item.attack) {
            return <div key={index} />
        }

		return (
            <NftCardChoicePvP
				key={index}
				item={item}
				width={230}
				pvpWeek={pvpWeek}
				canSubscribe={pvpOpen}
				onSubscribe={(spellSelected) => this.subscribe(item.id, spellSelected)}
				modalWidth={modalWidth}
                isSubscribed={(item) => {
                    let oldState = Object.assign([], this.state.yourSubscribers)

                    //console.log(oldState);

                    const idx = oldState.findIndex(i => i.idnft === item.idnft)
                    if (idx < 0) {
                        oldState.push(item)
                        //console.log(item);
                        this.loadResultsYourSub(item)
                        this.setState({ yourSubscribers: oldState })
                    }
                }}
			/>
		)
	}

    renderRowSub(item, index) {
        //console.log(item);
        const { pvpOpen } = this.state

        const winRate = this.calcWinRate(item)

        return (
            <div
                key={index}
                style={{ marginBottom: 20, alignItems: 'center' }}
            >
                <img
                    src={getImageUrl(item.idnft)}
                    style={{ width: 140, height: 140, borderRadius: 2, borderColor: 'white', borderWidth: 1, borderStyle: 'solid', marginRight: 10 }}
                    alt={item.idnft}
                />

                <p style={{ fontSize: 22, color: 'white', marginRight: 30, width: 50 }}>
                    #{item.idnft}
                </p>

                <p style={{ fontSize: 22, color: 'white', marginRight: 30, width: 180 }}>
                    WIN RATE {winRate}%
                </p>

                {
                    this.state.loading ?
                    <div
                        style={styles.btnPlay}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            LOADING...
                        </p>
                    </div>
                    :
                    null
                }

                {
                    pvpOpen && !this.state.loading ?
                    <button
                        className="btnH"
                        style={styles.btnPlay}
                        onClick={() => {
                            if (this.state.loading) {
                                return
                            }

                            this.chooseOpponent(item)
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            FIGHT
                        </p>
                    </button>
                    : null
                }

            </div>
        )
    }

    renderBody(isMobile) {
        const { isConnected, showModalConnection, pvpOpen, subscribers, yourSubscribersResults } = this.state
        const { account, showModalTx } = this.props

        const { boxW, modalW } = getBoxWidth(isMobile)

        if (!account || !account.account || !isConnected) {

			return (
				<div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: boxW, marginTop: 30 }}>

					<img
						src={getImageUrl(undefined)}
						style={{ width: 340, height: 340, borderRadius: 2, marginBottom: 30 }}
						alt='Placeholder'
					/>

					<p style={{ fontSize: 23, color: 'white', textAlign: 'center', width: 340, marginBottom: 30, lineHeight: 1.2 }}>
						Connect your wallet and enter the Arena
					</p>

					<button
						className='btnH'
						style={styles.btnConnect}
						onClick={() => this.setState({ showModalConnection: true })}
					>
						<p style={{ fontSize: 19, color: TEXT_SECONDARY_COLOR }}>
							Connect wallet
						</p>
					</button>

					<ModalConnectionWidget
						width={modalW}
						showModal={showModalConnection}
						onCloseModal={() => {
							this.setState({ showModalConnection: false, isConnected: true }, () => {
								setTimeout(() => {
									this.loadProfile()
								}, 500)
							})
						}}
					/>
				</div>
			)
		}


        const sorted = this.sortById()

        return (
            <div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>

                <div style={{ marginBottom: 30 }}>
                    <div style={{  flexDirection: "column" }}>
                        <p style={{ fontSize: 19, color: 'white', marginBottom: 10 }}>
                            PVP OPEN: {pvpOpen ? "YES" : "NO"}
                        </p>

                        <p style={{ fontSize: 19, color: 'white' }}>
                            PVP BUYIN: FREE
                        </p>
                    </div>

                    <p style={{ fontSize: 19, color: 'white', marginLeft: 50 }}>
                        SUBSCRIBERS {subscribers.length}
                    </p>
                </div>

                <p style={{ fontSize: 22, color: 'white', marginBottom: 10 }}>
                    Select the wizard you want to enroll in the PvP Arena
                </p>

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                <div style={{ overflow: 'scroll', marginBottom: 30 }}>
                    {
                        sorted && sorted.length > 0 &&
                        sorted.map((item, index) => {
                            return this.renderRowChoise(item, index, modalW)
                        })
                    }

                </div>

                <p style={{ fontSize: 22, color: 'white', marginBottom: 10 }}>
                    Your Wizards in the arena ({yourSubscribersResults.length})
                </p>

                <div style={{ flexDirection: 'column', overflow: 'scroll', marginBottom: 30 }}>
                    {
                        yourSubscribersResults && yourSubscribersResults.length > 0 &&
                        yourSubscribersResults.map((item, index) => {
                            return this.renderRowSub(item, index)
                        })
                    }

                </div>


                <ModalTransaction
					showModal={showModalTx}
					width={modalW}
					type={this.state.typeModal}
					mintSuccess={() => {
						this.props.clearTransaction()
						window.location.reload()
					}}
					mintFail={() => {
						this.props.clearTransaction()
						window.location.reload()
					}}
					nameNft={this.state.nameNftToSubscribe}
                    pvpWeek={this.state.pvpWeek}
				/>

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={7}
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
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderTopHeader(false)}
				/>

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
    btnConnect: {
		width: 340,
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
		borderColor: CTA_COLOR,
		borderWidth: 2,
		borderStyle: 'solid'
	},
    btnPlay: {
        height: 40,
        width: 200,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    },
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts };
}

export default connect(mapStateToProps, {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
    getPvPweek,
    getPvPopen,
    subscribeToPvPweek,
    getAllSubscribersPvP,
    setSfida
})(PvP)
