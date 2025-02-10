import React, { Component } from 'react'
import Media from 'react-media';
import { connect } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import { collection, getDocs } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import DotLoader from 'react-spinners/DotLoader';
import { AiFillCheckCircle } from 'react-icons/ai'
import { IoClose } from 'react-icons/io5'
import Popup from 'reactjs-popup';
import NftCardChoice from './common/NftCardChoice'
import Header from './Header'
import allEvents from './common/Events'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import { MAIN_NET_ID, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadUserMintedNfts,
    subscribeToTournamentMass,
    subscribeToTournamentMassWIZA,
    getSubscriptions,
    subscribeToTournamentMassELITE,
    updateInfoTransactionModal,
    fetchAccountDetails,
    getWizaBalance,
    getCountForTournament,
    getPotionEquippedMass,
    getAutoTournament,
    subscribeToTournamentMassAuto
} from '../actions'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';


import {ReactComponent as VedrenonIcon} from '../assets/regions/svg/vedrenon.svg'
import {ReactComponent as WastiaxusIcon} from '../assets/regions/svg/wastiaxus.svg'
import {ReactComponent as UlanaraIcon} from '../assets/regions/svg/ulanara.svg'
import {ReactComponent as UlidalarIcon} from '../assets/regions/svg/ulidalar.svg'
import {ReactComponent as SitenorIcon} from '../assets/regions/svg/sitenor.svg'
import {ReactComponent as OceorahIcon} from '../assets/regions/svg/oceorah.svg'
import {ReactComponent as DruggorialIcon} from '../assets/regions/svg/druggorial.svg'
import {ReactComponent as OpherusIcon} from '../assets/regions/svg/opherus.svg'
import {ReactComponent as BremononIcon} from '../assets/regions/svg/bremonon.svg'


class Tournament extends Component {
    constructor(props) {
		super(props)

		this.state = {
            tournaments: {},
            tournament: {},
            tournamentWiza: {},
            tournamentElite: {},
			tournamentKdaSubs: 0,
            tournamentWizaSubs: 0,
            tournamentEliteSubs: 0,
            loading: false,
            loadingElite: false,
            loadingWeekly: true,
            loadingApprentice: true,
            showSubs: false,
            yourSubs: [],
            tournamentSubs: {},
            toSubscribe: [],
            statSearched: [],
            subscriptionsInfo: [],
            potionsEquipped: []
		}
	}

