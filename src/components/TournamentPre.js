import React, { Component } from 'react'
import Media from 'react-media';
import { connect } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import { collection, getDocs, query, where } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import DotLoader from 'react-spinners/DotLoader';
import { AiFillCheckCircle, AiOutlineLock } from 'react-icons/ai'
import { IoClose } from 'react-icons/io5'
import Popup from 'reactjs-popup';
import NftCardChoice from './common/NftCardChoice'
import ModalSpellbook from './common/ModalSpellbook'
import CardSingleFightProfile from './common/CardSingleFightProfile'
import Header from './Header'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import { MAIN_NET_ID, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
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
    updateInfoTransactionModal,
    fetchAccountDetails,
    getWizaBalance,
    getFightPerNfts
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
            this.refreshUser()
            this.loadWizaBalance()
        }, 500)
	}

    refreshUser() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props
			//console.log(this.props)
		if (account && account.account) {
			this.props.fetchAccountDetails(account.account, chainId, gasPrice, gasLimit, networkUrl)
		}
	}

    loadWizaBalance() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWizaBalance(chainId, gasPrice, gasLimit, networkUrl, account.account)
		}
	}

    loadMinted(tournament, isResults, isSubs) {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.setState({ loading: true, showSubs: false, showProfileFights: false }, () => {
            document.getElementById("loading").scrollIntoView({ behavior: 'smooth' })
        })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (minted) => {
                //console.log(minted);
                if (isResults) {

                    let idsSubscription = []
                    const tName = tournament.name.split("_")[0]

                    minted.map(i => {
                        idsSubscription.push(`${tName}_${i.id}`)
                    })

                    this.props.getSubscriptions(chainId, gasPrice, gasLimit, networkUrl, idsSubscription, (subscriptions) => {
                        //console.log(subscriptions);

                        let subscribed = []
                        subscriptions.map(i => {
                            if (i.idnft) {
                                subscribed.push(i.idnft)
                            }
                        })

                        //console.log(subscribed);

                        this.loadProfileFights(tournament, subscribed)
                    })
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

				//this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl, "buyin-elite-key")
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

    async loadProfileFights(tournament, subscribed) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		const tournamentName =  tournament.name.split("_")[0]
		//console.log(tournamentName);

        //subscribed = ["63", "91", "137", "147", "226", "257", "273", "344", "350", "355", "396", "488", "689", "820", "876", "907", "917", "927", "952", "972", "1148", "1217"]

        let tournamentsKey = []
        for (var i = 1; i < 7; i++) {
            let tKey = `${tournamentName}_r${i}`
            tournamentsKey.push(tKey)
        }

        let blocks = _.chunk(subscribed, 10)

        let queries = []

        for (var i = 0; i < blocks.length; i++) {
            const b = blocks[i]

            let q1 = query(collection(firebasedb, "fights"), where("idnft1", "in", b))
            let q2 = query(collection(firebasedb, "fights"), where("idnft2", "in", b))

            queries.push(getDocs(q1))
            queries.push(getDocs(q2))
        }

        //console.log(queries);

        //let q = query(collection(firebasedb, "fights"), where("idnft1", "in", subscribed))
        //let q2 = query(collection(firebasedb, "fights"), where("idnft2", "in", subscribed))

        Promise.all(queries).then(values => {

            let results = []
            //console.log(values);

            values.map(querySnapshot => {

                //console.log(querySnapshot);

                querySnapshot.forEach(doc => {
                    //console.log(doc.id);
                    let d = doc.data()
                    //console.log(d);

                    if (d.tournament && tournamentsKey.includes(d.tournament)) {

                        const idnft = subscribed.includes(d.idnft1) ? d.idnft1 : d.idnft2

                        const obj = {
                            fightId: doc.id,
                            tournament: d.tournament,
                            winner: d.winner,
                            id: idnft,
                            name: `#${idnft}`
                        }

                        results.push(obj)
                    }
                })

                //console.log(results);
            })

            results.sort((a, b) => {
                if (parseInt(a.tournament[a.tournament.length - 1]) === 0) return 1;
                if (parseInt(b.tournament[b.tournament.length - 1]) === 0) return -1
                return parseInt(a.tournament[a.tournament.length - 1]) - parseInt(b.tournament[b.tournament.length - 1])
            })

            //console.log(profileFights);

            let fightsPerRound = {}

            for (var i = 0; i < results.length; i++) {
                const singleF = results[i]

                if (!fightsPerRound[singleF.tournament]) {
                    fightsPerRound[singleF.tournament] = []
                }

                fightsPerRound[singleF.tournament].push(singleF)
            }

            //console.log(fightsPerRound);

            this.setState({ profileFights: fightsPerRound, loading: false, showProfileFights: true, showSubs: false })
        })

        /*
        this.props.getFightPerNfts(chainId, gasPrice, gasLimit, networkUrl, subscribed, (allfights) => {
            //console.log(allfights);

            let profileFights = []

    		for (let i = 0; i < subscribed.length; i++) {
    			const s = subscribed[i]
    			//console.log(s);

                let fights = allfights.filter(i => i.id === s)
                //console.log(fights);

    			if (fights && fights.length > 0) {

                    let fightsPerTournamentName = []

                    for (let z = 0; z < fights.length; z++) {
                        const s = fights[z]

                        let tName = s.tournament.split("_")[0]

                        if (tName === tournamentName) {
                            fightsPerTournamentName.push(s)
                        }
                    }

                    //console.log(fightsPerTournamentName);

    				fightsPerTournamentName.map(y => {
    					y['name'] = `#${s}`
    					profileFights.push(y)
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
        })
        */
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

        let yourSubs = this.setYourSub(yourPossibleSubs)
        //console.log(yourSubs);

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

                if (i.stat === "hp" || i.stat === "defense" || i.stat === "attack" || i.stat === "damage" || i.stat === "speed") {
					const values = i.value.split(" - ")
					const minV = parseInt(values[0])
					const maxV = parseInt(values[1])

					newData = newData.filter(n => {
						return n[i.stat] && n[i.stat].int >= minV && n[i.stat].int <= maxV
					})
				}

                if (i.stat === "element" || i.stat === "resistance" || i.stat === "weakness") {
					//console.log(newData);
					newData = newData.filter(n => {
						return n[i.stat] && n[i.stat].toUpperCase() === i.value.toUpperCase()
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
                <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
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
                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
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
                <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                    Subscribe your wizards
                </p>
            </button>
        )
    }

    renderFooterSubscribe(isMobile) {
		const { toSubscribe, tournamentSubs } = this.state
        const { account, wizaBalance } = this.props

		let temp = []
		toSubscribe.map(i => {
			temp.push(
				<Popup
					key={i.idnft}
					trigger={open => (
						<img
							style={{ width: 60, height: 60, borderRadius: 4, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', cursor: 'pointer' }}
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
				<div style={{ flexWrap: 'wrap', marginLeft: isMobile ? 0 : 20 }}>
					{temp}
				</div>

				<button
					className="btnH"
					style={{ width: 180, height: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 4, backgroundColor: CTA_COLOR, marginRight: 20 }}
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
					<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
						Subscribe
					</p>

                    {
                        account.account && tournamentSubs.coinBuyin === "KDA" &&
                        <p style={{ fontSize: 13, color: 'white', marginTop: 3 }}>
                            Balance: {_.floor(account.balance, 1)} $KDA
                        </p>
                    }

                    {
                        account.account && tournamentSubs.coinBuyin === "WIZA" &&
                        <p style={{ fontSize: 13, color: 'white', marginTop: 3 }}>
                            Balance: {_.floor(wizaBalance, 1)} $WIZA
                        </p>
                    }

				</button>
			</div>
		)
	}

    renderRoundInfo(marginBottom, mainTextColor, tournamentValue, roundValue) {
        return (
            <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                <p style={{ fontSize: 16, color: mainTextColor }}>
                    Tournament <span className="text-bold">{tournamentValue}</span>
                </p>

                <p style={{ fontSize: 15, color: mainTextColor }}>
                    Round <span className="text-bold">{roundValue}</span>
                </p>
            </div>
        )
    }

    renderBuyinInfo(marginBottom, mainTextColor, buyin, coin, feeTournament) {
        return (
            <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                <p style={{ fontSize: 17, color: mainTextColor }}>
                    Buyin <span className="text-bold">{buyin}</span> {coin}
                </p>

                <p style={{ fontSize: 15, color: mainTextColor }}>
                    Fee {feeTournament}%
                </p>
            </div>
        )
    }

    renderPrizeInfo(marginBottom, mainTextColor, montepremi, coin) {
        return (
            <p style={{ fontSize: 16, color: mainTextColor, marginBottom }}>
                Prize <span className="text-bold">{montepremi ? montepremi.toFixed(2) : '...'}</span> {coin}
            </p>
        )
    }

    renderSubsInfo(marginBottom, mainTextColor, subs, avgLevel) {
        return (
            <div style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom }}>
                <p style={{ fontSize: 16, color: mainTextColor }}>
                    Subscribed <span className="text-bold">{subs}</span>
                </p>

                <p style={{ fontSize: 16, color: mainTextColor }}>
                    Avg level <span className="text-bold">{avgLevel || '...'}</span>
                </p>
            </div>
        )
    }

    renderTournamentHigh(boxTournamentWidth) {
        const { tournament, tournamentKdaSubs, avgLevelKda } = this.state
        const { buyin, feeTournament, mainTextColor, isDarkmode } = this.props

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

        const marginBottom = 14

        return (
            <div
                style={Object.assign({}, styles.boxTournament, { width: boxTournamentWidth, backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                {
                    tournament.showLeague ?
                    <div style={{ alignItems: 'center', justifyContent: 'center', height: 50, marginBottom }}>
                        <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
                            The Twelve League <span style={{ fontSize: 15 }}>{tournament.leagueTournament}</span>
                        </p>
                    </div>
                    :
                    <div style={{ alignItems: 'center', justifyContent: 'center', height: 50, marginBottom }}>
                        <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
                            The Weekly Tournament
                        </p>
                    </div>
                }

                {this.renderRoundInfo(marginBottom, mainTextColor, tournamentValue, roundValue)}

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom }}>
                    Level Cap: <span className="text-bold">{tournament.levelCap}</span>
                </p>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom, height: 20 }}>
                    Structure: {tournament.structure}
                </p>

                {this.renderBuyinInfo(marginBottom, mainTextColor, buyin, "$KDA", feeTournament)}

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                {this.renderPrizeInfo(marginBottom, mainTextColor, montepremi, "$KDA")}

                {this.renderSubsInfo(marginBottom, mainTextColor, tournamentKdaSubs, avgLevelKda)}

                <p style={{ fontSize: 14, color: mainTextColor, marginBottom, height: 40 }}>
                    Participation reward: (for each wizard) {tournament.reward}
                </p>

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>

                    <div style={{ alignItems: 'center' }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginRight: 7 }}>
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
                        finalDate &&
                        <p style={{ fontSize: 15, color: mainTextColor }} className="text-bold">
                            {finalDate}
                        </p>
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
        const { mainTextColor, isDarkmode } = this.props

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

        const marginBottom = 14

        return (
            <div
                style={Object.assign({}, styles.boxTournament, { width: boxTournamentWidth, backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                {
                    tournamentElite.showLeague ?
                    <div style={{ alignItems: 'center', justifyContent: 'center', height: 50, marginBottom }}>
                        <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
                            The Twelve League <span style={{ fontSize: 15 }}>{tournamentElite.leagueTournament}</span>
                        </p>
                    </div>
                    :
                    <div style={{ alignItems: 'center', justifyContent: 'center', height: 50, marginBottom }}>
                        <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
                            The Chaos Tournament
                        </p>
                    </div>
                }

                {this.renderRoundInfo(marginBottom, mainTextColor, tournamentValue, roundValue)}

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom }}>
                    Level Cap: <span className="text-bold">{tournamentElite.levelCap}</span>
                </p>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom, height: 20 }}>
                    Structure: {tournamentElite.structure}
                </p>

                {this.renderBuyinInfo(marginBottom, mainTextColor, "FREE", "", "0")}

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom }}>
                    Prize: <span className="text-bold">4 medals 1000 WIZA</span>
                </p>

                {this.renderSubsInfo(marginBottom, mainTextColor, tournamentEliteSubs, avgLevelElite)}

                <p style={{ fontSize: 14, color: mainTextColor, marginBottom, height: 40 }}>
                    Participation reward: (for each wizard) {tournamentElite.reward}
                </p>

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>

                    <div style={{ alignItems: 'center' }}>
                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 7 }}>
                            Registrations private
                        </p>

                        <AiOutlineLock
                            color={mainTextColor}
                            size={26}
                        />
                    </div>

                    {
                        finalDate &&
                        <p style={{ fontSize: 15, color: mainTextColor }} className="text-bold">
                            {finalDate}
                        </p>
                    }
                </div>

                {/*
                    tournamentElite.canSubscribe ?
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: marginBottom }}>
                        {this.renderBtnSubscribe(tournamentElite)}

                        {this.renderBtnOpenTournament('tournamentE')}

                    </div>
                    :
                    null
                */}

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
        const { buyinWiza, feeTournamentWiza, mainTextColor, isDarkmode } = this.props

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

        const marginBottom = 14

        return (
            <div
                style={Object.assign({}, styles.boxTournament, { width: boxTournamentWidth, backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                {
                    tournamentWiza.showLeague ?
                    <div style={{ alignItems: 'center', justifyContent: 'center', height: 50, marginBottom }}>
                        <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
                            The Twelve League <span style={{ fontSize: 15 }}>{tournamentWiza.leagueTournament}</span>
                        </p>
                    </div>
                    :
                    <div style={{ alignItems: 'center', justifyContent: 'center', height: 50, marginBottom }}>
                        <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
                            The Apprentice Tournament
                        </p>
                    </div>
                }

                {this.renderRoundInfo(marginBottom, mainTextColor, tournamentValue, roundValue)}

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom }}>
                    Level Cap: <span className="text-bold">{tournamentWiza.levelCap}</span>
                </p>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom, height: 20 }}>
                    Structure: {tournamentWiza.structure}
                </p>

                 {this.renderBuyinInfo(marginBottom, mainTextColor, buyinWiza, "$WIZA", feeTournamentWiza)}

                 <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                {this.renderPrizeInfo(marginBottom, mainTextColor, montepremi, "$WIZA")}

                {this.renderSubsInfo(marginBottom, mainTextColor, tournamentWizaSubs, avgLevelWiza)}

                <p style={{ fontSize: 14, color: mainTextColor, marginBottom, height: 40 }}>
                    Participation reward: (for each wizard) {tournamentWiza.reward}
                </p>

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                <div style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>

                    <div style={{ alignItems: 'center' }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginRight: 7 }}>
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
                        finalDate &&
                        <p style={{ fontSize: 15, color: mainTextColor }} className="text-bold">
                            {finalDate}
                        </p>
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
				<p style={{ fontSize: 20, color: this.props.mainTextColor, marginBottom: 15 }} className="text-medium">
					Round {roundName}
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

		let text = statDisplay
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
						<p style={{ fontSize: 15, color: 'white' }} className="text-medium">{text}</p>
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
        const { filtriProfileRanges, mainTextColor, mainBackgroundColor } = this.props

        let { boxW, modalW, padding } = getBoxWidth(isMobile)
        const insideWidth = boxW > 1250 ? 1250 : boxW

        if (!tournament.name || !tournamentWiza.name || !tournamentElite.name) {
            return (
                <div style={{ width: boxW, height: 50, justifyContent: 'center', alignItems: 'center', padding }}>
                    <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                </div>
            )
        }

        //console.log(tournament);
        let boxTournamentWidth = isMobile ? (insideWidth * 90 / 100) : (insideWidth - 140) / 3
        if (boxTournamentWidth > 358) {
            boxTournamentWidth = 358
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, alignItems: 'center', padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 60 }} className="text-medium">
                    Weekly Tournaments
                </p>

                {
					this.state.loading ?
					<div style={{ width: insideWidth, height: 50, marginBottom: 30, justifyContent: 'center', alignItems: 'center' }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                <div style={{ width: insideWidth, flexDirection: 'row', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 30 }}>
                    {this.renderTournamentElite(boxTournamentWidth)}

                    {this.renderTournamentHigh(boxTournamentWidth)}

                    {this.renderTournamentLow(boxTournamentWidth)}
                </div>

                {
					this.state.loading ?
					<div style={{ width: insideWidth, height: 50, justifyContent: 'center', alignItems: 'center' }} id="loading">
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                {
                    showProfileFights &&
                    <div style={{ flexDirection: 'column', width: insideWidth }}>

                        <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                            {profileFights && Object.keys(profileFights).length > 0 && Object.keys(profileFights).reverse().map(key => this.renderRoundFights(key))}
                        </div>

                        <p style={{ fontSize: 15, color: 'red', marginTop: 10 }}>
                            {error}
                        </p>
                    </div>
                }

                {
                    showSubs && yourSubs.length > 0 && yourSubs[0].length > 0 &&
                    <div style={{ flexDirection: 'column', width: insideWidth }}>
                        <p style={{ fontSize: 22, color: mainTextColor, marginTop: 10, marginBottom: 15, textAlign: 'center' }} className="text-medium">
                            Wizards subscribed
                        </p>

                        <div style={{ marginBottom: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {yourSubs[0].map((item, index) => this.renderRowChoise(item, index, modalW))}
                        </div>
                    </div>
                }

                {
                    showSubs && yourSubs.length > 0 && yourSubs[1].length > 0 &&
                    <div style={{ flexDirection: 'column', width: insideWidth }}>
                        <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginBottom: 15 }} />

                        <p style={{ fontSize: 22, color: mainTextColor, marginTop: 10, marginBottom: 15, textAlign: 'center' }} className="text-medium">
                            Wizards not subscribed
                        </p>
                    </div>
                }

                {
                    showSubs && filtriProfileRanges &&
                    <div style={{ flexWrap: 'wrap', width: insideWidth, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }} id="filters">
                        {this.renderBoxSearchStat("hp", "HP", filtriProfileRanges["hp"])}
                        {this.renderBoxSearchStat("defense", "Defense", filtriProfileRanges["defense"])}
                        {this.renderBoxSearchStat("attack", "Attack", filtriProfileRanges["attack"])}
                        {this.renderBoxSearchStat("damage", "Damage", filtriProfileRanges["damage"])}
                        {this.renderBoxSearchStat("speed", "Speed", filtriProfileRanges["speed"])}
    					{this.renderBoxSearchStat("element", "Element", ["Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"])}
    					{this.renderBoxSearchStat("resistance", "Resistance", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
    					{this.renderBoxSearchStat("weakness", "Weakness", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
    					{this.renderBoxSearchStat("spellbook", "Spellbook", [1, 2, 3, 4])}
    					{this.renderBoxSearchStat("level", "Level", ["122 - 150", "151 - 175", "176 - 200", "201 - 225", "226 - 250", "251 - 275", "276 - 300", "301 - 325", "326 - 350"].reverse())}
    				</div>
                }

                {
                    showSubs && yourSubs.length > 0 && yourSubs[1].length > 0 &&
                    <div style={{ flexDirection: 'column', width: insideWidth }}>
                        <div style={{ marginBottom: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {yourSubs[1].map((item, index) => this.renderRowChoise(item, index, modalW))}
                        </div>

                        <p style={{ fontSize: 15, color: 'red', marginTop: 10 }}>
                            {error}
                        </p>
                    </div>
                }

                {
                    this.state.toSubscribe.length > 0 &&
                    <div style={Object.assign({}, styles.footerSubscribe, { bottom: -padding, width: insideWidth, backgroundColor: mainBackgroundColor })}>
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
			<div>
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
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
    btnSubscribe: {
        width: "45%",
		height: 40,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
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
        borderWidth: 1,
        borderColor: "#d7d7d7",
        borderStyle: 'solid',
        marginBottom: 20,
    },
    footerSubscribe: {
		position: 'sticky',
		bottom: 0,
		left: 0,
		backgroundColor: "white",
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderRadius: 4,
		borderTopWidth: 1,
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderBottomWidth: 0,
		paddingTop: 10
	},
    btnStat: {
		padding: 9,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
		marginBottom: 8,
		borderRadius: 4,
		minWidth: 60,
		display: 'flex',
		flexDirection: 'row'
	},
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, buyin, buyinWiza, buyinElite, feeTournament, feeTournamentWiza, userMintedNfts, wizaBalance, filtriProfileRanges, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, buyin, buyinWiza, buyinElite, feeTournament, feeTournamentWiza, userMintedNfts, wizaBalance, filtriProfileRanges, mainTextColor, mainBackgroundColor, isDarkmode };
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
    updateInfoTransactionModal,
    fetchAccountDetails,
    getWizaBalance,
    getFightPerNfts
})(Tournament)
