import React, { Component } from 'react'
import Media from 'react-media';
import { connect } from 'react-redux'
import moment from 'moment'
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import DotLoader from 'react-spinners/DotLoader';
import { AiFillCheckCircle } from 'react-icons/ai'
import Popup from 'reactjs-popup';
import NftCardTournament from './common/NftCardTournament'
import NftCardChoice from './common/NftCardChoice'
import CardSingleFightProfile from './common/CardSingleFightProfile'
import Header from './Header'
import ModalTransaction from './common/ModalTransaction'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import convertMedalName from './common/ConvertMedalName'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import { MAIN_NET_ID, BACKGROUND_COLOR, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import {
    getBuyin,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getSubscribed,
    loadUserMintedNfts,
    loadEquipMinted,
    subscribeToTournamentMass,
    clearTransaction,
    subscribeToTournamentMassWIZA
} from '../actions'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';


class Tournament extends Component {
    constructor(props) {
		super(props)

		this.state = {
            typeModal: "subscription",
            nameNftSubscribed: "",
            tournament: {},
            tournamentWiza: {},
			tournamentKdaSubs: 0,
            tournamentWizaSubs: 0,
            loading: true,
            avgLevelKda: 0,
            avgLevelWiza: 0,
            profileFights: {},
            showProfileFights: false,
            showSubs: false,
            yourSubs: [],
            tournamentSubs: {},
            toSubscribe: [],
			equipment: [],
            montepremiWiza: 0
		}
	}

    componentDidMount() {
		document.title = "Tournament Intro - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadTournamentKda()
            this.loadTournamentWiza()
        }, 500)
	}

    loadMinted(tournament, isResults, isSubs) {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.setState({ loading: true, showSubs: false, showProfileFights: false })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
                if (isResults) {
                    this.loadProfileFights(tournament)
                }

                if (isSubs) {
                    this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                        //console.log(response);
                        this.setState({ equipment: response }, () => {
                            this.loadSubs(tournament)
                        })
        			})

                }
            })
		}
	}

    async loadTournamentKda() {
        const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

        const querySnapshot = await getDocs(collection(firebasedb, "stage"))

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
			const tournament = doc.data()

            /*
            const tournament = {
                canSubscribe: false,
                nRounds: 6,
                name: "t7_r1",
                roundEnded: "0",
                showPair: true,
                start: {seconds: 1671715800, nanoseconds: 843000000},
                tournamentEnd: false
            }
            */

            this.setState({ tournament }, async () => {

				this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl, "buyin-key")
				this.props.getFeeTournament(chainId, gasPrice, gasLimit, networkUrl, "fee-tournament-key")

                const tournamentName = tournament.name.split("_")[0]

                this.props.getSubscribed(chainId, gasPrice, gasLimit, networkUrl, tournamentName, "kda", (subscribed) => {

                    //console.log(subscribed);
                    const avgLevel = this.calcAvgLevel(subscribed)
                    //console.log(avgLevel);

                    this.setState({ tournamentKdaSubs: subscribed.length, avgLevelKda: avgLevel, loading: false })
                })

            })
        })
    }

    async loadTournamentWiza() {
        const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

        const querySnapshot = await getDocs(collection(firebasedb, "stage_low"))

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
			const tournament = doc.data()

            /*
            const tournament = {
                canSubscribe: false,
                nRounds: 6,
                name: "t7_r1",
                roundEnded: "0",
                showPair: true,
                start: {seconds: 1671715800, nanoseconds: 843000000},
                tournamentEnd: false
            }
            */

            this.setState({ tournamentWiza: tournament }, async () => {

				this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl, "buyin-wiza-key")
				this.props.getFeeTournament(chainId, gasPrice, gasLimit, networkUrl, "fee-tournament-wiza-key")

                const tournamentName = tournament.name.split("_")[0]

                this.props.getSubscribed(chainId, gasPrice, gasLimit, networkUrl, tournamentName, "wiza", (subscribed) => {

                    //console.log(subscribed);
                    const avgLevel = this.calcAvgLevel(subscribed)
                    //console.log(avgLevel);

                    this.setState({ tournamentWizaSubs: subscribed.length, avgLevelWiza: avgLevel, loading: false })
                })

            })
        })
    }

    calcAvgLevel(array) {
        let sum = 0
        array.map(i => {
            if (i.level) {
                sum += i.level
            }
        })

        return Math.round(sum / array.length)
    }

    loadProfileFights(tournament) {
		const { userMintedNfts } = this.props

		const tournamentName = tournament.name.split("_")[0]
		//console.log(tournamentName);

		let profileFights = []

		for (let i = 0; i < userMintedNfts.length; i++) {
			const s = userMintedNfts[i]
			//console.log(s);
			const fights = s.fights

			if (fights.length > 0) {
				let fightsPerTournamentName = fights.filter(i => i.tournament.includes(tournamentName))
				//console.log(fightsPerTournamentName);

				fightsPerTournamentName.map(i => {
					i['name'] = s.name
					profileFights.push(i)
				})
			}
		}

		profileFights.sort((a, b) => {
			if (parseInt(a.tournament[a.tournament.length - 1]) === 0) return 1;
			if (parseInt(b.tournament[b.tournament.length - 1]) === 0) return -1
			return parseInt(a.tournament[a.tournament.length - 1]) - parseInt(b.tournament[b.tournament.length - 1])
		})

		//console.log(profileFights);

		let fightsPerRound = {}

		for (var i = 0; i < profileFights.length; i++) {
			const singleF = profileFights[i]

			if (!fightsPerRound[singleF.tournament]) {
				fightsPerRound[singleF.tournament] = []
			}

			fightsPerRound[singleF.tournament].push(singleF)
		}

		//console.log(fightsPerRound);

		this.setState({ profileFights: fightsPerRound, loading: false, showProfileFights: true, showSubs: false })
	}

    loadSubs(tournament) {
        const { userMintedNfts } = this.props

        const levelCap = tournament.levelCap

        //console.log(userMintedNfts);

        let yourSubs = userMintedNfts.filter(i => i.level <= levelCap)

        this.setState({ yourSubs, showSubs: true, showProfileFights: false, tournamentSubs: tournament, loading: false })

    }

    subscribe(idNft, spellSelected) {
		const { account, buyin, feeTournament, buyinWiza, feeTournamentWiza } = this.props
		const { tournamentSubs } = this.state

		if (!buyin || !feeTournament || !buyinWiza || !feeTournamentWiza || !spellSelected || !spellSelected.name) {
			return
		}

		let refactorSpellSelected = { name: spellSelected.name }

		const tNumber = tournamentSubs.name.split("_")[0]

		let obj = {
			spellSelected: refactorSpellSelected,
			idnft: idNft,
			id: `${tNumber}_${idNft}`,
			round: tNumber,
			address: account.account
		}

		const toSubscribe = Object.assign([],  this.state.toSubscribe)
		toSubscribe.push(obj)

		this.setState({ toSubscribe })
	}

    subscribeMassKda() {
		const { chainId, gasPrice, netId, account, buyin } = this.props
		const { toSubscribe } = this.state

		const tot = toSubscribe.length * buyin

		this.setState({ nameNftSubscribed: `You will subscribe ${toSubscribe.length} wizards for ${tot} KDA`, typeModal: "subscriptionmass" })

		this.props.subscribeToTournamentMass(chainId, gasPrice, 3000, netId, account, buyin, toSubscribe)
	}

    subscribeMassWiza() {
		const { chainId, gasPrice, netId, account, buyinWiza } = this.props
		const { toSubscribe } = this.state

		const tot = toSubscribe.length * buyinWiza

		this.setState({ nameNftSubscribed: `You will subscribe ${toSubscribe.length} wizards for ${tot} WIZA`, typeModal: "subscriptionmass" })

		this.props.subscribeToTournamentMassWIZA(chainId, gasPrice, 3000, netId, account, toSubscribe)
	}


    renderBtnOpenTournament(goto) {
        return (
            <a
                href={`${window.location.protocol}//${window.location.host}/${goto}`}
                className='btnH'
                style={styles.btnSubscribe}
                onClick={(e) => {
                    e.preventDefault()
                    this.props.history.push(`/${goto}`)
                }}
            >
                <p style={{ fontSize: 17, color: 'white', textAlign: 'center' }}>
                    Open Tournament
                </p>
            </a>
        )
    }

    renderBtnYourResults(tournament) {
        return (
            <button
                className='btnH'
                style={styles.btnSubscribe}
                onClick={() => {
                    this.loadMinted(tournament, true, false)
                }}
            >
                <p style={{ fontSize: 17, color: 'white' }}>
                    Your results
                </p>
            </button>
        )
    }

    renderBtnSubscribe(tournament) {
        return (
            <button
                className='btnH'
                style={styles.btnSubscribe}
                onClick={() => {
                    this.loadMinted(tournament, false, true)
                }}
            >
                <p style={{ fontSize: 17, color: 'white', textAlign: 'center' }}>
                    Subscribe your wizards
                </p>
            </button>
        )
    }

    renderFooterSubscribe(isMobile) {
		const { toSubscribe, tournamentSubs } = this.state

		let temp = []
		toSubscribe.map(i => {
			temp.push(
				<Popup
					key={i.idnft}
					trigger={open => (
						<img
							style={{ width: 60, height: 60, borderRadius: 2, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', cursor: 'pointer' }}
							src={getImageUrl(i.idnft)}
							alt={`#${i.idnft}`}
						/>
					)}
					position="top center"
					on="hover"
				>
					<div style={{ padding: 10, fontSize: 16 }}>
						#{i.idnft} - Spell Selected: {i.spellSelected.name}
					</div>
				</Popup>
			)
		})

		const styleBox = isMobile ?
						{ flexDirection: 'column', alignItems: 'center', paddingBottom: 10, width: '100%' }
						:
						{ justifyContent: 'space-between', alignItems: 'center', flex: 1 }

		return (
			<div style={styleBox}>
				<div style={{ flexWrap: 'wrap', marginLeft: 20 }}>
					{temp}
				</div>

				<button
					className="btnH"
					style={{ width: 180, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 2, backgroundColor: CTA_COLOR, marginRight: 20 }}
					onClick={() => {
                        if (tournamentSubs.coinBuyin === "KDA") {
                            this.subscribeMassKda()
                        }
                        else {
                            this.subscribeMassWiza()
                        }

                    }}
				>
					<p style={{ fontSize: 17, color: 'white' }}>
						SUBSCRIBE
					</p>
				</button>
			</div>
		)
	}

    renderTournamentHigh(boxTournamentWidth) {
        const { tournament, tournamentKdaSubs, avgLevelKda } = this.state
        const { buyin, feeTournament } = this.props

        const wizaPrize = buyin && buyin * 30

        const fee = buyin * feeTournament / 100
        const totalFee = fee * tournamentKdaSubs
        let montepremi = (tournamentKdaSubs * buyin) - totalFee

        const tournamentName = tournament.name.split("_")[0]
        const tournamentValue = tournamentName.replace("t", "")
        const roundName = tournament.name.split("_")[1]
        const roundValue = roundName.replace("r", "")

        const dateStart = moment(tournament.start.seconds * 1000)
        //console.log(dateStart);

        let finalDate;
        if (tournament.canSubscribe) {
            const dateStartString = moment(dateStart).format("dddd, MMMM Do YYYY, h:mm:ss a");
            finalDate = `Start: ${moment().to(dateStart)}`
        }
        else if (!tournament.canSubscribe && !tournament.tournamentEnd && tournament.roundEnded === "0") {
            if (moment().isBefore(dateStart)) {
                finalDate = `The round ${roundValue} will start ${dateStart.fromNow()}`
            }
            else {
                finalDate = `Started ${dateStart.fromNow()}`
            }
        }

        const marginBottom = 23

        return (
            <div
                className="cardShopShadow"
                style={Object.assign({}, styles.boxTournament, { width: boxTournamentWidth })}
            >
                {
                    tournament.showLeague ?
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                        <p style={{ fontSize: 24, color: 'white' }}>
                            The Twelve League
                        </p>

                        <p style={{ fontSize: 18, color: 'gold' }}>
                            {tournament.leagueTournament}
                        </p>
                    </div>
                    : null
                }

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                    <p style={{ fontSize: 20, color: 'white' }}>
                        Tournament {tournamentValue}
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        Round {roundValue}
                    </p>
                </div>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                    <p style={{ fontSize: 20, color: 'white' }}>
                        Buyin <span style={{ color: 'gold' }}>{buyin}</span> $KDA
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        Fee {feeTournament}%
                    </p>
                </div>

                <p style={{ fontSize: 20, color: 'white', marginBottom }}>
                    Level CAP: <span style={{ color: 'gold' }}>{tournament.levelCap}</span>
                </p>

                <p style={{ fontSize: 17, color: 'white', marginBottom }}>
                    Structure: {tournament.structure}
                </p>

                <p style={{ fontSize: 20, color: 'white', marginBottom }}>
                    Prize <span style={{ color: 'gold' }}>{montepremi ? montepremi.toFixed(2) : '...'}</span> $KDA
                </p>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                    <p style={{ fontSize: 17, color: 'white' }}>
                        Subscribed <span style={{ color: 'gold' }}>{tournamentKdaSubs}</span>
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        AVG level <span style={{ color: 'gold' }}>{avgLevelKda || '...'}</span>
                    </p>
                </div>

                <p style={{ fontSize: 17, color: 'white', marginBottom, height: 55 }}>
                    Participation reward: (for each wizard) {wizaPrize || '...'} $WIZA, +1 spell or +1 AP if the wizard already has four spells
                </p>

                {
                    finalDate ?
                    <p style={{ fontSize: 17, color: 'white', marginBottom }}>
                        {finalDate}
                    </p>
                    :
                    <p style={{ height: 17, fontSize: 17, color: 'white', marginBottom }}>

                    </p>
                }

                <div style={{ alignItems: 'center' }}>
                    <p style={{ fontSize: 20, color: 'white', marginRight: 10 }}>
                        Registrations open
                    </p>

                    {
                        tournament.canSubscribe ?
                        <AiFillCheckCircle
                            color='green'
                            size={26}
                        />
                        :
                        <AiFillCheckCircle
                            color='#504f4f'
                            size={26}
                        />
                    }
                </div>

                {
                    tournament.canSubscribe ?
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: marginBottom }}>
                        {this.renderBtnSubscribe(tournament)}

                        {this.renderBtnOpenTournament('tournamentK')}

                    </div>
                    :
                    null
                }

                {
                    !tournament.canSubscribe &&
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: marginBottom }}>
                        {this.renderBtnYourResults(tournament)}

                        {this.renderBtnOpenTournament('tournamentK')}

                    </div>
                }

            </div>
        )
    }

    renderTournamentLow(boxTournamentWidth) {
        const { tournamentWiza, tournamentWizaSubs, avgLevelWiza } = this.state
        const { buyinWiza, feeTournamentWiza } = this.props

        const fee = buyinWiza * feeTournamentWiza / 100
        const totalFee = fee * tournamentWizaSubs
        let montepremi = (tournamentWizaSubs * buyinWiza) - totalFee

        const tournamentName = tournamentWiza.name.split("_")[0]
        const tournamentValue = tournamentName.replace("t", "")
        const roundName = tournamentWiza.name.split("_")[1]
        const roundValue = roundName.replace("r", "")

        const dateStart = moment(tournamentWiza.start.seconds * 1000)
        //console.log(dateStart);

        let finalDate;
        if (tournamentWiza.canSubscribe) {
            const dateStartString = moment(dateStart).format("dddd, MMMM Do YYYY, h:mm:ss a");
            finalDate = `Start: ${moment().to(dateStart)}`
        }
        else if (!tournamentWiza.canSubscribe && !tournamentWiza.tournamentEnd && tournamentWiza.roundEnded === "0") {
            if (moment().isBefore(dateStart)) {
                finalDate = `The round ${roundValue} will start ${dateStart.fromNow()}`
            }
            else {
                finalDate = `Started ${dateStart.fromNow()}`
            }
        }

        const marginBottom = 23

        return (
            <div
                className="cardShopShadow"
                style={Object.assign({}, styles.boxTournament, { width: boxTournamentWidth })}
            >
                {
                    tournamentWiza.showLeague ?
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                        <p style={{ fontSize: 24, color: 'white' }}>
                            The Twelve League
                        </p>

                        <p style={{ fontSize: 18, color: 'gold' }}>
                            {tournamentWiza.leagueTournament}
                        </p>
                    </div>
                    :
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                        <p style={{ fontSize: 24, color: 'white' }}>
                            The Apprentice Tournament
                        </p>
                    </div>
                }

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                    <p style={{ fontSize: 20, color: 'white' }}>
                        Tournament {tournamentValue}
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        Round {roundValue}
                    </p>
                </div>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                    <p style={{ fontSize: 20, color: 'white' }}>
                        Buyin <span style={{ color: 'gold' }}>{buyinWiza}</span> $WIZA
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        Fee {feeTournamentWiza}%
                    </p>
                </div>

                <p style={{ fontSize: 20, color: 'white', marginBottom }}>
                    Level CAP: <span style={{ color: 'gold' }}>{tournamentWiza.levelCap}</span>
                </p>

                <p style={{ fontSize: 17, color: 'white', marginBottom }}>
                    Structure: {tournamentWiza.structure}
                </p>

                <p style={{ fontSize: 20, color: 'white', marginBottom }}>
                    Prize <span style={{ color: 'gold' }}>{montepremi || '...'}</span> $WIZA
                </p>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                    <p style={{ fontSize: 17, color: 'white' }}>
                        Subscribed <span style={{ color: 'gold' }}>{tournamentWizaSubs}</span>
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        AVG level <span style={{ color: 'gold' }}>{avgLevelWiza || '...'}</span>
                    </p>
                </div>

                <p style={{ fontSize: 17, color: 'white', marginBottom, height: 55 }}>
                    Participation reward: (for each wizard) +3 AP
                </p>

                {
                    finalDate ?
                    <p style={{ fontSize: 17, color: 'white', marginBottom }}>
                        {finalDate}
                    </p>
                    :
                    <p style={{ height: 17, fontSize: 17, color: 'white', marginBottom }}>

                    </p>
                }

                <div style={{ alignItems: 'center' }}>
                    <p style={{ fontSize: 20, color: 'white', marginRight: 10 }}>
                        Registrations open
                    </p>

                    {
                        tournamentWiza.canSubscribe ?
                        <AiFillCheckCircle
                            color='green'
                            size={26}
                        />
                        :
                        <AiFillCheckCircle
                            color='#504f4f'
                            size={26}
                        />
                    }
                </div>

                {
                    tournamentWiza.canSubscribe ?
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: marginBottom }}>
                        {this.renderBtnSubscribe(tournamentWiza)}

                        {this.renderBtnOpenTournament('tournamentW')}

                    </div>
                    :
                    null
                }

                {
                    !tournamentWiza.canSubscribe &&
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: marginBottom }}>
                        {this.renderBtnYourResults(tournamentWiza)}

                        {this.renderBtnOpenTournament('tournamentW')}

                    </div>
                }

            </div>
        )
    }

    renderRoundFights(key) {
		const { profileFights } = this.state

		const roundName = key.split("_")[1].replace("r", "")
		const fights = profileFights[key]

		return (
			<div style={{ flexDirection: 'column' }} key={key}>
				<p style={{ fontSize: 30, color: 'white', marginBottom: 15 }}>
					ROUND {roundName}
				</p>

				<div style={{ flexWrap: 'wrap' }}>
					{fights && fights.map((item, index) => this.renderSingleFight(item, index))}
				</div>
			</div>
		)
	}

    renderSingleFight(item, index) {
		return (
			<CardSingleFightProfile
				history={this.props.history}
				userMintedNfts={this.props.userMintedNfts}
				item={item}
				key={index}
			/>
		)
	}

    renderRowChoise(item, index, modalWidth) {
		const { tournamentSubs, toSubscribe, equipment } = this.state

		return (
			<NftCardChoice
				key={index}
				item={item}
				width={230}
				tournament={tournamentSubs.name.split("_")[0]}
				canSubscribe={tournamentSubs.canSubscribe}
				onSubscribe={(spellSelected) => this.subscribe(item.id, spellSelected)}
				removeFromSubscribers={(idnft) => {
					let toSubscribe = Object.assign([], this.state.toSubscribe)

					const idx = toSubscribe.findIndex(i => i.idnft === idnft)
					if (idx > -1) {
						toSubscribe.splice(idx, 1)
					}
					this.setState({ toSubscribe })
				}}
				modalWidth={modalWidth}
				toSubscribe={toSubscribe}
				equipment={equipment}
			/>
		)
	}

    renderBody(isMobile) {
        const { tournament, tournamentWiza, profileFights, error, showProfileFights, showSubs, yourSubs } = this.state
        const { showModalTx } = this.props

        let { boxW, modalW } = getBoxWidth(isMobile)
        if (boxW > 1250) {
            boxW = 1250
        }

        if (!tournament.name || !tournamentWiza.name) {
            return (
                <div style={{ width: boxW, height: 50, justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
                    <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                </div>
            )
        }

        //console.log(tournament);
        let boxTournamentWidth = isMobile ? (boxW * 90 / 100) : (boxW - 60) / 2
        if (boxTournamentWidth > 420) {
            boxTournamentWidth = 420
        }

        return (
            <div style={{ width: boxW, flexDirection: 'column', justifyContent: 'center', flexWrap: 'wrap', paddingTop: 30 }}>

                <div style={{ width: boxW, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
                    {this.renderTournamentHigh(boxTournamentWidth)}

                    {this.renderTournamentLow(boxTournamentWidth)}
                </div>

                {
					this.state.loading ?
					<div style={{ width: boxW, height: 50, justifyContent: 'center', alignItems: 'center' }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                {
                    showProfileFights &&
                    <div style={{ flexDirection: 'column', width: '100%' }}>

                        <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                            {profileFights && Object.keys(profileFights).length > 0 && Object.keys(profileFights).reverse().map(key => this.renderRoundFights(key))}
                        </div>

                        <p style={{ fontSize: 15, color: 'red', marginTop: 10 }}>
                            {error}
                        </p>
                    </div>
                }

                {
                    showSubs &&
                    <div style={{ flexDirection: 'column', width: '100%' }}>

                        <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                            {yourSubs.map((item, index) => this.renderRowChoise(item, index, modalW))}
                        </div>

                        <p style={{ fontSize: 15, color: 'red', marginTop: 10 }}>
                            {error}
                        </p>
                    </div>
                }

                {
                    this.state.toSubscribe.length > 0 &&
                    <div style={styles.footerSubscribe}>
						{this.renderFooterSubscribe(isMobile)}
					</div>
                }

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
					nameNft={this.state.nameNftSubscribed}
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
					section={4}
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
    btnSubscribe: {
        width: 190,
		height: 45,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
        display: 'flex',
        cursor: 'pointer'
	},
    btnWait: {
        width: 190,
		height: 45,
		borderColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
        borderWidth: 2,
        borderStyle: 'solid',
        display: 'flex',
        cursor: 'pointer'
	},
    boxTournament: {
        borderRadius: 8,
        flexDirection: 'column',
        padding: 24,
        borderWidth: 2,
        borderColor: CTA_COLOR,
        borderStyle: 'solid',
        marginBottom: 20
    },
    footerSubscribe: {
		width: '100%',
		minHeight: 90,
		position: 'sticky',
		bottom: 0,
		left: 0,
		backgroundColor: BACKGROUND_COLOR,
		borderColor: 'white',
		borderStyle: 'solid',
		borderRadius: 2,
		borderTopWidth: 2,
		borderLeftWidth: 2,
		borderRightWidth: 2,
		borderBottomWidth: 0,
		paddingTop: 10
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, buyin, buyinWiza, feeTournament, feeTournamentWiza, userMintedNfts } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, buyin, buyinWiza, feeTournament, feeTournamentWiza, userMintedNfts };
}

export default connect(mapStateToProps, {
    getBuyin,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getSubscribed,
    loadUserMintedNfts,
    loadEquipMinted,
    subscribeToTournamentMass,
    clearTransaction,
    subscribeToTournamentMassWIZA
})(Tournament)
