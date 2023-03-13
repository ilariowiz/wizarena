import React, { Component } from 'react';
import { connect } from 'react-redux'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import { AiOutlineReload } from 'react-icons/ai';
import { AiOutlineShareAlt } from 'react-icons/ai';
import { IoEyeOffOutline } from 'react-icons/io5';
import { IoEyeOutline } from 'react-icons/io5';
import moment from 'moment'
import toast, { Toaster } from 'react-hot-toast';
import { getDocs, collection, doc, getDoc, query, where } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Header from './Header';
import ModalTransaction from './common/ModalTransaction'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import ModalTransfer from './common/ModalTransfer'
import ModalMakeOffer from './common/ModalMakeOffer'
import HistoryItemNft from './common/HistoryItemNft'
import HistoryListedNft from './common/HistoryListedNft'
import OfferItem from './common/OfferItem'
import getImageUrl from './common/GetImageUrl'
import getRingBonuses from './common/GetRingBonuses'
import traits_qty from './common/Traits_qty'
import traits_qty_clerics from './common/Traits_qty_clerics'
import conditions from './common/Conditions'
import allSpells from './common/Spells'
import titles from './common/LeagueTitle'
import { calcLevelWizard, getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import 'reactjs-popup/dist/index.css';
import {
	setNetworkSettings,
	setNetworkUrl,
	loadSingleNft,
	delistNft,
	listNft,
	buyNft,
	clearTransaction,
	transferNft,
	getInfoNftBurning,
	getOffersForNft,
	makeOffer,
	acceptOffer,
	getInfoItemEquipped
} from '../actions'
import { MAIN_NET_ID, REVEAL_CAP, BACKGROUND_COLOR, TEXT_SECONDARY_COLOR, CTA_COLOR, CONTRACT_NAME } from '../actions/types'
import '../css/Nft.css'

const logoKda = require('../assets/kdalogo2.png')
const burn_overlay = require('../assets/burn_overlay.png')


class Nft extends Component {
	constructor(props) {
		super(props)

		this.state = {
			nft: {},
			nftH: [],
			error: '',
			inputPrice: '',
			typeModal: '',
			showModalConnection: false,
			showModalTransfer: false,
			kadenaPrice: 0,
			loading: true,
			fights: [],
			traitsRank: undefined,
			loadingHistory: true,
			numbersOfMaxMedalsPerTournament: [],
			historyUpgrades: [],
			openFightsSection: [],
			infoBurn: {},
			level: 0,
			offers: [],
			loadingOffers: true,
			showModalOffer: false,
			offerInfoRecap: "",
			makeOfferValues: {},
			saleValues: {},
			equipment: {},
			maxStats: undefined
		}
	}

	componentDidMount() {
		//console.log(this.props.account)
		document.title = `Wizards Arena`

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")
		this.loadKadenaPrice()
		this.loadMaxStats()

		this.getPathNft()
	}

	loadKadenaPrice() {
		fetch('https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=usd')
		.then(response => response.json())
		.then(data => {
			//console.log(data)
			this.setState({ kadenaPrice: data.kadena.usd })
		})
		.catch(error => console.log(error))
	}

	async loadMaxStats() {
		const docRef = doc(firebasedb, "max_stats", 'm')

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

		this.setState({ maxStats: data })
	}

	getPathNft() {
		const { nftSelected, allNfts, userMintedNfts, subscribed, subscribedWiza } = this.props

		const { pathname } = this.props.location;
		const idNft = pathname.replace('/nft/', '')

		//console.log(this.props.nftSelected, allNfts);

		if (nftSelected && nftSelected === idNft) {
			let item = allNfts && allNfts.length > 0 && allNfts.find(i => i.id === idNft)
			//console.log(item);
			//console.log('info exist');
			if (!item && userMintedNfts && userMintedNfts.length > 0) {
				item = userMintedNfts.find(i => i.id === idNft)
			}

			if (!item && subscribed && subscribed.length > 0) {
				item = subscribed.find(i => i.id === idNft)
			}

			if (!item && subscribedWiza && subscribedWiza.length > 0) {
				item = subscribedWiza.find(i => i.id === idNft)
			}

			if (item && item.name) {
				setTimeout(() => {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}, 100)
				this.loadExtraInfo(item)
			}
			else {
				setTimeout(() => {
					this.loadNft(idNft)
				}, 500)
			}
		}
		else {
			setTimeout(() => {
				this.loadNft(idNft)
			}, 500)
		}
	}

	groupFights(array, key) {

		let temp = []

		for (let i = 0; i < array.length; i++) {
			const fight = array[i]

			const tournamentFight = fight.tournament.split("_")[0]

			if (tournamentFight === key) {
				temp.push(fight)
			}
		}

		return temp
	}

	loadNft(idNft) {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		this.props.loadSingleNft(chainId, gasPrice, gasLimit, networkUrl, idNft, (response) => {
			if (response.name) {
				this.loadExtraInfo(response)
			}
			else {
				this.setState({ error: '404', loading: false })
			}
		})
	}

	loadExtraInfo(response) {
		document.title = `${response.name} - Wizards Arena`

		//console.log(response)
		//console.log(Object.keys(response.medals));

		let tournaments = []
		response.fights.map(i => {
			const torneoName = i.tournament.split("_")[0]
			if (!tournaments.includes(torneoName)) {
				tournaments.push(torneoName)
			}
		})

		//let tournaments = Object.keys(response.medals)
		tournaments.sort((a, b) => {
			return parseInt(a.replace("t", "")) - parseInt(b.replace("t", ""))
		})

		response['groupedFights'] = {}

		let openFightsSection = []

		if (response.fights) {
			tournaments.map(i => {
				const groupedFight = this.groupFights(response.fights, i)
				//console.log(groupedFight);
				if (groupedFight.length > 0) {
					openFightsSection = [i]
				}

				response['groupedFights'][i] = groupedFight
			})
		}

		//console.log(openFightsSection);
		//console.log(response);

		const level = calcLevelWizard(response)

		this.setState({ nft: response, level, loading: false, openFightsSection }, () => {
			this.loadHistory(response.id)
			this.getHistoryUpgrades()
			this.loadMaxMedalsPerTournament()

			this.loadOffers(response.id)

			this.loadEquipment(response.id)

			if (response.confirmBurn) {
				this.loadInfoBurn(response.id)
			}
		})
	}

	loadInfoBurn(idNft) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getInfoNftBurning(chainId, gasPrice, gasLimit, networkUrl, idNft, (response) => {
            //console.log(response);
            this.setState({ infoBurn: response })
        })
    }

	loadOffers(idNft) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getOffersForNft(chainId, gasPrice, gasLimit, networkUrl, idNft, (response) => {
            //console.log(response);
			if (response && response.status !== "failure") {

				let offers = []

				response.map(i => {
					const expiresat = moment(i.expiresat.timep)

					//console.log(expiresat, moment());

					if (expiresat >= moment()) {
						offers.push(i)
					}
				})

				this.setState({ offers, loadingOffers: false })
			}
			else {
				this.setState({ loadingOffers: false })
			}

        })
    }


	loadEquipment(idNft) {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, idNft, (response) => {
			//console.log(response);
			this.setState({ equipment: response })
		})
	}


	async getHistoryUpgrades() {
		const { nft } = this.state

		//console.log(nft);

		const docRef = doc(firebasedb, "base_stats", `${nft.id}`)

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

		//console.log(data);

		let historyUpgrades = []

		if (nft.hp.int > data.hp) {
			let difference = nft.hp.int - data.hp
			historyUpgrades.push({ stat: "hp", value: difference })
		}
		if (nft.defense.int > data.defense) {
			let difference = nft.defense.int - data.defense
			historyUpgrades.push({ stat: "defense", value: difference })
		}
		if (nft.attack.int > data.attack) {
			let difference = nft.attack.int - data.attack
			historyUpgrades.push({ stat: "attack", value: difference })
		}
		if (nft.damage.int > data.damage) {
			let difference = nft.damage.int - data.damage
			historyUpgrades.push({ stat: "damage", value: difference })
		}

		if (nft.speed && nft.speed.int > 0) {
			historyUpgrades.push({ stat: "speed", value: nft.speed.int })
		}

		this.setState({ historyUpgrades })
    }

	async loadHistory(idNft) {

		const q = query(collection(firebasedb, "sales"), where("idnft", "==", idNft))

		const querySnapshot = await getDocs(q)

		let nftH = []

		querySnapshot.forEach(doc => {
			nftH.push(doc.data())
		})

		nftH.sort((a, b) => {
			return new Date(b.blockTime) - new Date(a.blockTime)
		})

		console.log(nftH);

		this.setState({ nftH, loadingHistory: false })
	}

	async loadMaxMedalsPerTournament() {

		const docSnap = await getDocs(collection(firebasedb, "history_tournament"))

		let numbersOfMaxMedalsPerTournament = []

		docSnap.forEach(doc => {
			//console.log(doc.id, doc.data());

			const obj = {
				tournamentName: doc.id,
				maxMedals: doc.data().maxMedals
			}

			numbersOfMaxMedalsPerTournament.push(obj)
		})

		this.setState({ numbersOfMaxMedalsPerTournament })
	}

	list() {
		const { nft, inputPrice } = this.state;
		const { account, chainId, gasPrice, netId } = this.props

		if (!this.onlyNumbers(inputPrice) || !inputPrice || parseInt(inputPrice) < 0) {
			//console.log('price bad format')
			toast.error('Please enter a valid amount')
			return
		}

		if (nft.owner !== account.account) {
			//console.log('you are not the owner')
			return
		}

		this.setState({ typeModal: 'list' }, () => {
			this.props.listNft(chainId, gasPrice, 1700, netId, nft.id, parseFloat(inputPrice).toFixed(2), account)
		})

	}

	delist() {
		const { nft } = this.state;
		const { account, chainId, gasPrice, netId } = this.props

		this.setState({ typeModal: 'delist' }, () => {
			this.props.delistNft(chainId, gasPrice, 700, netId, account, nft.id)
		})
	}

	buy() {
		const { nft } = this.state
		const { account, chainId, gasPrice, netId } = this.props

		let saleValues = { id: nft.id, amount: nft.price }

		this.setState({ typeModal: 'buy', saleValues }, () => {
			this.props.buyNft(chainId, gasPrice, 7000, netId, account, nft)
		})
	}

	transfer(receiver) {
		const { nft } = this.state
		const { account, chainId, gasPrice, netId } = this.props

		this.setState({ typeModal: 'transfer' }, () => {
			this.props.transferNft(chainId, gasPrice, 1500, netId, nft.id, account, receiver)
		})
	}

	submitOffer(amount, duration) {
		const { nft } = this.state
		const { account, chainId, gasPrice, netId } = this.props

		//console.log(amount, duration);

		const makeOfferValues = {
			id: nft.id,
			amount,
			duration,
			owner: nft.owner
		}

		this.setState({ typeModal: 'makeoffer', showModalOffer: false, makeOfferValues }, () => {
			this.props.makeOffer(chainId, gasPrice, 4000, netId, nft.id, account, duration, amount)
		})
	}

	acceptOffer(offer) {
		const { nft } = this.state
		const { account, chainId, gasPrice, netId } = this.props

		//console.log(amount, duration);
		let offerInfoRecap = `You are accepting an offer of ${offer.amount} KDA (minus 7% marketplace fee) for #${nft.id}`

		let saleValues = { id: nft.id, amount: offer.amount }

		this.setState({ typeModal: 'acceptoffer', offerInfoRecap, saleValues }, () => {
			this.props.acceptOffer(chainId, gasPrice, 5000, netId, offer.id, nft.id, account)
		})
	}

	copyLink() {
		//console.log(window.location.href)
		navigator.clipboard.writeText(window.location.href)

		toast.success('Link copied to clipboard')
	}

	onlyNumbers(str) {
		return /^[0-9]+$/.test(str);
	}

	renderTraits(item, index) {
		//console.log(nft);
		const { nft } = this.state

		let percentString;
		if (parseInt(this.state.nft.id) < REVEAL_CAP) {

			//se id < 1024 prendiamo i tratti dei wizards, altrimenti quelli dei clerics
			if (parseInt(nft.id) < 1024) {
				const section = traits_qty[item.trait_type.toLowerCase()]
				const qty = section[item.value]

				percentString = qty * 100 / 1024
			}
			else if (parseInt(nft.id) >= 1024 && parseInt(nft.id) < 2048) {
				const section = traits_qty_clerics[item.trait_type.toLowerCase()]
				const qty = section[item.value]

				percentString = qty * 100 / 1024
			}
		}
		else {
			return <div />
		}

		return (
			<div style={styles.boxSingleTrait} key={index}>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 15 }}>
					{item.trait_type.toUpperCase()}
				</p>

				<p style={{ color: 'white', fontSize: 18 }}>
					{item.value}
				</p>

				{
					percentString ?
					<p style={{ color: '#8d8b8b', fontSize: 14 }}>
						{percentString.toFixed(2)}% have this trait
					</p>
					: null
				}

			</div>
		)
	}

	renderMedal(item) {
		const { nft, numbersOfMaxMedalsPerTournament } = this.state

		//console.log(numbersOfMaxMedalsPerTournament);

		let numbersOfMedals = '0'

		if (nft.medals[item]) {
			numbersOfMedals = nft.medals[item].int || nft.medals[item]
		}

		//console.log(numbersOfMedals);

		const maxMedals = numbersOfMaxMedalsPerTournament.length > 0 ? numbersOfMaxMedalsPerTournament.find(i => i.tournamentName === item) : '0'

		return (
			<div style={styles.boxSingleTrait} key={item}>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 13, marginBottom: 5 }}>
					TOURNAMENT {item.replace("t", "")}
				</p>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 20 }}>
					{numbersOfMedals} / {maxMedals.maxMedals}
				</p>

			</div>
		)
	}

	renderSpell(item, index) {

		const marginRight = 12

		//console.log(item);

		let spell = allSpells.find(i => i.name === item.name)

		let condDesc;
		if (spell.condition && spell.condition.name) {
			let condInfo = conditions.find(i => i.name === spell.condition.name)
			if (condInfo) {
				condDesc = `${condInfo.effect} - Chance of success: ${spell.condition.pct}%`
			}
		}

		return (
			<div key={index} style={{ alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 }}>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginRight: 5, marginBottom: 1 }}>
					NAME
				</p>
				<p style={{ color: "white", fontSize: 20, marginRight }}>
					{spell.name}
				</p>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginRight: 5, marginBottom: 1 }}>
					PERK
				</p>

				{
					spell.condition && spell.condition.name ?
					<Popup
						trigger={open => (
							<button style={{ color: "white", fontSize: 20, marginRight }}>
								{spell.condition.name}
							</button>
						)}
						position="top center"
						on="hover"
					>
						<div style={{ padding: 10, fontSize: 16 }}>
							{condDesc}
						</div>
					</Popup>
					:
					<p style={{ color: "white", fontSize: 20, marginRight }}>
						-
					</p>
				}



				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginRight: 5, marginBottom: 1 }}>
					BASE ATK
				</p>
				<p style={{ color: "white", fontSize: 20, marginRight }}>
					{spell.atkBase}
				</p>

				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginRight: 5, marginBottom: 1 }}>
					BASE DMG
				</p>
				<p style={{ color: "white", fontSize: 20 }}>
					{spell.dmgBase}
				</p>

			</div>
		)
	}

	renderMainFight(key, index) {
		const { nft, openFightsSection } = this.state

		//console.log(key, index);

		if (nft.groupedFights && nft.groupedFights[key].length > 0) {
			return (
				<div style={Object.assign({}, styles.boxSingleTrait, { alignItems: 'flex-start' })} key={index}>

					<button
						style={{ alignItems: 'center', marginTop: 4, marginLeft: 6, marginRight: 6, flexDirection: 'row', display: 'flex' }}
						onClick={() => {
							let openFightsSectionCopy = Object.assign([], this.state.openFightsSection)

							if (openFightsSectionCopy.includes(key)) {
								let idx = openFightsSectionCopy.findIndex(i => i === key)
								if (idx > -1) {
									openFightsSectionCopy.splice(idx, 1)
								}
							}
							else {
								openFightsSectionCopy.push(key)
							}

							//console.log(openFightsSectionCopy);

							this.setState({ openFightsSection: openFightsSectionCopy })
						}}
					>
						<p style={{ fontSize: 14, color: '#eae9e9', marginRight: 15 }}>
							TOURNAMENT <span style={{ fontSize: 18, color: 'white' }}>{key.replace("t","")}</span>
						</p>

						{
							openFightsSection.includes(key) ?
							<IoEyeOffOutline
								size={20}
								color="white"
							/>
							:
							<IoEyeOutline
								size={20}
								color="white"
							/>
						}

					</button>

					{
						openFightsSection.includes(key) ?
						<div style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
							{Object.values(nft.groupedFights[key]).map((item, index) => {
								return this.renderFight(item, index)
							})}
						</div>
						: null
					}


				</div>
			)
		}

		return <div key={index} />

	}

	renderFight(item, index) {
		const { nft } = this.state

		//let tournament = item.tournament.split("_")[0]
		let round = item.tournament.split("_")[1]

		const textWinner = item.winner === nft.id ? "WINNER" : "LOSER"
		const textWinnerColor = textWinner === "WINNER" ? TEXT_SECONDARY_COLOR : "#0587a2"

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/fight/${item.fightId}`}
				className='btnH'
				style={styles.boxSingleTrait}
				key={index}
				onClick={(e) => {
					e.preventDefault()
					this.props.history.push(`/fight/${item.fightId}`)
				}}
			>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginBottom: 5 }}>
					round {round.replace("r", "")}
				</p>
				<p style={{ color: textWinnerColor, fontSize: 17 }}>
					{textWinner}
				</p>
			</a>
		)
	}

	renderHistoryItem(item, index, isMobile) {
		const { nftH } = this.state

		if (item.type && item.type === "LISTED") {
			return (
				<HistoryListedNft
					item={item}
					index={index}
					nftH={nftH}
					key={index}
					isMobile={isMobile}
				/>
			)
		}

		return (
			<HistoryItemNft
				item={item}
				index={index}
				nftH={nftH}
				key={index}
				isMobile={isMobile}
			/>
		)
	}

	renderOffersItem(item, index, isMobile) {
		const { account } = this.props
		const { nft, kadenaPrice } = this.state

		return (
			<OfferItem
				item={item}
				index={index}
				isOwner={account.account === nft.owner}
				isBuyer={account.account === item.buyer}
				showImage={false}
				kadenaPrice={kadenaPrice}
				key={item.id}
				isMobile={isMobile}
				history={this.props.history}
				onAcceptOffer={() => this.acceptOffer(item)}
				onWithdrawOffer={() => {
					this.setState({ typeModal: 'withdrawoffer' })
				}}
			/>
		)
	}

	// SE NFT é LISTATO ******************************************
	// GESTIAMO I CASI: Connect Wallet, Cancel Listing, Buy Now, Make Offer
	renderBtnBuy(width, marginRight, isMobile) {
		const { nft } = this.state;
		const { account } = this.props

		if (!account || (account && !account.account)) {

			let style = isMobile ? { height: '100%', flexDirection: 'column', marginLeft: 15, justifyContent: 'flex-end' }
									:
									{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }

			return (
				<div style={style}>
					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width, marginRight })}
						onClick={() => this.setState({ showModalConnection: true })}
					>
						<p style={Object.assign({}, styles.btnBuyText, { fontSize: 19 })}>
							Connect wallet
						</p>
					</button>
				</div>
			)
		}

		if (nft.owner === account.account) {

			let style = isMobile ? { height: '100%', flexDirection: 'column', marginLeft: 15, justifyContent: 'flex-end' }
									:
									{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }

			return (
				<div style={style}>
					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width, marginRight, marginBottom: 20 })}
						onClick={() => this.list()}
					>
						<p style={styles.btnBuyText}>
							Update price
						</p>
					</button>

					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width, marginRight })}
						onClick={() => this.delist()}
					>
						<p style={styles.btnBuyText}>
							Cancel listing
						</p>
					</button>
				</div>
			)
		}

		let style = isMobile ? { height: '100%', flexDirection: 'column', marginLeft: 15, marginTop: 10, justifyContent: 'space-between' }
								:
								{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around' }

		return (
			<div style={style}>

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width, marginRight })}
					onClick={() => this.setState({ showModalOffer: true })}
				>
					<p style={styles.btnBuyText}>
						Make offer
					</p>
				</button>

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width, marginRight })}
					onClick={() => this.buy()}
				>
					<p style={styles.btnBuyText}>
						Buy now
					</p>
				</button>
			</div>
		)
	}

	renderBtnMakeOffer(width, marginRight, isMobile) {

		let style = isMobile ? { height: '100%', flexDirection: 'column', marginLeft: 15, justifyContent: 'flex-end' }
								:
								{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }

		return (
			<div style={style}>

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width, marginRight })}
					onClick={() => this.setState({ showModalOffer: true })}
				>
					<p style={styles.btnBuyText}>
						Make offer
					</p>
				</button>
			</div>
		)
	}

	renderBtnConnect(width, marginRight, isMobile) {

		let style = isMobile ? { marginLeft: 15 }
								:
								{ alignItems: 'center', justifyContent: 'center', marginRight }

		return (
			<div style={style}>
				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width })}
					onClick={() => this.setState({ showModalConnection: true })}
				>
					<p style={Object.assign({}, styles.btnBuyText, { fontSize: 18 })}>
						Connect wallet
					</p>
				</button>
			</div>
		)
	}

	renderBtnSell(width, marginRight, isMobile) {
		const { nft } = this.state
		const { account } = this.props

		let style = isMobile ? { flexDirection: 'column', height: '100%', marginLeft: 15, marginTop: 10, justifyContent: 'space-between' }
								:
								{ flexDirection: 'column', height: '100%', alignItems: 'flex-end', justifyContent: 'space-between' }

		return (
			<div style={style}>
				{
					!nft.listed && account && account.account && nft.owner === account.account ?
					<button
						className="btnH"
						style={Object.assign({}, styles.btnTransfer, { marginRight })}
						onClick={() => this.setState({ showModalTransfer: true })}
					>
						<p style={{ color: 'white', fontSize: 17 }}>
							Transfer
						</p>
					</button>
					: null
				}

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width, marginRight })}
					onClick={() => this.list()}
				>
					<p style={styles.btnBuyText}>
						Sell
					</p>
				</button>
			</div>
		)
	}

	renderName(marginBottom) {
		const { nft } = this.state

		let type = "Wizard"
		if (parseInt(nft.id) >= 1023 && parseInt(nft.id) < 2048) {
			type = "Cleric"
		}
		else if (parseInt(nft.id) >= 2048 && parseInt(nft.id) < 3072) {
			type = 'Druid'
		}

		let title = titles[nft.id]

		return (
			<div style={{ flexDirection: 'column', marginBottom }}>
				{
					nft.nickname ?
					<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 26, lineHeight: 1 }}>
						{nft.name} {nft.nickname}
					</p>
					:
					<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 30, lineHeight: 1 }}>
						{type} {nft.name}
					</p>
				}

				{
					title ?
					<div style={{ marginTop: 10, alignItems: 'center' }}>
						<img
							style={{ width: 40, height: 40, marginRight: 6 }}
							src={title.img}
						/>

						<p style={{ fontSize: 22, color: title.textColor }}>
							{title.title}
						</p>
					</div>
					: null
				}
			</div>
		)
	}

	renderLeftBoxPriceListed(isOwner) {
		const { nft, kadenaPrice, inputPrice } = this.state

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>

				{this.renderName(24)}

				<div style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', marginTop: 15 }}>
					<p style={{ color: '#c2c0c0', fontSize: 17, marginBottom: 4 }}>
						Current price
					</p>

					<div>
						<img
							style={{ width: 20, height: 20, marginRight: 5 }}
							src={logoKda}
							alt={nft.id}
						/>

						<p style={{ fontSize: 24, color: 'white', lineHeight: 1, marginTop: 2 }}>
							{nft.price}
						</p>
					</div>

					<p style={{ color: '#c2c0c0', fontSize: 16 }}>
						(${(kadenaPrice * nft.price).toFixed(2)})
					</p>
				</div>

				{
					isOwner &&
					<div style={{ flexDirection: 'column', marginTop: 15 }}>
						<p style={{ color: '#c2c0c0', fontSize: 17 }}>
							Update price
						</p>

						<input
							style={styles.inputPrice}
							placeholder='KDA'
							value={inputPrice}
							onChange={(e) => this.setState({ inputPrice: e.target.value })}
						/>
					</div>
				}
			</div>
		)
	}

	renderLeftBoxListing() {
		const { inputPrice, kadenaPrice } = this.state

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>

				{this.renderName(24)}

				<div style={{ flexDirection: 'column', marginTop: 15 }}>
					<p style={{ color: '#c2c0c0', fontSize: 17 }}>
						Set price
					</p>

					<p style={{ color: '#c2c0c0', fontSize: 16, marginTop: 5 }}>
						${(kadenaPrice * inputPrice).toFixed(2)}
					</p>

					<input
						style={styles.inputPrice}
						placeholder='KDA'
						value={inputPrice}
						onChange={(e) => this.setState({ inputPrice: e.target.value })}
					/>
				</div>

			</div>
		)
	}

	renderLeftMakeOffer() {
		const { infoBurn } = this.state

		const isBurned = infoBurn && infoBurn.burned

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>
				{this.renderName(0)}

				{
					isBurned &&
					<p style={{ fontSize: 22, color: "white", marginTop: 10 }}>
						BURNED
					</p>
				}
			</div>
		)
	}

	renderBoxShare() {
		return (
			<div style={styles.boxShare}>
				<button
					style={styles.btnReload}
					onClick={() => this.getPathNft()}
				>
					<AiOutlineReload
						size={23}
						color={CTA_COLOR}
					/>
				</button>

				<div style={{ height: 40, width: 2, backgroundColor: CTA_COLOR }} />

				<button
					style={styles.btnShare}
					onClick={() => this.copyLink()}
				>
					<AiOutlineShareAlt
						size={25}
						color={CTA_COLOR}
					/>
				</button>
			</div>
		)
	}

	renderUpgrade(item, index) {
		return (
			<div style={{ alignItems: 'center', marginBottom: 8, marginRight: 15 }} key={index}>
				<p style={{ fontSize: 18, color: '#8d8b8b', marginRight: 5 }}>
					{item.stat}
				</p>

				<p style={{ fontSize: 18, color: 'white' }}>
					+{item.value}
				</p>
			</div>
		)
	}

	renderStat(title, value) {
		const { equipment, maxStats } = this.state

		//console.log(equipment);

		let fixedValue = value

		if (title === "SPELL PERK") {
			let condDesc;
			if (fixedValue && fixedValue !== "-") {

				//console.log(fixedValue);

				let spellInfo = allSpells.find(i => i.condition.name && i.condition.name.toUpperCase() === fixedValue)
				//console.log(spellInfo);
				if (spellInfo) {
					let condInfo = conditions.find(i => i.name.toUpperCase() === fixedValue)
					if (condInfo) {
						condDesc = `${condInfo.effect} - Chance of success: ${spellInfo.condition.pct}%`
					}
				}
			}

			return (
				<div style={{ alignItems: 'center', marginBottom: 10 }}>
					<p style={styles.textTitleStat}>{title}</p>

					{
						condDesc ?
						<Popup
							trigger={open => (
								<button style={styles.textValueStat}>{fixedValue}</button>
							)}
							position="top center"
							on="hover"
						>
							<div style={{ padding: 10, fontSize: 16 }}>
								{condDesc}
							</div>
						</Popup>
						:
						<p style={styles.textValueStat}>{fixedValue}</p>
					}

				</div>
			)
		}

		if (equipment.equipped && equipment.bonus && equipment.bonus.includes(title.toLowerCase())) {
			const ringBonus = getRingBonuses(equipment)
			//console.log(ringBonus);
			fixedValue = fixedValue + ringBonus.bonusesDict[title.toLowerCase()]
		}

		let widthIn = 0
		let bgColorIn = 'white'
		let max = undefined
		if (maxStats) {
			max = maxStats[title.toLowerCase()]
			widthIn = fixedValue * 100 / max

			if (title === "HP") {
				bgColorIn = '#58af04'
			}
			else if (title === 'DEFENSE') {
				bgColorIn = '#14c3e8'
			}
			else if (title === 'ATTACK') {
				bgColorIn = '#a10ed8'
			}
			else if (title === 'DAMAGE') {
				bgColorIn = '#f80303'
			}
			else if (title === 'SPEED') {
				bgColorIn = '#f1e711'
			}
		}

		return (
			<div style={{ alignItems: 'center', marginBottom: 10 }}>
				<p style={styles.textTitleStat}>{title}</p>

				{
					maxStats && maxStats[title.toLowerCase()] &&
					<div style={{ position: 'relative', height: 8, width: 100, backgroundColor: '#ffffff10', borderRadius: 4, overflow: 'hidden', marginRight: 9 }}>
						<div style={{ width: `${widthIn}%`, backgroundColor: bgColorIn }} />
					</div>
				}

				<p style={styles.textValueStat}>{fixedValue}{max ? `/${max}` : ''}</p>
			</div>
		)
	}

	refactorSpellSelected(spellSelected) {

		if (!spellSelected) {
			return { atkBase: 0, dmgBase: 0, name: "", condition: {}}
		}

        const refactorSpellSelected = allSpells.find(i => i.name === spellSelected.name)
        //console.log(refactorSpellSelected);
        return refactorSpellSelected
    }

	renderBoxStats(width) {
		const { nft, historyUpgrades, level, equipment } = this.state

		let rev = false
		if (parseInt(nft.id) < REVEAL_CAP) {
			rev = true
		}

		const spellSelected = this.refactorSpellSelected(nft.spellSelected)

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Stats
					</p>
				</div>

				<div style={Object.assign({}, styles.boxTraits, { width })}>
					{
						!rev ?
						<p style={{ fontSize: 18, color: 'white', margin: 15 }}>
							The stats will be visible after the reveal
						</p>
						: null
					}

					{
						nft && nft.hp && rev ?
						<div style={Object.assign({}, styles.boxTraits, { width })}>

							<div style={{ width: '100%', alignItems: 'center', marginBottom: 8 }}>
								<p style={{ fontSize: 19, color: 'white', marginRight: 10 }}>
									LEVEL
								</p>
								<p style={{ fontSize: 26, color: getColorTextBasedOnLevel(level) }}>
									{level}
								</p>
							</div>

							{this.renderStat("HP", nft.hp.int)}
							{this.renderStat("DEFENSE", nft.defense.int)}

							{this.renderStat("ATTACK", nft.attack.int + spellSelected.atkBase)}
							{this.renderStat("DAMAGE", nft.damage.int + spellSelected.dmgBase)}
							{this.renderStat("SPEED", nft.speed ? nft.speed.int : 0)}

							{this.renderStat("AP", nft.ap.int)}

							{this.renderStat("DOWNGRADES POINTS", nft.downgrades.int)}

							{this.renderStat("ELEMENT", nft.element.toUpperCase())}

							{this.renderStat("SPELL", spellSelected.name.toUpperCase())}

							{this.renderStat("SPELL PERK", spellSelected.condition.name ? spellSelected.condition.name.toUpperCase() : '-')}

							{this.renderStat("RESISTANCE", nft.resistance.toUpperCase())}
							{this.renderStat("WEAKNESS", nft.weakness.toUpperCase())}



						</div>
						: null
					}

					{
						historyUpgrades.length > 0 ?
						<div style={{ paddingLeft: 10, paddingBottom: 10, flexDirection: 'column' }}>
							<p style={{ fontSize: 19, color: 'white', marginBottom: 5 }}>
								Upgrades
							</p>

							<div style={{ flexWrap: 'wrap', alignItems: 'center' }}>
								{historyUpgrades.map((item, index) => {
									return this.renderUpgrade(item, index)
								})}
							</div>
						</div>
						: null
					}

					{
						equipment && equipment.equipped &&
						this.renderBoxEquipment(width)
					}

				</div>
			</div>
		)
	}

	renderBoxMedals(width) {
		const { nft } = this.state

		//console.log(nft.medals)

		let sortedKeyMedals = []
		if (nft.medals) {
			sortedKeyMedals = Object.keys(nft.medals).sort((a, b) => {
				return parseInt(a.replace("t","")) - parseInt(b.replace("t", ""))
			})
		}

		//console.log(sortedKeyMedals);

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Medals
					</p>
				</div>

				<div style={Object.assign({}, styles.boxTraits, { width })}>
					{
						!nft || !nft.medals || Object.keys(nft.medals).length === 0 ?
						<p style={{ fontSize: 18, color: 'white', margin: 15 }}>
							This wizard has not yet won a medal
						</p>
						:
						nft && nft.medals && sortedKeyMedals.map((key) => {
							return this.renderMedal(key)
						})
					}

				</div>

			</div>
		)
	}

	renderBoxFights(width) {
		const { nft } = this.state

		//console.log(nft.groupedFights);

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Fights
					</p>
				</div>

				<div style={styles.boxTraits}>
					{
						!nft || !nft.fights || (nft && nft.fights.length === 0) ?
						<p style={{ fontSize: 18, color: 'white', margin: 15 }}>
							This wizard hasn't participated in any fight yet
						</p>
						:
						nft && nft.groupedFights && Object.keys(nft.groupedFights).map((key, index) => {
							//console.log(key, index);
							return this.renderMainFight(key, index)
						})
					}

				</div>

			</div>
		)
	}

	renderBoxSpellbook(width) {
		const { nft } = this.state

		let rev = false
		if (parseInt(nft.id) < REVEAL_CAP) {
			rev = true
		}

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Spellbook
					</p>
				</div>

				<div style={Object.assign({}, styles.boxTraits, { width, flexDirection: 'column' })}>
					{
						!nft || !nft.spellbook || (nft && nft.spellbook.length === 0) || !rev ?
						<p style={{ fontSize: 18, color: 'white', margin: 15 }}>
							The Spellbook is empty...
						</p>
						:
						nft && nft.spellbook && nft.spellbook.map((item, index) => {
							return this.renderSpell(item, index)
						})
					}

				</div>

			</div>
		)
	}

	renderBoxProperties(width) {
		const { nft } = this.state

		let rev = false
		if (parseInt(nft.id) < REVEAL_CAP) {
			rev = true
		}

		let traits = []
		if (nft && nft.traits) {
			traits = nft.traits.sort((a, b) => {
				return a.trait_type.localeCompare(b.trait_type)
			})
		}

		//console.log(traits);

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Properties
					</p>
				</div>

				<div style={Object.assign({}, styles.boxTraits, { width: width - 20 })}>
					{
						!rev ?
						<p style={{ fontSize: 18, color: 'white', margin: 15 }}>
							The properties will be visible after the reveal
						</p>
						:
						nft && nft.traits && traits.map((item, index) => {
							return this.renderTraits(item, index)
						})
					}

				</div>

			</div>
		)
	}

	renderBoxOffers(width, isMobile) {
		const { offers, loadingOffers } = this.state

		//console.log(offers);

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Item offers
					</p>
				</div>

				<div style={Object.assign({}, styles.boxHistory, { width })}>

					{offers.map((item, index) => {
						return this.renderOffersItem(item, index, isMobile)
					})}

					{
						offers && offers.length === 0 ?
						<p style={{ fontSize: 18, color: 'white', marginLeft: 15, marginBottom: 15, marginTop: 15 }}>
							{loadingOffers ? "Loading..." : "No offers"}
						</p>
						: null
					}

				</div>

			</div>
		)
	}

	renderBoxSales(width, isMobile) {
		const { nftH, loadingHistory } = this.state

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: '#ffffff15', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 22, color: 'white' }}>
						Item sales
					</p>
				</div>

				<div style={Object.assign({}, styles.boxHistory, { width })}>

					{nftH.map((item, index) => {
						return this.renderHistoryItem(item, index, isMobile)
					})}

					{
						nftH && nftH.length === 0 ?
						<p style={{ fontSize: 18, color: 'white', marginLeft: 15, marginBottom: 15, marginTop: 15 }}>
							{loadingHistory ? "Loading..." : "No sales"}
						</p>
						: null
					}

				</div>

			</div>
		)
	}


	renderBoxEquipment(width) {
		const { equipment } = this.state

		const infoEquipment = getRingBonuses(equipment)
		//console.log(infoEquipment);

		//console.log(equipment);

		return (
			<div style={{ width: width - 20 }}>
				<div style={styles.subBoxEquipment}>
					<p style={{ fontSize: 20, color: 'white' }}>
						EQUIPMENT
					</p>

					<div style={{ alignItems: 'center' }}>
						<img
							src={equipment.url}
							style={{ width: 100 }}
						/>

						<div style={{ flexDirection: 'column' }}>
							<p style={{ fontSize: 19, color: 'white', marginBottom: 5 }}>
								#{equipment.id} {equipment.name}
							</p>

							<p style={{ fontSize: 18, color: 'white' }}>
								{infoEquipment.bonusesText.join(", ")}
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}


	renderBodySmall() {
		const { nft, loading, infoBurn } = this.state
		const { account } = this.props

		let boxW = Math.floor(window.innerWidth * 90 / 100)
		let imageWidth = boxW > 500 ? 500 : boxW - 30

		let boxTopStyle = { width: boxW, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 25, marginBottom: 25 }

		let showOverlayBurn = infoBurn && infoBurn.burned

		let ctaWidth = boxW * 50 / 100
		if (ctaWidth > 170) ctaWidth = 170

		return (
			<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

				<div style={boxTopStyle}>

					<div style={{ position: 'relative' }}>
						<img
							style={{ width: imageWidth, height: imageWidth, borderRadius: 2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
							src={getImageUrl(nft.id)}
							alt={nft.id}
						/>

						{
							showOverlayBurn ?
							<img
								style={{ width: imageWidth, height: imageWidth, borderRadius: 2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', position: 'absolute', top: 0, left: 0 }}
								src={burn_overlay}
								alt={nft.id}
							/>
							: null
						}
					</div>

					<div style={{ flexDirection: 'column', width: imageWidth, height: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>

						<div style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
							{this.renderBoxShare()}
						</div>

						{
								//nft listato, in renderbtn buy gestiamo tutti i casi, anche account non connesso
							nft.listed &&
							<div style={styles.boxRightMobile}>

								{this.renderLeftBoxPriceListed(nft.owner === account.account)}

								<div style={{ height: 15 }} />

								{this.renderBtnBuy(ctaWidth, 15, true)}

							</div>
						}

						{
							// nft non listato ma tu sei owner: SELL
							!nft.listed && account && account.account && nft.owner === account.account ?
							<div style={styles.boxRightMobile}>
								{this.renderLeftBoxListing()}

								<div style={{ height: 15 }} />

								{this.renderBtnSell(ctaWidth, 15, true)}

							</div>
							: null
						}

						{
							//non sei il proprietario e l'nft non è listato
							!nft.listed && !loading && account && account.account && nft.owner !== account.account ?
							<div style={styles.boxRightMobile}>

								{this.renderLeftMakeOffer()}

								<div style={{ height: 15 }} />

								{
									!showOverlayBurn ?
									this.renderBtnMakeOffer(ctaWidth, 15, true)
									: null
								}
							</div>
							: null
						}

						{
							//nft non listato ma account non connesso CONNECT WALLET
							 !nft.listed && !loading && (!account || (account && !account.account)) ?
							<div style={styles.boxRightMobile}>

								{this.renderLeftMakeOffer()}

								<div style={{ height: 15 }} />

								{this.renderBtnConnect(ctaWidth, 15, true)}
							</div>
							: null
						}

					</div>

				</div>

				{this.renderBoxStats(imageWidth)}

				{this.renderBoxSpellbook(imageWidth)}

				{this.renderBoxMedals(imageWidth)}

				{this.renderBoxFights(imageWidth)}

				{this.renderBoxProperties(imageWidth)}

				{this.renderBoxOffers(imageWidth, true)}

				{this.renderBoxSales(imageWidth, true)}
			</div>
		)
	}

	renderBodyLarge() {
		const { nft, loading, infoBurn } = this.state
		const { account } = this.props

		//console.log(nft);

		let boxW = Math.floor(window.innerWidth * 90 / 100)
		if (boxW > 1100) boxW = 1100;

		const boxWidthRight = boxW - 400
		let ctaWidth = boxWidthRight * 40 / 100
		if (ctaWidth > 250) ctaWidth = 250

		let boxTopStyle = { width: boxW, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 25 }

		let showOverlayBurn = infoBurn && infoBurn.burned

		return (
			<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

				<div style={boxTopStyle}>

					<div style={{ position: 'relative', marginRight: 30 }}>
						<img
							style={{ width: 370, height: 370, borderRadius: 2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
							src={getImageUrl(nft.id)}
							alt={nft.id}
						/>

						{
							showOverlayBurn ?
							<img
								style={{ width: 370, height: 370, borderRadius: 2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', position: 'absolute', top: 0, left: 0 }}
								src={burn_overlay}
								alt={nft.id}
							/>
							: null
						}
					</div>

					<div style={{ flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>

						<div style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>

							{this.renderBoxShare()}
						</div>


						{
							//nft listato, in renderbtn buy gestiamo tutti i casi, anche account non connesso
							nft.listed &&
							<div style={Object.assign({}, styles.boxRightLarge, { width: boxWidthRight })}>

								{this.renderLeftBoxPriceListed(nft.owner === account.account)}

								{this.renderBtnBuy(ctaWidth, 15)}

							</div>
						}

						{
							// nft non listato ma tu sei owner: SELL
							!nft.listed && account && account.account && nft.owner === account.account ?
							<div style={Object.assign({}, styles.boxRightLarge, { width: boxWidthRight })}>
								{this.renderLeftBoxListing()}

								{this.renderBtnSell(ctaWidth, 15)}

							</div>
							: null
						}


						{
							//non sei il proprietario e l'nft non è listato
							!nft.listed && !loading && account && account.account && nft.owner !== account.account ?
							<div style={Object.assign({}, styles.boxRightLarge, { width: boxWidthRight })}>

								{this.renderLeftMakeOffer()}

								{
									!showOverlayBurn ?
									this.renderBtnMakeOffer(ctaWidth, 15)
									: null
								}
							</div>
							: null
						}

						{
							//nft non listato ma account non connesso CONNECT WALLET
							 !nft.listed && !loading && (!account || (account && !account.account)) ?
							<div style={Object.assign({}, styles.boxRightLarge, { width: boxWidthRight })}>

								{this.renderLeftMakeOffer()}

								{this.renderBtnConnect(ctaWidth, 15)}
							</div>
							: null
						}

					</div>

				</div>

				<div style={{ width: boxW, justifyContent: 'space-between' }}>
					{this.renderBoxStats((boxW/2) - 10)}

					{this.renderBoxMedals((boxW/2) - 10)}
				</div>

				<div style={{ width: boxW, justifyContent: 'space-between' }}>
					{this.renderBoxSpellbook(boxW/2 - 10)}

					{this.renderBoxFights(boxW/2 - 10)}
				</div>

				{this.renderBoxProperties(boxW)}

				{this.renderBoxOffers(boxW, false)}

				{this.renderBoxSales(boxW, false)}

			</div>
		)
	}

	renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='nft'
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

	renderError() {
		return (
			<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
				<img
					src={getImageUrl(undefined)}
					style={{ width: 340, height: 340, borderRadius: 2, marginBottom: 30 }}
					alt='Placeholder'
				/>

				<p style={{ fontSize: 23, color: 'white', textAlign: 'center' }}>
					The Arena is empty...
				</p>
			</div>
		)
	}

	render() {
		const { showModalTx } = this.props
		const { inputPrice, nft, typeModal, showModalConnection, loading, error, showModalTransfer, showModalOffer } = this.state

		let modalW = window.innerWidth * 82 / 100
		if (modalW > 480) {
			modalW = 480
		}
		else if (modalW < 310) {
			modalW = 310
		}

		return (
			<div style={styles.container}>

				<Toaster
					position="top-center"
  					reverseOrder={false}
				/>

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

				{
					!error &&
					<Media
						query="(max-width: 767px)"
						render={() => this.renderBodySmall()}
					/>
				}

				{
					!error &&
					<Media
						query="(min-width: 768px)"
						render={() => this.renderBodyLarge()}
					/>
				}

				{
					error &&
					this.renderError()
				}

				<ModalTransaction
					showModal={showModalTx}
					width={modalW}
					type={typeModal}
					inputPrice={inputPrice}
					idNft={nft.id}
					nameNft={nft.name}
					mintSuccess={() => {
						this.props.clearTransaction()
						this.getPathNft()
					}}
					mintFail={() => {
						this.props.clearTransaction()
						this.getPathNft()
					}}
					offerInfoRecap={this.state.offerInfoRecap}
					makeOfferValues={this.state.makeOfferValues}
					saleValues={this.state.saleValues}
				/>

				<ModalConnectionWidget
					width={modalW}
					showModal={showModalConnection}
					onCloseModal={() => this.setState({ showModalConnection: false })}
				/>

				<ModalTransfer
					width={modalW}
					showModal={showModalTransfer}
					onCloseModal={() => this.setState({ showModalTransfer: false })}
					callback={(receiver) => {
						this.setState({ showModalTransfer: false }, () => {
							this.transfer(receiver)
						})
					}}
				/>

				<ModalMakeOffer
					width={modalW}
					showModal={showModalOffer}
					onCloseModal={() => this.setState({ showModalOffer: false })}
					submitOffer={(amount, duration) => this.submitOffer(amount, duration)}
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
	boxShare: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: CTA_COLOR,
		borderStyle: 'solid',
		borderRadius: 2
	},
	btnReload: {
		width: 45,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 2
	},
	btnShare: {
		width: 45,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 2
	},
	subBoxEquipment: {
		width: 'fit-content',
		flexDirection: 'column',
		borderRadius: 2,
		paddingTop: 10,
		paddingLeft: 10,
		paddingRight: 10,
		backgroundColor: '#ffffff15',
		marginBottom: 10
	},
	boxRightLarge: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 2,
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: '#ffffff15'
	},
	boxRightMobile: {
		width: '100%',
		flexDirection: 'column',
		justifyContent: 'space-between',
		borderRadius: 2,
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: '#ffffff15'
	},
	boxPrice: {
		borderRadius: 2,
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: '#ffffff15'
	},
	btnBuy: {
		height: 50,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
	},
	btnBuyText: {
		fontSize: 21,
		color: 'white',
	},
	boxSection: {
		flexDirection: 'column',
		borderRadius: 2,
		borderWidth: 1,
		borderColor: '#ffffff15',
		borderStyle: 'solid',
		marginBottom: 15
	},
	boxTraits: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: 10,
	},
	boxSingleTrait: {
		flexDirection: 'column',
		borderRadius: 2,
		margin: 7,
		padding: 7,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff15',
	},
	boxHistory: {
		flexDirection: 'column',
		width: '90%',
		paddingTop: 5,
		paddingBottom: 5,
	},
	inputPrice: {
		width: 130,
		height: 40,
		color: 'black',
		borderRadius: 2,
		borderColor: '#b9b7b7',
		borderStyle: 'solid',
		borderWidth: 2,
		fontSize: 19,
		paddingLeft: 10,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none'
	},
	textTitleStat: {
		color: '#8d8b8b',
		fontSize: 16,
		marginRight: 9,
	},
	textValueStat: {
		color: 'white',
		fontSize: 18,
		marginRight: 24
	},
	btnTransfer: {
		height: 35,
		maxWidth: 154,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: CTA_COLOR,
		borderRadius: 2,
		borderStyle: 'solid',
		marginTop: 5,
		paddingLeft: 11,
		paddingRight: 11
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, nftSelected, userMintedNfts, subscribed, subscribedWiza } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, nftSelected, userMintedNfts, subscribed, subscribedWiza };
}

export default connect(mapStateToProps, {
	setNetworkSettings,
	setNetworkUrl,
	loadSingleNft,
	delistNft,
	listNft,
	buyNft,
	clearTransaction,
	transferNft,
	getInfoNftBurning,
	getOffersForNft,
	makeOffer,
	acceptOffer,
	getInfoItemEquipped
})(Nft);
