import React, { Component } from 'react'
import Media from 'react-media';
import { connect } from 'react-redux'
import moment from 'moment'
import { collection, getDocs } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import DotLoader from 'react-spinners/DotLoader';
import { AiFillCheckCircle } from 'react-icons/ai'
import { IoClose } from 'react-icons/io5'
import Popup from 'reactjs-popup';
import NftCardChoice from './common/NftCardChoice'
import ModalSpellbook from './common/ModalSpellbook'
import CardSingleFightProfile from './common/CardSingleFightProfile'
import Header from './Header'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
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
    subscribeToTournamentMassWIZA,
    getSubscriptions,
    changeSpellTournament,
    subscribeToTournamentMassELITE,
    updateInfoTransactionModal
} from '../actions'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';


class Tournament extends Component {
    constructor(props) {
		super(props)

		this.state = {
            tournament: {},
            tournamentWiza: {},
            tournamentElite: {},
			tournamentKdaSubs: 0,
            tournamentWizaSubs: 0,
            tournamentEliteSubs: 0,
            loading: true,
            avgLevelKda: 0,
            avgLevelWiza: 0,
            avgLevelElite: 0,
            profileFights: {},
            showProfileFights: false,
            showSubs: false,
            yourSubs: [],
            tournamentSubs: {},
            toSubscribe: [],
			equipment: [],
            montepremiWiza: 0,
            statSearched: [],
            subscriptionsInfo: [],
            showModalSpellbook: false,
            wizardToChangeSpell: undefined
		}
	}