    componentDidMount() {
		document.title = "Tournaments - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadTournamentKda()
            this.loadTournamentWiza()
            //this.loadTournamentElite()
            this.getAutoT()
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

    loadMinted(tournament) {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.setState({ loading: true, showSubs: false }, () => {
            document.getElementById("loading").scrollIntoView({ behavior: 'smooth' })
        })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (minted) => {
                //console.log(minted);

                if (tournament.name && tournament.name === "auto") {
                    const wizardsSubbedId = tournament.wizards

                    let alreadySub = []
                    let notSub = []

                    minted.map(i => {
                        //console.log(i);
                        if (wizardsSubbedId.includes(i.id)) {
                            alreadySub.push(i)
                        }
                        //non iscritto
                        else {
                            if (i.level <= tournament.levelCap) {
                                notSub.push(i)
                            }
                        }
                    })

                    //console.log(alreadySub, notSub);

                    this.setState({ yourSubs: [alreadySub, notSub], showSubs: true, tournamentSubs: tournament, loading: false }, () => {
                        if (notSub.length > 0) {
                            document.getElementById("filters").scrollIntoView({ behavior: 'smooth' })
                        }
                        else if (alreadySub.length > 0) {
                            document.getElementById("alreadySubDiv").scrollIntoView({ behavior: 'smooth' })
                        }
                    })
                }
                else {
                    let idsSubscription = []
                    const tName = tournament.name.split("_")[0]

                    minted.map(i => {
                        idsSubscription.push(`${tName}_${i.id}`)
                    })

                    this.props.getSubscriptions(chainId, gasPrice, gasLimit, networkUrl, idsSubscription, async (subscriptions) => {

                        this.setState({ subscriptionsInfo: subscriptions }, () => {
                            this.loadSubs(tournament)
                        })
                    })
                }
            })
		}
	}

    getAutoT() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getAutoTournament(chainId, gasPrice, gasLimit, networkUrl, "farmers", (response) => {
            //console.log(response);
            let tournaments = Object.assign({}, this.state.tournaments)
            tournaments['auto'] = response
            tournaments['auto']['name'] = "auto"
            if (response.completed || response.wizards.length >= response.nPlayers.int) {
                tournaments['auto']['canSubscribe'] = false
            }
            else {
                tournaments['auto']['canSubscribe'] = true
            }
            tournaments['auto']['levelCap'] = response.maxLevel.int
            tournaments['auto']['coinBuyin'] = "WIZA"
            this.setState({ tournaments })
        })
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

                const tournamentName = tournament.name.split("_")[0]

                this.props.getCountForTournament(chainId, gasPrice, gasLimit, networkUrl, tournamentName, (subscribed) => {
                    //console.log(subscribed);
                    let tournaments = Object.assign({}, this.state.tournaments)
                    tournaments['weekly'] = tournament
                    tournaments['weekly']['subs'] = subscribed

                    this.setState({ tournamentKdaSubs: subscribed, loadingWeekly: false, tournaments })
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

                const tournamentName = tournament.name.split("_")[0]

                this.props.getCountForTournament(chainId,gasPrice,gasLimit, networkUrl, tournamentName, (subscribed) => {

                    let tournaments = Object.assign({}, this.state.tournaments)
                    tournaments['apprentice'] = tournament
                    tournaments['apprentice']['subs'] = subscribed

                    this.setState({ tournamentWizaSubs: subscribed, loadingApprentice: false, tournaments })
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

                const tournamentName = tournament.name.split("_")[0]

                this.props.getCountForTournament(chainId,gasPrice,gasLimit, networkUrl, tournamentName, (subscribed) => {

                    let tournaments = Object.assign({}, this.state.tournaments)
                    tournaments['elite'] = tournament
                    tournaments['elite']['subs'] = subscribed

                    this.setState({ tournamentEliteSubs: subscribed, loadingElite: false, tournaments })
                })

            })
        })
    }

    loadSubs(tournament) {
        const { userMintedNfts } = this.props

        let yourSubs = this.setYourSub(userMintedNfts)
        //console.log(yourSubs);

        this.setState({ yourSubs, showSubs: true, tournamentSubs: tournament, loading: false }, () => {
            if (yourSubs[1] && yourSubs[1].length > 0) {
                document.getElementById("filters").scrollIntoView({ behavior: 'smooth' })
            }

            if (yourSubs[0] && yourSubs[0].length > 0) {
                const tournamentName = tournament.name.split("_")[0]
                this.getAllPotionsEquipped(yourSubs[0], tournamentName)
            }
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

    getAllPotionsEquipped(subscribers, tournamentName) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        let keys = []
        subscribers.map(i => {
            keys.push(`"${tournamentName}_${i.id}"`)
        })

        this.props.getPotionEquippedMass(chainId, gasPrice, gasLimit, networkUrl, keys, (response) => {
            //console.log(response);

            let potionsEquipped = []
            for (var i = 0; i < response.length; i++) {
                const p = response[i]
                const idnft = p.key.split("_")[1]

                potionsEquipped.push({ potionEquipped: p.potionEquipped, idnft })
            }

            this.setState({ potionsEquipped })
        })
    }

    subscribe(idNft, spellSelected) {
		const { account } = this.props
		const { tournamentSubs } = this.state

		if (!spellSelected || !spellSelected.name) {
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
		const { chainId, gasPrice, netId, account } = this.props
		const { toSubscribe, tournament } = this.state

		const tot = toSubscribe.length * tournament.buyin

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${tot} KDA`,
			typeModal: 'subscriptionmass',
			transactionOkText: `Your Wizards are registered for the tournament!`,
		})

		this.props.subscribeToTournamentMass(chainId, gasPrice, 6000, netId, account, tournament.buyin, toSubscribe)
	}

    subscribeMassWiza() {
		const { chainId, gasPrice, netId, account } = this.props
		const { toSubscribe, tournamentWiza } = this.state

		const tot = toSubscribe.length * tournamentWiza.buyin

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${tot} WIZA`,
			typeModal: 'subscriptionmass',
			transactionOkText: `Your Wizards are registered for the tournament!`,
		})

		this.props.subscribeToTournamentMassWIZA(chainId, gasPrice, 6000, netId, account, toSubscribe, tot)
	}

    subscribeMassElite() {
		const { chainId, gasPrice, netId, account } = this.props
		const { toSubscribe, tournamentElite } = this.state

		const tot = toSubscribe.length * tournamentElite.buyin

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${tot} WIZA`,
			typeModal: 'subscriptionmass',
			transactionOkText: `Your Wizards are registered for the tournament!`,
		})

		this.props.subscribeToTournamentMassELITE(chainId, gasPrice, 6000, netId, account, toSubscribe, tot)
	}

    subscribeMassAuto() {
		const { chainId, gasPrice, netId, account } = this.props
		const { toSubscribe, tournamentSubs } = this.state

        //console.log(toSubscribe, tournamentSubs);
        //return

		const tot = toSubscribe.length * tournamentSubs.buyin
        const onlyId = toSubscribe.map(i => i.idnft)

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${tot} WIZA`,
			typeModal: 'subscriptionmass',
			transactionOkText: `Your Wizards are registered for the tournament!`,
		})

		this.props.subscribeToTournamentMassAuto(chainId, gasPrice, 6000, netId, account, "farmers", onlyId, tot)
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
                    {goto === "autotournaments" ? "History" : "Open"}
                </p>
            </a>
        )
    }

    renderBtnSubscribe(tournament) {
        return (
            <button
                className='btnH'
                style={styles.btnSubscribe}
                onClick={() => {
                    this.refreshUser()
                    this.loadWizaBalance()
                    this.loadMinted(tournament)
                }}
            >
                <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                    Subscribe
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
                        else if (tournamentSubs.name && tournamentSubs.name === "auto") {
                            this.subscribeMassAuto()
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

    getImageBoost(element) {
        if (element === "fire") {
            return SitenorIcon
        }
        if (element === "earth") {
            return SitenorIcon
        }
        if (element === "thunder") {
            return UlidalarIcon
        }
        if (element === "ice") {
            return BremononIcon
        }
        if (element === "acid") {
            return WastiaxusIcon
        }
        if (element === "spirit") {
            return OpherusIcon
        }
        if (element === "water") {
            return OceorahIcon
        }
        if (element === "psycho") {
            return UlanaraIcon
        }
        if (element === "sun") {
            return VedrenonIcon
        }
        if (element === "undead") {
            return DruggorialIcon
        }
        if (element === "dark") {
            return DruggorialIcon
        }
        if (element === "wind") {
            return UlidalarIcon
        }

        return OceorahIcon
    }

    renderTournamentMobile(tournamentInfo, boxTournamentWidth) {
        const { mainTextColor, isDarkmode } = this.props

        const fee = tournamentInfo.fee
        const montepremi = this.calcMontepremi(tournamentInfo)

        let finalDate = this.calcFinalDate(tournamentInfo)

        const tournamentName = tournamentInfo.name.split("_")[0].replace("t", "")

        const marginBottom = 14

        return (
            <div
                style={Object.assign({}, styles.boxTournament, { width: boxTournamentWidth, backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                {this.renderTitleTournament(tournamentInfo.type)}

                <p style={{ fontSize: 16, color: mainTextColor, marginTop: 14, marginBottom }}>
                    Tournament {tournamentName}
                </p>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom }}>
                    Level Cap: {tournamentInfo.levelCap}
                </p>

                <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <p style={{ fontSize: 16, color: mainTextColor }}>
                        Buyin {tournamentInfo.buyin} ${tournamentInfo.coinBuyin}
                    </p>

                    <p style={{ fontSize: 13, color: mainTextColor }}>
                        Fee {fee}%
                    </p>
                </div>

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ fontSize: 16, color: mainTextColor }}>
                        Prize {montepremi ? montepremi.toFixed(2) : '...'} ${tournamentInfo.coinBuyin}
                    </p>

                    {
                        tournamentInfo.extraPrize &&
                        <p style={{ fontSize: 14, color: mainTextColor }}>
                            Extra prize {tournamentInfo.extraPrize ? tournamentInfo.extraPrize.toLocaleString() : '...'} ${tournamentInfo.coinBuyin}
                        </p>
                    }
                </div>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 16 }}>
                    Subscribed {tournamentInfo.subs.int}
                </p>

                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 16 }}>
                    Wizard participation reward: {tournamentInfo.reward}
                </p>

                {
                    tournamentInfo.levelCap === 160 ?
                    <p style={{ fontSize: 14, color: mainTextColor }} className="text-light">
                        Rings, Pendants, Spell upgrades and Aura are not counted
                    </p>
                    :
                    undefined
                }

                {
                    tournamentInfo.levelCap === 225 ?
                    <p style={{ fontSize: 14, color: mainTextColor }} className="text-light">
                        Rings and Pendants are not counted
                    </p>
                    :
                    undefined
                }

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                <div style={{ alignItems: 'center', justifyContent: 'space-between' }}>

                    <div style={{ alignItems: 'center' }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginRight: 7 }}>
                            Registrations {tournamentInfo.canSubscribe ? "open" : "closed"}
                        </p>

                        {
                            tournamentInfo.canSubscribe ?
                            <AiFillCheckCircle
                                color='#4bb54b'
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
                        <p style={{ fontSize: 13, color: mainTextColor }} className="text-medium">
                            {finalDate}
                        </p>
                    }
                </div>

                <div style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {this.renderBtns(tournamentInfo.type, true)}
                </div>
            </div>
        )
    }

    calcMontepremi(tournamentInfo) {

        const fee = tournamentInfo.fee
        const feeInCost = tournamentInfo.buyin * tournamentInfo.fee / 100
        const totalFee = feeInCost * tournamentInfo.subs
        const montepremi = (tournamentInfo.subs * tournamentInfo.buyin) - totalFee

        return montepremi
    }

    calcFinalDate(tournamentInfo) {

        let finalDate

        const dateStart = moment(tournamentInfo.start.seconds * 1000)
        //console.log(dateStart);

        if (tournamentInfo.canSubscribe) {
            finalDate = `Start ${moment().to(dateStart)}`
        }
        //in corso
        else if (!tournamentInfo.canSubscribe && !tournamentInfo.tournamentEnd) {
            finalDate = `Started ${dateStart.fromNow()}`
        }
        //finito
        else if (tournamentInfo.tournamentEnd) {
            finalDate = `Ended ${dateStart.fromNow()}`
        }

        return finalDate
    }

    renderTitleTournament(tournamentType) {
        const { tournamentElite, tournament, tournamentWiza, tournaments } = this.state
        const { mainTextColor } = this.props

        if (tournamentType === "auto") {
            return (
                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: 21, color: mainTextColor }} className="text-bold">
                        The {tournaments[tournamentType].levelCap} Flash
                    </p>
                </div>
            )
        }

        if (tournamentType === "elite") {
            return (
                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: 21, color: mainTextColor }} className="text-bold">
                        {
                            tournamentElite.showLeague ?
                            `The Farmers League ${tournamentElite.leagueTournament}`
                            :
                            'The Farmers Tournament'
                        }
                    </p>
                </div>
            )
        }

        if (tournamentType === "weekly") {
            return (
                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: 21, color: mainTextColor }} className="text-bold">
                        {
                            tournament.showLeague ?
                            `The Twelve League ${tournament.leagueTournament}`
                            :
                            'The Weekly Tournament'
                        }
                    </p>
                </div>
            )
        }

        if (tournamentType === "apprentice") {
            return (
                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: 21, color: mainTextColor }} className="text-bold">
                        {
                            tournamentWiza.showLeague ?
                            `The Apprentice League ${tournamentWiza.leagueTournament}`
                            :
                            'The Apprentice Tournament'
                        }
                    </p>
                </div>
            )
        }
    }

    renderBtns(tournamentType, isMobile) {
        const { tournaments, loadingElite, loadingWeekly, loadingApprentice } = this.state

        const tournamentInfo = tournaments[tournamentType]
        let tournamentKey;
        let loading;

        if (tournamentType === "auto") {
            //console.log(tournamentInfo);
            let tId = tournamentInfo.id
            if (tournamentInfo.canSubscribe) {
                tId = parseInt(tournamentInfo['id']) - 1
            }

            tournamentKey = `autotournaments/${tId}`
            loading = loadingWeekly
        }

        if (tournamentType === "elite") {
            tournamentKey = "tournamentE"
            loading = loadingElite
        }

        if (tournamentType === "weekly") {
            tournamentKey = "tournamentK"
            loading = loadingWeekly
        }

        if (tournamentType === "apprentice") {
            tournamentKey = "tournamentW"
            loading = loadingApprentice
        }

        if (tournamentInfo.canSubscribe && !loading) {
            return (
                <div style={{ width: isMobile ? "100%" : 200, alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', marginTop: isMobile ? 14 : 0 }}>
                    {this.renderBtnSubscribe(tournamentInfo)}

                    <div style={{ width: 16 }} />

                    {this.renderBtnOpenTournament(tournamentKey)}
                </div>
            )
        }

        if (!tournamentInfo.canSubscribe && !loading) {
            return (
                <div style={{ width: isMobile ? "100%" : 200, alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-end', marginTop: isMobile ? 14 : 0 }}>
                    {this.renderBtnOpenTournament(tournamentKey)}
                </div>
            )
        }

        return (
            <div>
            {
                loading &&
                <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 40 }}>
                    <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                </div>
            }
            </div>
        )
    }

    renderAutoTournamentMobile(tournamentInfo, boxTournamentWidth) {
        const { mainTextColor, isDarkmode } = this.props

        const fee = 5
        const totalWiza = tournamentInfo.nPlayers.int * tournamentInfo.buyin
        const feeInWiza = _.round((totalWiza * fee) / 100, 2)
        const montepremi = _.round(totalWiza - feeInWiza, 2)

        const marginBottom = 14

        return (
            <div
                style={Object.assign({}, styles.boxTournament, { width: boxTournamentWidth, backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
            >
                {this.renderTitleTournament(tournamentInfo.name)}

                <p style={{ fontSize: 16, color: mainTextColor, marginTop: 14, marginBottom }}>
                    Tournament {tournamentInfo.id}
                </p>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom }}>
                    Level Cap: {tournamentInfo.levelCap}
                </p>

                <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <p style={{ fontSize: 16, color: mainTextColor }}>
                        Buyin {tournamentInfo.buyin} ${tournamentInfo.coinBuyin}
                    </p>

                    <p style={{ fontSize: 13, color: mainTextColor }}>
                        Fee {fee}%
                    </p>
                </div>

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ fontSize: 16, color: mainTextColor }}>
                        Prize {montepremi ? montepremi.toFixed(2) : '...'} ${tournamentInfo.coinBuyin}
                    </p>
                </div>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 16 }}>
                    Subscribed {tournamentInfo.wizards.length}/{tournamentInfo.nPlayers.int}
                </p>

                {
                    tournamentInfo.levelCap === 160 ?
                    <p style={{ fontSize: 14, color: mainTextColor }} className="text-light">
                        Rings, Pendants, Spell upgrades and Aura are not counted
                    </p>
                    :
                    undefined
                }

                {
                    tournamentInfo.levelCap === 225 ?
                    <p style={{ fontSize: 14, color: mainTextColor }} className="text-light">
                        Rings and Pendants are not counted
                    </p>
                    :
                    undefined
                }

                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

                <div style={{ alignItems: 'center', justifyContent: 'space-between' }}>

                    <div style={{ alignItems: 'center' }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginRight: 6 }}>
                            Registrations {tournamentInfo.canSubscribe ? "open" : "closed"}
                        </p>

                        {
                            tournamentInfo.canSubscribe ?
                            <AiFillCheckCircle
                                color='#4bb54b'
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
                        !tournamentInfo.completed && tournamentInfo.wizards.length < tournamentInfo.nPlayers.int &&
                        <p style={{ fontSize: 14, color: mainTextColor, marginLeft: 5 }} className="text-medium">
                            The tournament will start when there are {tournamentInfo.nPlayers.int} wizards registered.
                        </p>
                    }

                    {
                        !tournamentInfo.completed && tournamentInfo.wizards.length >= tournamentInfo.nPlayers.int &&
                        <p style={{ fontSize: 14, color: mainTextColor, marginLeft: 5 }} className="text-medium">
                            The tournament will start within 5 minutes.
                        </p>
                    }

                    {
                        tournamentInfo.completed &&
                        <p style={{ fontSize: 14, color: mainTextColor, marginLeft: 5 }} className="text-medium">
                            A new tournament will open in a few minutes
                        </p>
                    }

                </div>

                <div style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {this.renderBtns(tournamentInfo.name, true)}
                </div>
            </div>
        )
    }

    renderAutoTournamentDesktop(tournamentInfo, insideWidth) {
        const { mainTextColor, isDarkmode } = this.props

        //console.log(tournamentInfo);

        const fee = 5
        const totalWiza = tournamentInfo.nPlayers.int * tournamentInfo.buyin
        const feeInWiza = _.round((totalWiza * fee) / 100, 2)
        const montepremi = _.round(totalWiza - feeInWiza, 2)

        const marginBottom = 10

        return (
            <div style={{ marginBottom: 20, flexDirection: 'column', width: insideWidth }}>

                <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>

                    {this.renderTitleTournament(tournamentInfo.name)}

                    <div style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {this.renderBtns(tournamentInfo.name, false)}
                    </div>
                </div>

                <div
                    style={Object.assign({}, styles.boxTournament, { flexDirection: 'row', padding: 0, backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
                >

                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', width: '50%', padding: 8, textAlign: 'center' }}>

                        <p style={{ fontSize: 17, color: mainTextColor, textAlign: 'center', marginBottom }}>
                            Tournament {tournamentInfo.id}
                        </p>

                        <p style={{ fontSize: 17, color: mainTextColor, marginBottom }}>
                            Level Cap: {tournamentInfo.levelCap}
                        </p>

                        <p style={{ fontSize: 17, color: mainTextColor, marginBottom }}>
                            Structure: 4 knockout rounds
                        </p>

                        <p style={{ fontSize: 17, color: mainTextColor }}>
                            Buyin {tournamentInfo.buyin} {tournamentInfo.coinBuyin}
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor }}>
                            Fee {fee}%
                        </p>
                    </div>


                    <div style={{ width: 1, height: "100%", minHeight: "100%", backgroundColor: "#d7d7d750", marginTop: 1, marginBottom: 1 }} />

                    <div style={{ flexDirection: 'column', alignItems: 'center', width: '50%' }}>

                        <div style={{ position: 'relative', width: '100%', flexDirection: 'row', height: 30, borderTopRightRadius: 8, marginBottom, backgroundColor: tournamentInfo.canSubscribe ? "#4bb54b" : "grey", alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: 16, color: mainTextColor, marginRight: 7 }}>
                                Registrations {tournamentInfo.canSubscribe ? "open" : "closed"}
                            </p>

                            {
                                tournamentInfo.canSubscribe ?
                                <AiFillCheckCircle
                                    color='white'
                                    size={22}
                                />
                                :
                                <AiFillCheckCircle
                                    color='#504f4f'
                                    size={22}
                                />
                            }

                        </div>

                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, textAlign: 'center' }}>
                            {
                                !tournamentInfo.completed && tournamentInfo.wizards.length < tournamentInfo.nPlayers.int &&
                                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 16 }}>
                                    The tournament will start when there are {tournamentInfo.nPlayers.int} wizards registered.
                                </p>
                            }

                            {
                                !tournamentInfo.completed && tournamentInfo.wizards.length >= tournamentInfo.nPlayers.int &&
                                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 16 }}>
                                    The tournament will start within 5 minutes.
                                </p>
                            }

                            {
                                tournamentInfo.completed &&
                                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 16 }}>
                                    A new tournament will open in a few minutes
                                </p>
                            }

                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 16 }}>
                                Prize {montepremi ? montepremi.toFixed(2) : '...'} $WIZA
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 10 }}>
                                Subscribed {tournamentInfo.wizards.length}/{tournamentInfo.nPlayers.int}
                            </p>

                            {
                                tournamentInfo.levelCap === 160 ?
                                <p style={{ fontSize: 14, color: mainTextColor }} className="text-light">
                                    Rings, Pendants, Spell upgrades and Aura are not counted
                                </p>
                                :
                                undefined
                            }

                            {
                                tournamentInfo.levelCap === 225 ?
                                <p style={{ fontSize: 14, color: mainTextColor }} className="text-light">
                                    Rings and Pendants are not counted
                                </p>
                                :
                                undefined
                            }
                        </div>

                    </div>

                </div>
            </div>
        )
    }

    //creare un unico render comune ad ogni torneo
    renderTournamentDesktop(tournamentInfo, insideWidth) {
        const { mainTextColor, isDarkmode } = this.props

        const fee = tournamentInfo.fee
        const montepremi = this.calcMontepremi(tournamentInfo)

        let finalDate = this.calcFinalDate(tournamentInfo)

        const tournamentName = tournamentInfo.name.split("_")[0].replace("t", "")

        const marginBottom = 10

        return (
            <div style={{ marginBottom: 20, flexDirection: 'column', width: insideWidth }}>

                <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>

                    {this.renderTitleTournament(tournamentInfo.type)}

                    <div style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {this.renderBtns(tournamentInfo.type, false)}
                    </div>
                </div>

                <div
                    style={Object.assign({}, styles.boxTournament, { flexDirection: 'row', padding: 0, backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2" })}
                >

                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', width: '50%', padding: 8, textAlign: 'center' }}>

                        <p style={{ fontSize: 17, color: mainTextColor, textAlign: 'center', marginBottom }}>
                            Tournament {tournamentName}
                        </p>

                        <p style={{ fontSize: 17, color: mainTextColor, marginBottom }}>
                            Level Cap: {tournamentInfo.levelCap}
                        </p>

                        <p style={{ fontSize: 17, color: mainTextColor, marginBottom }}>
                            Structure: {tournamentInfo.structure}
                        </p>

                        <p style={{ fontSize: 17, color: mainTextColor }}>
                            Buyin {tournamentInfo.buyin} ${tournamentInfo.coinBuyin}
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor }}>
                            Fee {fee}%
                        </p>
                    </div>


                    <div style={{ width: 1, height: "100%", minHeight: "100%", backgroundColor: "#d7d7d750", marginTop: 1, marginBottom: 1 }} />

                    <div style={{ flexDirection: 'column', alignItems: 'center', width: '50%' }}>

                        <div style={{ position: 'relative', width: '100%', flexDirection: 'row', height: 30, borderTopRightRadius: 8, marginBottom, backgroundColor: tournamentInfo.canSubscribe ? "#4bb54b" : "grey", alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: 16, color: mainTextColor, marginRight: 7 }}>
                                Registrations {tournamentInfo.canSubscribe ? "open" : "closed"}
                            </p>

                            {
                                tournamentInfo.canSubscribe ?
                                <AiFillCheckCircle
                                    color='white'
                                    size={22}
                                />
                                :
                                <AiFillCheckCircle
                                    color='#504f4f'
                                    size={22}
                                />
                            }

                            {
                                finalDate &&
                                <p style={{ position: insideWidth < 950 ? 'relative' : 'absolute', marginLeft: 10, right: 5, fontSize: 13, color: mainTextColor }} className="text-medium">
                                    {finalDate}
                                </p>
                            }
                        </div>

                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, textAlign: 'center' }}>
                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: tournamentInfo.extraPrize ? 4 : 16 }}>
                                Prize {montepremi ? montepremi.toFixed(2) : '...'} ${tournamentInfo.coinBuyin}
                            </p>

                            {
                                tournamentInfo.extraPrize &&
                                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 16 }}>
                                    Extra prize {tournamentInfo.extraPrize ? tournamentInfo.extraPrize.toLocaleString() : '...'} ${tournamentInfo.coinBuyin}
                                </p>
                            }

                            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 10 }}>
                                Subscribed {tournamentInfo.subs.int}
                            </p>

                            <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 16 }}>
                                Wizard participation reward: {tournamentInfo.reward}
                            </p>

                            {
                                tournamentInfo.levelCap === 160 ?
                                <p style={{ fontSize: 14, color: mainTextColor }} className="text-light">
                                    Rings, Pendants, Spell upgrades and Aura are not counted
                                </p>
                                :
                                undefined
                            }

                            {
                                tournamentInfo.levelCap === 225 ?
                                <p style={{ fontSize: 14, color: mainTextColor }} className="text-light">
                                    Rings and Pendants are not counted
                                </p>
                                :
                                undefined
                            }
                        </div>

                    </div>

                </div>
            </div>
        )
    }

    renderRowChoise(item, index, modalWidth) {
		const { tournamentSubs, toSubscribe } = this.state

		return (
			<NftCardChoice
				key={index}
				item={item}
				width={230}
				canSubscribe={tournamentSubs.canSubscribe}
                toSubscribe={toSubscribe}
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
				section={"tournament"}
			/>
		)
	}

    renderRowChoised(item, index, modalWidth) {
		const { subscriptionsInfo, potionsEquipped } = this.state

		return (
			<NftCardChoice
				key={index}
				item={item}
				width={230}
                subscriptionsInfo={subscriptionsInfo}
				modalWidth={modalWidth}
                potionsEquipped={potionsEquipped}
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
        const { loadingWeekly, loadingApprentice, loadingElite, tournaments, error, showSubs, yourSubs, tournamentSubs } = this.state
        const { filtriProfileRanges, mainTextColor, mainBackgroundColor } = this.props

        let { boxW, modalW, padding } = getBoxWidth(isMobile)
        const insideWidth = boxW > 1000 ? 1000 : boxW

        if (loadingWeekly || loadingApprentice || loadingElite) {
            return (
                <div style={{ width: boxW, height: 50, justifyContent: 'center', alignItems: 'center', padding }}>
                    <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                </div>
            )
        }

        let boxTournamentWidth = isMobile ? (insideWidth * 95 / 100) : (insideWidth - 140) / 3
        if (boxTournamentWidth > 370) {
            boxTournamentWidth = 370
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, alignItems: 'center', padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 40 }} className="text-bold">
                    Weekly Tournaments
                </p>

                {
					this.state.loading ?
					<div style={{ width: insideWidth, height: 50, marginBottom: 30, justifyContent: 'center', alignItems: 'center' }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                {
                    isMobile ?
                    <div style={{ width: insideWidth, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 30 }}>

                        {this.renderAutoTournamentMobile(tournaments["auto"], boxTournamentWidth)}

                        {/*this.renderTournamentMobile(tournaments["elite"], boxTournamentWidth)*/}

                        {this.renderTournamentMobile(tournaments["weekly"], boxTournamentWidth)}

                        {this.renderTournamentMobile(tournaments["apprentice"], boxTournamentWidth)}
                    </div>
                    :
                    //DESKTOP
                    <div style={{ width: insideWidth, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
                        {this.renderAutoTournamentDesktop(tournaments["auto"], insideWidth)}

                        {/*this.renderTournamentDesktop(tournaments["elite"], insideWidth)*/}

                        {this.renderTournamentDesktop(tournaments["weekly"], insideWidth)}

                        {this.renderTournamentDesktop(tournaments["apprentice"], insideWidth)}
                    </div>
                }

                {
					this.state.loading ?
					<div style={{ width: insideWidth, height: 50, justifyContent: 'center', alignItems: 'center' }} id="loading">
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                {
                    showSubs && yourSubs.length > 0 && yourSubs[0].length > 0 &&
                    <div style={{ flexDirection: 'column', width: insideWidth }} id="alreadySubDiv">
                        <p style={{ fontSize: 22, color: mainTextColor, marginTop: 10, marginBottom: 15, textAlign: 'center' }} className="text-medium">
                            Wizards subscribed
                        </p>

                        <div style={{ marginBottom: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {yourSubs[0].map((item, index) => this.renderRowChoised(item, index, modalW))}
                        </div>
                    </div>
                }

                {
                    showSubs && yourSubs.length > 0 && yourSubs[1].length > 0 &&
                    <div style={{ flexDirection: 'column', width: insideWidth }} id="filters">
                        <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginBottom: 15 }} />

                        <p style={{ fontSize: 22, color: mainTextColor, marginTop: 10, marginBottom: 10, textAlign: 'center' }} className="text-medium">
                            Wizards not subscribed
                        </p>

                        <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 5, textAlign: 'center' }} className="text-medium">
                            Level Cap {tournamentSubs.levelCap}
                        </p>
                        {
                            tournamentSubs.name && tournamentSubs.name === "auto" ?
                            <div style={{ height: 16 }} />
                            :
                            <p style={{ fontSize: 15, color: 'red', marginBottom: 20, textAlign: 'center' }}>
                                You can sub any wizard but if he exceeds the level cap he will only get the participation prize and he will not do any fights
                            </p>
                        }
                    </div>
                }

                {
                    showSubs && filtriProfileRanges && yourSubs[1].length > 0 &&
                    <div style={{ flexWrap: 'wrap', width: insideWidth, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>
                        {this.renderBoxSearchStat("hp", "HP", filtriProfileRanges["hp"])}
                        {this.renderBoxSearchStat("defense", "Defense", filtriProfileRanges["defense"])}
                        {this.renderBoxSearchStat("attack", "Attack", filtriProfileRanges["attack"])}
                        {this.renderBoxSearchStat("damage", "Damage", filtriProfileRanges["damage"])}
                        {this.renderBoxSearchStat("speed", "Speed", filtriProfileRanges["speed"])}
    					{this.renderBoxSearchStat("element", "Element", ["Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"])}
    					{this.renderBoxSearchStat("resistance", "Resistance", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
    					{this.renderBoxSearchStat("weakness", "Weakness", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
    					{this.renderBoxSearchStat("spellbook", "Spellbook", [1, 2, 3, 4])}
    					{this.renderBoxSearchStat("level", "Level", ["122 - 150", "151 - 175", "176 - 200", "201 - 225", "226 - 250", "251 - 275", "276 - 300", "301 - 325", "326 - 350", "351 - 400"].reverse())}
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
		height: 34,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        display: 'flex',
        cursor: 'pointer'
	},
    boxTournament: {
        borderRadius: 8,
        flexDirection: 'column',
        padding: 12,
        borderWidth: 1,
        borderColor: "#d7d7d750",
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
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, userMintedNfts, wizaBalance, filtriProfileRanges, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, userMintedNfts, wizaBalance, filtriProfileRanges, mainTextColor, mainBackgroundColor, isDarkmode };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    loadUserMintedNfts,
    subscribeToTournamentMass,
    subscribeToTournamentMassWIZA,
    getSubscriptions,
    subscribeToTournamentMassELITE,
    updateInfoTransactionModal,
    fetchAccountDetails,
    getWizaBalance,
    getCountForTournament,
    getPotionEquippedMass,
    getAutoTournament,
    subscribeToTournamentMassAuto
})(Tournament)