    componentDidMount() {
		document.title = "Tournament Intro - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadTournamentKda()
            this.loadTournamentWiza()
            this.loadTournamentElite()
        }, 500)
	}

    loadMinted(tournament, isResults, isSubs) {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.setState({ loading: true, showSubs: false, showProfileFights: false }, () => {
            document.getElementById("loading").scrollIntoView({ behavior: 'smooth' })
        })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (minted) => {
                if (isResults) {
                    this.loadProfileFights(tournament)
                }

                if (isSubs) {
                    this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                        //console.log(response);

                        let idsSubscription = []
                        const tName = tournament.name.split("_")[0]

                        minted.map(i => {
                            idsSubscription.push(`${tName}_${i.id}`)
                        })

                        this.props.getSubscriptions(chainId, gasPrice, gasLimit, networkUrl, idsSubscription, (subscriptions) => {
                            //console.log(subscriptions);

                            this.setState({ equipment: response, subscriptionsInfo: subscriptions }, () => {
                                this.loadSubs(tournament)
                            })
                        })


        			})

                }
            })
		}
	}

    async loadTournamentKda() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

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
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

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

    async loadTournamentElite() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        const querySnapshot = await getDocs(collection(firebasedb, "stage_elite"))

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

            this.setState({ tournamentElite: tournament }, async () => {

				this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl, "buyin-elite-key")
                const tournamentName = tournament.name.split("_")[0]

                this.props.getSubscribed(chainId, gasPrice, gasLimit, networkUrl, tournamentName, "elite", (subscribed) => {

                    //console.log(subscribed);
                    const avgLevel = this.calcAvgLevel(subscribed)
                    //console.log(avgLevel);

                    this.setState({ tournamentEliteSubs: subscribed.length, avgLevelElite: avgLevel, loading: false })
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

			if (fights && fights.length > 0) {
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

        //console.log(subscriptionsInfo);
        let yourPossibleSubs = []

        if (tournament.type && tournament.type === "elite") {
            yourPossibleSubs = userMintedNfts.filter(i => i.level >= levelCap)
        }
        else {
            yourPossibleSubs = userMintedNfts.filter(i => i.level <= levelCap)
        }

        //console.log(yourSubs);
        let yourSubs = this.setYourSub(yourPossibleSubs)

        this.setState({ yourSubs, showSubs: true, showProfileFights: false, tournamentSubs: tournament, loading: false }, () => {
            document.getElementById("filters").scrollIntoView({ behavior: 'smooth' })
        })

    }

    setYourSub(yourSubs) {
        const { subscriptionsInfo } = this.state

        let alreadySub = []
        let notSub = []

        for (let i = 0; i < yourSubs.length; i++) {
            const sub = yourSubs[i]

            const isSubbed = subscriptionsInfo.find(z => z.idnft === sub.id)
            if (isSubbed) {
                alreadySub.push(sub)
            }
            else {
                notSub.push(sub)
            }
        }

        let temp = [alreadySub, notSub]
        return temp
    }

    subscribe(idNft, spellSelected) {
		const { account, buyin, feeTournament, buyinWiza, feeTournamentWiza, buyinElite } = this.props
		const { tournamentSubs } = this.state

		if (!buyin || !feeTournament || !buyinWiza || !feeTournamentWiza || !buyinElite || !spellSelected || !spellSelected.name) {
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

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${tot} KDA`,
			typeModal: 'subscriptionmass',
			transactionOkText: `Your Wizards are registered for the tournament!`,
		})

		this.props.subscribeToTournamentMass(chainId, gasPrice, 3000, netId, account, buyin, toSubscribe)
	}

    subscribeMassWiza() {
		const { chainId, gasPrice, netId, account, buyinWiza } = this.props
		const { toSubscribe } = this.state

		const tot = toSubscribe.length * buyinWiza

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${tot} WIZA`,
			typeModal: 'subscriptionmass',
			transactionOkText: `Your Wizards are registered for the tournament!`,
		})

		this.props.subscribeToTournamentMassWIZA(chainId, gasPrice, 3000, netId, account, toSubscribe)
	}

    subscribeMassElite() {
		const { chainId, gasPrice, netId, account, buyinElite } = this.props
		const { toSubscribe } = this.state

		const tot = toSubscribe.length * buyinElite

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${tot} WIZA`,
			typeModal: 'subscriptionmass',
			transactionOkText: `Your Wizards are registered for the tournament!`,
		})

		this.props.subscribeToTournamentMassELITE(chainId, gasPrice, 3000, netId, account, toSubscribe)
	}

    changeSpellTournament(spellSelected) {
        const { chainId, gasPrice, netId, account } = this.props
        const { wizardToChangeSpell } = this.state

        //console.log(wizardToChangeSpell);

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will change the spell of #${wizardToChangeSpell.id}`,
			typeModal: 'changespell_pvp',
			transactionOkText: `Spell changed!`,
		})

		this.props.changeSpellTournament(chainId, gasPrice, 3000, netId, account, wizardToChangeSpell.id, spellSelected)
    }

    async searchByStat(stat) {
		const { statSearched, tournamentSubs } = this.state
        const { userMintedNfts } = this.props

        const levelCap = tournamentSubs.levelCap
        let yourNfts = userMintedNfts.filter(i => i.level <= levelCap)

		let oldStat = Object.assign([], statSearched);

		if (stat) {
			const oldItem = oldStat.find(i => i.stat === stat.stat)
			if (oldItem) {
				if (oldItem.value === stat.value) {
					const idx = oldStat.findIndex(i => i.stat === stat.stat)
					oldStat.splice(idx, 1)
				}
				else {
					oldItem.value = stat.value
				}
			}
			else {
				oldStat.push(stat)
			}
		}

		if (oldStat.length > 0) {

			let newData = Object.assign([], yourNfts)

			oldStat.map(i => {

				if (i.stat === "hp") {

					const values = i.value.split(" - ")
					const minV = parseInt(values[0])
					const maxV = parseInt(values[1])

					newData = newData.filter(n => {
						return n.hp && n.hp.int >= minV && n.hp.int <= maxV
					})
				}

				if (i.stat === "defense") {
					const values = i.value.split(" - ")
					const minV = parseInt(values[0])
					const maxV = parseInt(values[1])

					newData = newData.filter(n => {
						return n.defense && n.defense.int >= minV && n.defense.int <= maxV
					})
				}

				if (i.stat === "element") {
					//console.log(newData);
					newData = newData.filter(n => {
						return n.element && n.element.toUpperCase() === i.value.toUpperCase()
					})
				}

				if (i.stat === "resistance") {
					//console.log(newData);
					newData = newData.filter(n => {
						return n.resistance && n.resistance.toUpperCase() === i.value.toUpperCase()
					})
				}

				if (i.stat === "weakness") {
					//console.log(newData);
					newData = newData.filter(n => {
						return n.weakness && n.weakness.toUpperCase() === i.value.toUpperCase()
					})
				}

				if (i.stat === "spellbook") {
					//console.log(newData);
					newData = newData.filter(n => {
						return n.spellbook && n.spellbook.length === i.value
					})
				}

				if (i.stat === "level") {
					//console.log(newData);
					const rangeLevels = i.value.split(" - ")
					const minLevel = rangeLevels[0]
					const maxLevel = rangeLevels[1]

					newData = newData.filter(n => {
						return n.level >= parseInt(minLevel) && n.level <= parseInt(maxLevel)
					})
				}
			})

			newData.sort((a, b) => {
				if (parseInt(a.price) === 0) return 1;
				if (parseInt(b.price) === 0) return -1
				return a.price - b.price
			})

            const yourSubs = this.setYourSub(newData)

			//console.log(newData);
			this.setState({ yourSubs, loading: false, statSearched: oldStat })
		}
		else {
			this.setState({ loading: false, statSearched: [] })
			this.loadSubs(this.state.tournamentSubs)
		}
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
                <p style={{ fontSize: 16, color: 'white', textAlign: 'center' }}>
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
                <p style={{ fontSize: 16, color: 'white' }}>
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
                <p style={{ fontSize: 16, color: 'white', textAlign: 'center' }}>
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
                        if (tournamentSubs.type === "weekly") {
                            this.subscribeMassKda()
                        }
                        else if (tournamentSubs.type === "elite") {
                            this.subscribeMassElite()
                        }
                        else if (tournamentSubs.type === "apprentice") {
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
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom }}>
                        <p style={{ fontSize: 22, color: 'white' }}>
                            The Twelve League
                        </p>

                        <p style={{ fontSize: 18, color: 'gold' }}>
                            {tournament.leagueTournament}
                        </p>
                    </div>
                    :
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom }}>
                        <p style={{ fontSize: 22, color: 'white' }}>
                            The Weekly Tournament
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

                <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 40, marginBottom }}>
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

                <p style={{ fontSize: 16, color: 'white', marginBottom, height: 55 }}>
                    Participation reward: (for each wizard) {tournament.reward}
                </p>

                {
                    finalDate ?
                    <p style={{ fontSize: 17, color: 'white', height: 34, marginBottom }}>
                        {finalDate}
                    </p>
                    :
                    <p style={{ height: 17, fontSize: 17, color: 'white', height: 34, marginBottom }}>

                    </p>
                }

                <div style={{ alignItems: 'center', marginTop: 10 }}>
                    <p style={{ fontSize: 20, color: 'white', marginRight: 10 }}>
                        Registrations {tournament.canSubscribe ? "open" : "closed"}
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

    renderTournamentElite(boxTournamentWidth) {
        const { tournamentElite, tournamentEliteSubs, avgLevelElite } = this.state
        const { buyinElite } = this.props

        let montepremi = tournamentEliteSubs * buyinElite

        const tournamentName = tournamentElite.name.split("_")[0]
        const tournamentValue = tournamentName.replace("t", "")
        const roundName = tournamentElite.name.split("_")[1]
        const roundValue = roundName.replace("r", "")

        const dateStart = moment(tournamentElite.start.seconds * 1000)
        //console.log(dateStart);

        let finalDate;
        if (tournamentElite.canSubscribe) {
            finalDate = `Start: ${moment().to(dateStart)}`
        }
        else if (!tournamentElite.canSubscribe && !tournamentElite.tournamentEnd && tournamentElite.roundEnded === "0") {
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
                    tournamentElite.showLeague ?
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom }}>
                        <p style={{ fontSize: 22, color: 'white' }}>
                            The Twelve League
                        </p>

                        <p style={{ fontSize: 18, color: 'gold' }}>
                            {tournamentElite.leagueTournament}
                        </p>
                    </div>
                    :
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom }}>
                        <p style={{ fontSize: 22, color: 'white' }}>
                            The Elite Tournament
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

                <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 40, marginBottom }}>
                    <p style={{ fontSize: 20, color: 'white' }}>
                        Buyin <span style={{ color: 'gold' }}>{buyinElite}</span> $WIZA
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        Fee 0%
                    </p>
                </div>

                <p style={{ fontSize: 20, color: 'white', marginBottom }}>
                    MIN Level: <span style={{ color: 'gold' }}>{tournamentElite.levelCap}</span>
                </p>

                <p style={{ fontSize: 17, color: 'white', marginBottom }}>
                    Structure: {tournamentElite.structure}
                </p>

                <p style={{ fontSize: 20, color: 'white', marginBottom }}>
                    Prize <span style={{ color: 'gold' }}>{montepremi ? montepremi.toFixed(2) : '...'}</span> $WIZA
                </p>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                    <p style={{ fontSize: 17, color: 'white' }}>
                        Subscribed <span style={{ color: 'gold' }}>{tournamentEliteSubs}</span>
                    </p>

                    <p style={{ fontSize: 17, color: 'white' }}>
                        AVG level <span style={{ color: 'gold' }}>{avgLevelElite || '...'}</span>
                    </p>
                </div>

                <p style={{ fontSize: 16, color: 'white', marginBottom, height: 55 }}>
                    Participation reward: (for each wizard) {tournamentElite.reward}
                </p>

                {
                    finalDate ?
                    <p style={{ fontSize: 17, color: 'white', height: 34, marginBottom }}>
                        {finalDate}
                    </p>
                    :
                    <p style={{ height: 17, fontSize: 17, color: 'white', height: 34, marginBottom }}>

                    </p>
                }

                <div style={{ alignItems: 'center', marginTop: 10 }}>
                    <p style={{ fontSize: 20, color: 'white', marginRight: 10 }}>
                        Registrations {tournamentElite.canSubscribe ? "open" : "closed"}
                    </p>

                    {
                        tournamentElite.canSubscribe ?
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
                    tournamentElite.canSubscribe ?
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: marginBottom }}>
                        {this.renderBtnSubscribe(tournamentElite)}

                        {this.renderBtnOpenTournament('tournamentE')}

                    </div>
                    :
                    null
                }

                {
                    !tournamentElite.canSubscribe &&
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: marginBottom }}>
                        {this.renderBtnYourResults(tournamentElite)}

                        {this.renderBtnOpenTournament('tournamentE')}

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
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom }}>
                        <p style={{ fontSize: 22, color: 'white' }}>
                            The Twelve League
                        </p>

                        <p style={{ fontSize: 18, color: 'gold' }}>
                            {tournamentWiza.leagueTournament}
                        </p>
                    </div>
                    :
                    <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom }}>
                        <p style={{ fontSize: 22, color: 'white' }}>
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

                <div style={{ alignItems: 'center', justifyContent: 'space-between', height: 40, marginBottom }}>
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

                <p style={{ fontSize: 16, color: 'white', marginBottom, height: 55 }}>
                    Participation reward: (for each wizard) {tournamentWiza.reward}
                </p>

                {
                    finalDate ?
                    <p style={{ fontSize: 17, color: 'white', height: 34, marginBottom }}>
                        {finalDate}
                    </p>
                    :
                    <p style={{ height: 17, fontSize: 17, color: 'white', height: 34, marginBottom }}>

                    </p>
                }

                <div style={{ alignItems: 'center', marginTop: 10 }}>
                    <p style={{ fontSize: 20, color: 'white', marginRight: 10 }}>
                        Registrations {tournamentWiza.canSubscribe ? "open" : "closed"}
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
		const { tournamentSubs, toSubscribe, equipment, subscriptionsInfo } = this.state

		return (
			<NftCardChoice
				key={index}
				item={item}
				width={230}
                subscriptionsInfo={subscriptionsInfo}
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
                onChangeSpell={() => {
                    this.setState({ showModalSpellbook: true, wizardToChangeSpell: item })
                }}
			/>
		)
	}

    renderListStat(item, index, statName) {
		return (
			<button
				key={index}
				style={{ marginBottom: 15, marginLeft: 10 }}
				onClick={() => {
					this.listPopup.close()
					this.searchByStat({ stat: statName, value: item })
				}}
			>
				<p style={{ fontSize: 19 }}>
					{item}
				</p>
			</button>
		)
	}

    renderBoxSearchStat(statName, statDisplay, list) {
		const { statSearched } = this.state

		//console.log(statSearched);

		const findItem = statSearched && statSearched.length > 0 ? statSearched.find(i => i.stat === statName) : undefined

		let text = statDisplay.toUpperCase()
		if (findItem) {
			//console.log(findItem);

			let v = findItem.value
			text = `${statDisplay} = ${v}`
		}

		return (
			<Popup
				ref={ref => this.listPopup = ref}
				trigger={
					<button style={styles.btnStat}>
						<p style={{ fontSize: 18, color: 'white' }}>{text}</p>
						{
							findItem &&
							<IoClose
								color='red'
								size={22}
								style={{ marginLeft: 5 }}
								onClick={(e) => {
									e.stopPropagation()
									this.searchByStat({ stat: findItem.stat, value: findItem.value })
								}}
							/>
						}
					</button>
				}
				position="bottom left"
				on="click"
				closeOnDocumentClick
				arrow={true}
			>
				<div style={{ flexDirection: 'column', paddingTop: 10 }}>
					{list.map((item, index) => {
						return this.renderListStat(item, index, statName)
					})}
				</div>
			</Popup>
		)
	}

    renderBody(isMobile) {
        const { tournament, tournamentWiza, tournamentElite, profileFights, error, showProfileFights, showSubs, yourSubs } = this.state

        let { boxW, modalW } = getBoxWidth(isMobile)
        if (boxW > 1250) {
            boxW = 1250
        }

        if (!tournament.name || !tournamentWiza.name || !tournamentElite.name) {
            return (
                <div style={{ width: boxW, height: 50, justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
                    <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                </div>
            )
        }

        //console.log(tournament);
        let boxTournamentWidth = isMobile ? (boxW * 90 / 100) : (boxW - 140) / 3
        if (boxTournamentWidth > 358) {
            boxTournamentWidth = 358
        }

        return (
            <div style={{ width: boxW, flexDirection: 'column', justifyContent: 'center', flexWrap: 'wrap', paddingTop: 30 }}>

                <div style={{ width: boxW, flexDirection: 'row', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 30 }}>
                    {this.renderTournamentElite(boxTournamentWidth)}

                    {this.renderTournamentHigh(boxTournamentWidth)}

                    {this.renderTournamentLow(boxTournamentWidth)}
                </div>

                {
					this.state.loading ?
					<div style={{ width: boxW, height: 50, justifyContent: 'center', alignItems: 'center' }} id="loading">
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
                    <div style={{ flexWrap: 'wrap', marginBottom: 15 }} id="filters">
    					{this.renderBoxSearchStat("hp", "HP", ["40 - 50", "51 - 60", "61 - 65", "66 - 70", "71 - 75", "76 - 80", "81 - 85", "86 - 90", "91 - 95", "96 - 100", "101 - 105", "106 - 110", "111 - 115", "116 - 120", "121 - 125"].reverse())}
    					{this.renderBoxSearchStat("defense", "DEFENSE", ["14 - 15", "16 - 17", "18 - 19", "20 - 21", "22 - 23", "24 - 25", "26 - 27", "28 - 29", "30 - 31", "32 - 33", "34 - 35", "36 - 37", "38 - 39", "40 - 41"].reverse())}
    					{this.renderBoxSearchStat("element", "ELEMENT", ["Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"])}
    					{this.renderBoxSearchStat("resistance", "RESISTANCE", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
    					{this.renderBoxSearchStat("weakness", "WEAKNESS", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
    					{this.renderBoxSearchStat("spellbook", "SPELLBOOK", [1, 2, 3, 4])}
    					{this.renderBoxSearchStat("level", "LEVEL", ["122 - 150", "151 - 175", "176 - 200", "201 - 225", "226 - 250", "251 - 275", "276 - 300"].reverse())}
    				</div>
                }

                {
                    showSubs && yourSubs.length > 0 && yourSubs[0].length > 0 &&
                    <div style={{ flexDirection: 'column', width: '100%' }}>
                        <p style={{ fontSize: 23, color: 'white', marginTop: 10, marginBottom: 15 }}>
                            Wizards subscribed
                        </p>

                        <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                            {yourSubs[0].map((item, index) => this.renderRowChoise(item, index, modalW))}
                        </div>
                    </div>
                }

                {
                    showSubs && yourSubs.length > 0 && yourSubs[1].length > 0 &&
                    <div style={{ flexDirection: 'column', width: '100%' }}>
                        <p style={{ fontSize: 23, color: 'white', marginTop: 10, marginBottom: 15 }}>
                            Wizards not subscribed
                        </p>
                        <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                            {yourSubs[1].map((item, index) => this.renderRowChoise(item, index, modalW))}
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

                {
                    this.state.showModalSpellbook &&
                    <ModalSpellbook
                        showModal={this.state.showModalSpellbook}
                        onCloseModal={() => this.setState({ showModalSpellbook: false })}
                        width={modalW}
                        stats={this.state.wizardToChangeSpell}
                        onSub={(spellSelected) => {
                            this.changeSpellTournament(spellSelected)
                            this.setState({ showModalSpellbook: false })
                        }}
                    />
                }

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
        width: 150,
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
        padding: 12,
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
	},
    btnStat: {
		padding: 10,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
		marginBottom: 10,
		borderRadius: 2,
		minWidth: 60,
		display: 'flex',
		flexDirection: 'row'
	},
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, buyin, buyinWiza, buyinElite, feeTournament, feeTournamentWiza, userMintedNfts } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, buyin, buyinWiza, buyinElite, feeTournament, feeTournamentWiza, userMintedNfts };
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
    subscribeToTournamentMassWIZA,
    getSubscriptions,
    changeSpellTournament,
    subscribeToTournamentMassELITE,
    updateInfoTransactionModal
})(Tournament)
