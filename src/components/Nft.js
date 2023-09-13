import React, { Component } from 'react';
import { connect } from 'react-redux'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { IoEyeOffOutline, IoEyeOutline, IoFlash, IoMedalOutline, IoClose } from 'react-icons/io5';
import { BsFillTagFill } from 'react-icons/bs'
import moment from 'moment'
import toast, { Toaster } from 'react-hot-toast';
import { getDocs, collection, doc, getDoc, query, where } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Header from './Header';
import ModalConnectionWidget from './common/ModalConnectionWidget'
import ModalTransfer from './common/ModalTransfer'
import ModalMakeOffer from './common/ModalMakeOffer'
import ModalSpellbook from './common/ModalSpellbook'
import HistoryItemNft from './common/HistoryItemNft'
import OfferItem from './common/OfferItem'
import getImageUrl from './common/GetImageUrl'
import getRingBonuses from './common/GetRingBonuses'
import getPendantBonus from './common/GetPendantBonus'
import traits_qty from './common/Traits_qty'
import traits_qty_clerics from './common/Traits_qty_clerics'
import traits_qty_druids from './common/Traits_qty_druids'
import conditions from './common/Conditions'
import allSpells from './common/Spells'
import titles from './common/LeagueTitle'
import getBoxWidth from './common/GetBoxW'
import { getColorTextBasedOnLevel, calcLevelWizard, calcLevelWizardAfterUpgrade } from './common/CalcLevelWizard'
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
	getInfoItemEquipped,
	updateInfoTransactionModal,
	setWizardSfidato,
	getFightPerNfts,
	changeSpellTournament
} from '../actions'
import { MAIN_NET_ID, REVEAL_CAP, TEXT_SECONDARY_COLOR, CTA_COLOR } from '../actions/types'
import '../css/Nft.css'

const logoKda = require('../assets/kdalogo2.png')
const burn_overlay = require('../assets/burn_overlay.png')
const challenge_icon = require('../assets/wand_challenge.png')


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
			loadingFights: [],
			traitsRank: undefined,
			loadingHistory: true,
			numbersOfMaxMedalsPerTournament: [],
			historyUpgrades: [],
			openFightsSection: [],
			infoBurn: {},
			offers: [],
			loadingOffers: true,
			showModalOffer: false,
			offerInfoRecap: "",
			saleValues: {},
			ring: {},
			pendant: {},
			maxStats: undefined,
			showMedals: false,
			showFights: false,
			winRate: 0,
			showModalSpellbook: false
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

	groupFights(array, tname) {

		let temp = []

		for (var i = 0; i < array.length; i++) {
			const t = array[i]

			const tournamentFight = t.tournament.split("_")[0]

			if (tournamentFight === tname) {
				temp.push(t)
			}
		}

		return temp
	}

	loadNft(idNft) {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		this.props.loadSingleNft(chainId, gasPrice, gasLimit, networkUrl, idNft, (response) => {
			//console.log(response);
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

		//console.log(response);

		this.setState({ nft: response, loading: false }, () => {
			this.loadFights(response)
			this.loadHistory(response.id)
			this.getHistoryUpgrades()

			this.loadOffers(response.id)

			this.loadEquipment(response.id)

			if (response.confirmBurn) {
				this.loadInfoBurn(response.id)
			}
		})
	}

	loadFights(response) {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		const ids = [response.id]

		this.props.getFightPerNfts(chainId, gasPrice, gasLimit, networkUrl, ids, (fights) => {
			//console.log(fights);

			response['tournaments'] = fights && fights.length > 0 ? fights : []

			let tournaments = []

			if (response.tournaments) {

				//console.log(response.medals);

				for (var i = 0; i < response.tournaments.length; i++) {
					const f = response.tournaments[i]

					const torneoName = f.tournament.split("_")[0]

					if (!tournaments.includes(torneoName)) {
						tournaments.push(torneoName)
					}
				}

				tournaments.sort((a, b) => {
					return parseInt(a.replace("t", "")) - parseInt(b.replace("t", ""))
				})

				response['groupedFights'] = {}
			}

			let openFightsSection = []

			if (response.tournaments) {
				tournaments.map(i => {
					const groupedFight = this.groupFights(response.tournaments, i)
					//console.log(groupedFight);
					if (groupedFight.length > 0) {
						openFightsSection = [i]
					}

					response['groupedFights'][i] = groupedFight
				})
			}

			this.setState({ nft: response, openFightsSection, loadingFights: false }, () => {
				this.loadMaxMedalsPerTournament()
			})
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


	async loadEquipment(idNft) {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		const ring = await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, idNft)
		//console.log(ring);

		const pendant = await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, `${idNft}pendant`)
		//console.log(pendant);

		this.setState({ ring, pendant })
	}


	async getHistoryUpgrades() {
		const { nft } = this.state

		//console.log(nft);

		const docRef = doc(firebasedb, "base_stats", `${nft.id}`)

		const docSnap = await getDoc(docRef)
		let data = docSnap.data()

		if (!data.speed) {
			data['speed'] = 0
		}

		//console.log(data);

		if (!nft.hp) {
			return
		}

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
			let difference = nft.speed.int - data.speed
			if (difference > 0) {
				historyUpgrades.push({ stat: "speed", value: difference })
			}
		}

		if (nft['upgrades-spell'].attack.int > 0) {
			historyUpgrades.push({ stat: `${nft.spellSelected.name} attack`, value: nft['upgrades-spell'].attack.int })
		}

		if (nft['upgrades-spell'].damage.int > 0) {
			historyUpgrades.push({ stat: `${nft.spellSelected.name} damage`, value: nft['upgrades-spell'].damage.int })
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

		//console.log(nftH);

		this.setState({ nftH, loadingHistory: false })
	}

	async loadMaxMedalsPerTournament() {
		const { nft } = this.state

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

		let dictWin = { win: 0, maxMedals: 0 }

		for (var i = 0; i < nft.tournaments.length; i++) {
			let t = nft.tournaments[i]

			if (t.winner === nft.id) {
				dictWin['win'] += 1
			}

			dictWin['maxMedals'] += 1
		}

		const winRate = Math.round(dictWin['win'] / dictWin['maxMedals'] * 100)

		this.setState({ numbersOfMaxMedalsPerTournament, winRate })
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

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will list ${nft.name} for ${inputPrice} KDA. Marketplace Fee: 7%`,
			typeModal: 'list',
			transactionOkText: 'Listing successfully',
			idNft: nft.id,
			inputPrice
		})

		this.props.listNft(chainId, gasPrice, 1700, netId, nft.id, parseFloat(inputPrice).toFixed(2), account)

	}

	delist() {
		const { nft } = this.state;
		const { account, chainId, gasPrice, netId } = this.props

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will delist #${nft.id}`,
			typeModal: 'delist',
			transactionOkText: 'Delisting successfully',
			nameNft: `#${nft.id}`,
		})

		this.props.delistNft(chainId, gasPrice, 2000, netId, account, nft.id)
	}

	buy() {
		const { nft } = this.state
		const { account, chainId, gasPrice, netId } = this.props

		let saleValues = { id: nft.id, amount: nft.price }

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will buy #${nft.id} (you will need KDA on chain 1)`,
			typeModal: 'buy',
			transactionOkText: `You bought #${nft.id}`,
			saleValues
		})

		this.props.buyNft(chainId, gasPrice, 7000, netId, account, nft)
	}

	transfer(receiver) {
		const { nft } = this.state
		const { account, chainId, gasPrice, netId } = this.props

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will transfer #${nft.id} to another wallet`,
			typeModal: 'transfer',
			transactionOkText: `Transfer completed successfully`,
		})

		this.props.transferNft(chainId, gasPrice, 1500, netId, nft.id, account, receiver)
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

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will submit the offer. Remember that the amount of the offer will be locked in the contract for the duration of the offer.`,
			typeModal: 'makeoffer',
			transactionOkText: `Offer sent!`,
			makeOfferValues
		})

		this.setState({ showModalOffer: false }, () => {
			this.props.makeOffer(chainId, gasPrice, 4000, netId, nft.id, account, duration, amount)
		})
	}

	acceptOffer(offer) {
		const { nft } = this.state
		const { account, chainId, gasPrice, netId } = this.props

		//console.log(amount, duration);
		let offerInfoRecap = `You are accepting an offer of ${offer.amount} KDA (minus 7% marketplace fee) for #${nft.id}`

		let saleValues = { id: nft.id, amount: offer.amount }

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: offerInfoRecap,
			typeModal: 'acceptoffer',
			transactionOkText: `Offer accepted!`,
			saleValues
		})

		this.props.acceptOffer(chainId, gasPrice, 5000, netId, offer.id, nft.id, account)
	}

	changeSpell(spellSelected) {
        const { chainId, gasPrice, netId, account } = this.props
        const { nft } = this.state

        //console.log(wizardToChangeSpell);

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will change the spell of #${nft.id}`,
			typeModal: 'changespell_pvp',
			transactionOkText: `Spell changed!`,
		})

		this.props.changeSpellTournament(chainId, gasPrice, 3000, netId, account, nft.id, spellSelected)
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
			else if (parseInt(nft.id) >= 2048) {
				const section = traits_qty_druids[item.trait_type.toLowerCase()]
				const qty = section[item.value]

				percentString = qty * 100 / 1024
			}
		}
		else {
			return <div />
		}

		return (
			<div style={styles.boxSingleTrait} key={index}>
				<p style={{ color: '#707070', fontSize: 15 }}>
					{item.trait_type}
				</p>

				<p style={{ color: "#1d1d1f", fontSize: 16 }}>
					{item.value}
				</p>

				{
					percentString ?
					<p style={{ color: '#707070', fontSize: 13 }}>
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
				<p style={{ color: '#707070', fontSize: 13, marginBottom: 5 }}>
					Tournament {item.replace("t", "")}
				</p>
				<p style={{ color: "#1d1d1f", fontSize: 16 }}>
					{numbersOfMedals} / {maxMedals.maxMedals}
				</p>

			</div>
		)
	}

	renderSpell(item, index, numberOfSpells) {
		const { mainTextColor } = this.props
		const { nft } = this.state
		const marginRight = 12

		//console.log(nft);

		let spell = allSpells.find(i => i.name === item.name)

		let condDesc;
		if (spell.condition && spell.condition.name) {
			let condInfo = conditions.find(i => i.name === spell.condition.name)
			if (condInfo) {
				condDesc = `${condInfo.effect} - Chance of success: ${spell.condition.pct}%`
			}
		}

		let spellAtk = spell.atkBase
		let spellDmg = spell.dmgBase

		if (item.name === nft.spellSelected.name) {
			spellAtk += nft['upgrades-spell'].attack.int
			spellDmg += nft['upgrades-spell'].damage.int
		}

		return (
			<div key={index} style={{ alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: numberOfSpells-1 === index ? 10 : 30 }}>
				<p style={{ color: '#707070', fontSize: 15, marginRight: 5, marginBottom: 1 }}>
					Name
				</p>
				<p style={{ color: mainTextColor, fontSize: 17, marginRight }}>
					{spell.name}
				</p>
				<p style={{ color: '#707070', fontSize: 15, marginRight: 5, marginBottom: 1 }}>
					Perk
				</p>

				{
					spell.condition && spell.condition.name ?
					<Popup
						trigger={open => (
							<button style={{ color: mainTextColor, fontSize: 17, marginRight }}>
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
					<p style={{ color: mainTextColor, fontSize: 17, marginRight }}>
						-
					</p>
				}

				<p style={{ color: '#707070', fontSize: 15, marginRight: 5, marginBottom: 1 }}>
					Base Atk
				</p>
				<p style={{ color: mainTextColor, fontSize: 17, marginRight }}>
					{spellAtk}
				</p>

				<p style={{ color: '#707070', fontSize: 15, marginRight: 5, marginBottom: 1 }}>
					Base Dmg
				</p>
				<p style={{ color: mainTextColor, fontSize: 17 }}>
					{spellDmg}
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
						<p style={{ fontSize: 15, color: '#707070', marginRight: 15 }}>
							Tournament <span style={{ fontSize: 16, color: "#1d1d1f" }}>{key.replace("t","")}</span>
						</p>

						{
							openFightsSection.includes(key) ?
							<IoEyeOffOutline
								size={20}
								color="#1d1d1f"
							/>
							:
							<IoEyeOutline
								size={20}
								color="#1d1d1f"
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

		const textWinner = item.winner === nft.id ? "Winner" : "Loser"
		const textWinnerColor = textWinner === "Winner" ? "#1d1d1f" : "#707070"

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/fight/${item.fightId}`}
				className='btnH'
				style={Object.assign({}, styles.boxSingleTrait, { backgroundColor: "#dfdfdf" })}
				key={index}
				onClick={(e) => {
					e.preventDefault()
					this.props.history.push(`/fight/${item.fightId}`)
				}}
			>
				<p style={{ color: '#707070', fontSize: 14, marginBottom: 5 }}>
					Round {round.replace("r", "")}
				</p>
				<p style={{ color: textWinnerColor, fontSize: 15 }}>
					{textWinner}
				</p>
			</a>
		)
	}

	renderHistoryItem(item, index, isMobile) {
		const { nftH } = this.state

		return (
			<HistoryItemNft
				item={item}
				index={index}
				nftH={nftH}
				key={index}
				isMobile={isMobile}
				type={item.type || 'SALE'}
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

			let style = isMobile ? { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
									:
									{ paddingLeft: 12, paddingRight: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }

			return (
				<div style={style}>
					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width })}
						onClick={() => this.setState({ showModalConnection: true })}
					>
						<p style={styles.btnBuyText} className="text-medium">
							Connect wallet
						</p>
					</button>
				</div>
			)
		}

		if (nft.owner === account.account) {

			let style = isMobile ? { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
									:
									{ width: width*2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }

			return (
				<div style={style}>

					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width: width-10, marginBottom: isMobile ? 15 : 0 })}
						onClick={() => this.delist()}
					>
						<p style={styles.btnBuyText} className="text-medium">
							Cancel listing
						</p>
					</button>

					<button
						className='btnH'
						style={Object.assign({}, styles.btnBuy, { width: width-10 })}
						onClick={() => this.list()}
					>
						<p style={styles.btnBuyText} className="text-medium">
							Update price
						</p>
					</button>
				</div>
			)
		}

		let style = isMobile ? { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
								:
								{ width: width*2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }

		return (
			<div style={style}>

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width: width-10, marginBottom: isMobile ? 15 : 0 })}
					onClick={() => this.setState({ showModalOffer: true })}
				>
					<BsFillTagFill
						size={20}
						color='white'
						style={{ marginRight: 7 }}
					/>
					<p style={styles.btnBuyText} className="text-medium">
						Make offer
					</p>
				</button>

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width: width-10 })}
					onClick={() => this.buy()}
				>
					<IoFlash
						size={20}
						color='white'
						style={{ marginRight: 7 }}
					/>

					<p style={styles.btnBuyText} className="text-medium">
						Buy now
					</p>
				</button>

			</div>
		)
	}

	renderBtnChallenge(width) {
		const { nft, ring, pendant } = this.state

		return (
			<button
				className='btnH'
				style={Object.assign({}, styles.btnBuy, { width, marginBottom: 20 })}
				onClick={() => {
					let nftCopy = Object.assign({}, nft)
					nftCopy['ring'] = ring
					nftCopy['pendant'] = pendant
					//console.log(nftCopy);
					this.props.setWizardSfidato(nftCopy)
					this.props.history.push(`/startchallenge`)
				}}
			>
				<img
					src={challenge_icon}
					style={{ width: 26, height: 26, marginRight: 7 }}
					alt="Challenge icon"
				/>
				<p style={styles.btnBuyText} className="text-medium">
					Send challenge
				</p>
			</button>
		)
	}

	renderSlidePanelMedals(boxW, isMobile) {
		const { showMedals, nft } = this.state
		const { mainTextColor, mainBackgroundColor } = this.props

		const panelWidth = isMobile ? '90%' : "50%"

		//console.log(nft.medals)

		let sortedKeyMedals = []
		if (nft.medals) {
			sortedKeyMedals = Object.keys(nft.medals).sort((a, b) => {
				return parseInt(a.replace("t","")) - parseInt(b.replace("t", ""))
			})
		}

		return (
			<div style={styles.panelShadow}>

				<div
					className={showMedals ? "slide-panel-container-on" : "slide-panel-container-off"}
					style={Object.assign({}, styles.panel, { width: showMedals ? panelWidth : 0, zIndex: 997, backgroundColor: mainBackgroundColor })}
				>

					<div style={styles.headerPanel}>

						<p style={{ fontSize: 24, color: mainTextColor, marginLeft: 30 }} className="text-bold">
							Medals
						</p>

						<div style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
							<button
								onClick={() => {
									document.body.style.overflow = "auto"
									document.body.style.height = "auto"
									this.setState({ showMedals: false })
								}}
								style={{ marginRight: 30 }}
							>
								<IoClose
									color={mainTextColor}
									size={34}
								/>
							</button>
						</div>

					</div>

					<div style={{ width: "80%", flexDirection: 'row', marginLeft: 30, flexWrap: 'wrap' }}>
					{
						!nft || !nft.medals || Object.keys(nft.medals).length === 0 ?
						<p style={{ fontSize: 16, color: this.props.mainTextColor, margin: 15 }}>
							This wizard has not yet won a medal
						</p>
						:
						nft && nft.medals && sortedKeyMedals.map((key) => {
							return this.renderMedal(key)
						})
					}
					</div>
				</div>
			</div>
		)
	}

	renderSlidePanelFights(boxW, isMobile) {
		const { showFights, nft, loadingFights } = this.state
		const { mainTextColor, mainBackgroundColor } = this.props

		const panelWidth = isMobile ? '90%' : "50%"


		return (
			<div style={styles.panelShadow}>

				<div
					className={showFights ? "slide-panel-container-on" : "slide-panel-container-off"}
					style={Object.assign({}, styles.panel, { width: showFights ? panelWidth : 0, zIndex: 997, backgroundColor: mainBackgroundColor })}
				>

					<div style={styles.headerPanel}>

						<p style={{ fontSize: 24, color: mainTextColor, marginLeft: 30 }} className="text-bold">
							Fights history
						</p>

						<div style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
							<button
								onClick={() => {
									document.body.style.overflow = "auto"
									document.body.style.height = "auto"
									this.setState({ showFights: false })
								}}
								style={{ marginRight: 30 }}
							>
								<IoClose
									color={mainTextColor}
									size={34}
								/>
							</button>
						</div>

					</div>

					<div style={{ width: "80%", flexDirection: 'row', marginLeft: 30, flexWrap: 'wrap' }}>

					{
						loadingFights &&
						<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
							<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
						</div>
					}


					{
						!nft || !nft.tournaments || (nft && nft.tournaments.length === 0) ?
						<p style={{ fontSize: 16, color: this.props.mainTextColor, margin: 15 }}>
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
			</div>
		)
	}

	renderBtnsMedalsFights(width) {
		const { mainTextColor } = this.props

		const btnW = (width/2) - 10

		return (
			<div style={{ width, alignItems: 'center', justifyContent: 'space-between' }}>
				<button
					className="btnH"
					style={Object.assign({}, styles.btnMedals, { width: btnW })}
					onClick={() => this.setState({ showMedals: true })}
				>
					<IoMedalOutline
						color={mainTextColor}
						size={20}
					/>

					<p style={{ fontSize: 15, color: mainTextColor, marginLeft: 4 }}>
						Medals
					</p>
				</button>

				<button
					className="btnH"
					style={Object.assign({}, styles.btnMedals, { width: btnW })}
					onClick={() => this.setState({ showFights: true })}
				>
					<AiOutlineUnorderedList
						color={mainTextColor}
						size={20}
					/>

					<p style={{ fontSize: 15, color: mainTextColor, marginLeft: 4 }}>
						Fights
					</p>
				</button>
			</div>
		)
	}

	renderBtnMakeOffer(width, marginRight, isMobile) {

		let style = isMobile ? { height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }
								:
								{ height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }

		return (
			<div style={style}>

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width: isMobile ? width : width*2 })}
					onClick={() => this.setState({ showModalOffer: true })}
				>
					<BsFillTagFill
						size={20}
						color='white'
						style={{ marginRight: 7 }}
					/>
					<p style={styles.btnBuyText} className="text-medium">
						Make offer
					</p>
				</button>
			</div>
		)
	}

	renderBtnConnect(width, marginRight, isMobile) {

		let style = isMobile ? { alignItems: 'center', justifyContent: 'center' }
								:
								{ alignItems: 'center', justifyContent: 'center', marginLeft: marginRight }

		return (
			<div style={style}>
				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width })}
					onClick={() => this.setState({ showModalConnection: true })}
				>
					<p style={styles.btnBuyText} className="text-medium">
						Connect wallet
					</p>
				</button>
			</div>
		)
	}

	renderBtnSell(width, marginRight, isMobile) {
		const { nft } = this.state
		const { account } = this.props

		let style = isMobile ? { width, flexDirection: 'column', alignItems: 'center', marginTop: 10, justifyContent: 'center' }
								:
								{ width: width*2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }

		return (
			<div style={style}>
				{
					!nft.listed && account && account.account && nft.owner === account.account ?
					<button
						className="btnH"
						style={Object.assign({}, styles.btnBuy, { width: width-10, marginBottom: isMobile ? 15 : 0 })}
						onClick={() => this.setState({ showModalTransfer: true })}
					>
						<p style={styles.btnBuyText} className="text-medium">
							Transfer
						</p>
					</button>
					: null
				}

				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width: width-10 })}
					onClick={() => this.list()}
				>
					<p style={styles.btnBuyText} className="text-medium">
						Sell
					</p>
				</button>
			</div>
		)
	}

	renderName(marginBottom) {
		const { nft, winRate } = this.state
		const { mainTextColor } = this.props

		let type = "Wizard"
		if (parseInt(nft.id) >= 1023 && parseInt(nft.id) < 2048) {
			type = "Cleric"
		}
		else if (parseInt(nft.id) >= 2048 && parseInt(nft.id) < 3072) {
			type = 'Druid'
		}

		let title = titles[nft.id]

		return (
			<div style={{ flexDirection: 'column', marginBottom, alignItems: 'center' }}>
				{
					nft.nickname ?
					<p style={{ color: mainTextColor, fontSize: 24 }} className="text-bold">
						{nft.name} {nft.nickname}
					</p>
					:
					<p style={{ color: mainTextColor, fontSize: 24 }} className="text-bold">
						{type} {nft.name}
					</p>
				}

				{
					parseInt(winRate) > 0 &&
					<p style={{ color: mainTextColor, fontSize: 15, textAlign: 'center', marginTop: 7 }} className="text-bold">
						Win Rate {winRate}%
					</p>
				}

				{
					title ?
					<div style={{ flexDirection: 'column' }}>
						{title.map((item, index) => {
							return (
								<div style={{ marginTop: 10, alignItems: 'center' }} key={index}>
									<img
										style={{ width: 40, height: 40, marginRight: 6 }}
										src={item.img}
										alt="Cup"
									/>

									<p style={{ fontSize: 18, color: item.textColor }}>
										{item.title}
									</p>
								</div>
							)
						})}
					</div>
					: null
				}
			</div>
		)
	}

	renderLeftBoxPriceListed(isOwner, width) {
		const { nft, kadenaPrice, inputPrice } = this.state
		const { mainTextColor } = this.props

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', width, marginBottom: 25 }}>

				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

					<p style={{ color: mainTextColor, fontSize: 17, marginBottom: 4 }} className="text-medium">
						Current price
					</p>

					<div style={{ alignItems: 'center' }}>
						<img
							style={{ width: 20, marginRight: 5 }}
							src={logoKda}
							alt={nft.id}
						/>

						<p style={{ fontSize: 23, color: mainTextColor, marginRight: 7 }} className="text-bold">
							{nft.price}
						</p>

						<p style={{ color: '#707070', fontSize: 14 }}>
							(${(kadenaPrice * nft.price).toFixed(2)})
						</p>
					</div>

				</div>

				{
					isOwner &&
					<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
						<p style={{ color: mainTextColor, fontSize: 16, marginBottom: 4 }} className="text-medium">
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

	renderLeftBoxListing(width) {
		const { inputPrice, kadenaPrice } = this.state

		return (
			<div style={{ width, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
				<p style={{ color: this.props.mainTextColor, fontSize: 17, marginBottom: 4 }} className="text-medium">
					Set price
				</p>

				<input
					style={styles.inputPrice}
					placeholder='KDA'
					value={inputPrice}
					onChange={(e) => this.setState({ inputPrice: e.target.value })}
				/>

				<p style={{ color: '#707070', fontSize: 14, marginTop: 3 }}>
					${(kadenaPrice * inputPrice).toFixed(2)}
				</p>
			</div>
		)
	}

	renderLeftMakeOffer() {
		const { infoBurn } = this.state

		const isBurned = infoBurn && infoBurn.burned

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
				{
					isBurned &&
					<p style={{ fontSize: 18, color: this.props.mainTextColor, marginTop: 15, marginBottom: 15 }}>
						BURNED
					</p>
				}
			</div>
		)
	}

	renderUpgrade(item, index) {
		return (
			<div style={{ alignItems: 'center', marginBottom: 8, marginRight: 15 }} key={index}>
				<p style={{ fontSize: 16, color: '#707070', marginRight: 5 }}>
					{item.stat}
				</p>

				<p style={{ fontSize: 17, color: this.props.mainTextColor }}>
					+{item.value}
				</p>
			</div>
		)
	}

	renderStat(title, value) {
		const { ring, maxStats } = this.state
		const { mainTextColor } = this.props

		//console.log(ring);

		let fixedValue = value

		if (title === "Spell Perk") {
			let condDesc;
			if (fixedValue && fixedValue !== "-") {

				//console.log(fixedValue);

				let spellInfo = allSpells.find(i => i.condition.name && i.condition.name.toUpperCase() === fixedValue.toUpperCase())
				//console.log(spellInfo);
				if (spellInfo) {
					let condInfo = conditions.find(i => i.name.toUpperCase() === fixedValue.toUpperCase())
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
								<button style={Object.assign({}, styles.textValueStat, { color: mainTextColor })}>{fixedValue}</button>
							)}
							position="top center"
							on="hover"
						>
							<div style={{ padding: 10, fontSize: 15 }}>
								{condDesc}
							</div>
						</Popup>
						:
						<p style={Object.assign({}, styles.textValueStat, { color: mainTextColor })}>{fixedValue}</p>
					}

				</div>
			)
		}

		if (ring.equipped && ring.bonus && ring.bonus.includes(title.toLowerCase())) {
			const ringBonus = getRingBonuses(ring)
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
			else if (title === 'Defense') {
				bgColorIn = '#14c3e8'
			}
			else if (title === 'Attack') {
				bgColorIn = '#a10ed8'
			}
			else if (title === 'Damage') {
				bgColorIn = '#f80303'
			}
			else if (title === 'Speed') {
				bgColorIn = '#f1e711'
			}
		}

		return (
			<div style={{ alignItems: 'center', marginBottom: 10 }}>
				<p style={styles.textTitleStat}>{title}</p>

				{
					maxStats && maxStats[title.toLowerCase()] &&
					<div style={{ position: 'relative', height: 8, width: 100, backgroundColor: '#d8d7d7', borderRadius: 4, overflow: 'hidden', marginRight: 9 }}>
						<div style={{ width: `${widthIn}%`, backgroundColor: bgColorIn }} />
					</div>
				}

				<p style={Object.assign({}, styles.textValueStat, { color: mainTextColor })}>{fixedValue}{max ? `/${max}` : ''}</p>
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
		const { nft, historyUpgrades } = this.state
		const { mainTextColor, isDarkmode } = this.props

		let rev = false
		if (parseInt(nft.id) < REVEAL_CAP) {
			rev = true
		}

		const spellSelected = this.refactorSpellSelected(nft.spellSelected)

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: isDarkmode ? "#f4f4f433" : '#f4f4f4', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 20, color: 'black' }} className="text-medium">
						Stats
					</p>
				</div>

				<div style={Object.assign({}, styles.boxTraits, { width })}>
					{
						!rev ?
						<p style={{ fontSize: 16, color: mainTextColor, margin: 15 }}>
							The stats will be visible after the reveal
						</p>
						: null
					}

					{
						nft && nft.hp && rev ?
						<div style={Object.assign({}, styles.boxTraits, { width })}>

							<div style={{ width: '100%', alignItems: 'center', marginBottom: 8 }}>
								<p style={{ fontSize: 17, color: mainTextColor, marginRight: 10 }}>
									Level
								</p>
								<p style={{ fontSize: 22, color: getColorTextBasedOnLevel(nft.level, isDarkmode) }} className="text-bold">
									{nft.level}
								</p>
							</div>

							{this.renderStat("HP", nft.hp.int)}
							{this.renderStat("Defense", nft.defense.int)}

							{this.renderStat("Attack", nft.attack.int + spellSelected.atkBase + nft['upgrades-spell'].attack.int)}
							{this.renderStat("Damage", nft.damage.int + spellSelected.dmgBase + nft['upgrades-spell'].damage.int)}
							{this.renderStat("Speed", nft.speed ? nft.speed.int : 0)}

							{this.renderStat("AP", nft.ap.int)}

							{this.renderStat("Downgrade Points", nft.downgrades.int)}

							{this.renderStat("Element", nft.element.toUpperCase())}

							{this.renderStat("Spell", spellSelected.name.toUpperCase())}

							{this.renderStat("Spell Perk", spellSelected.condition.name ? spellSelected.condition.name.toUpperCase() : '-')}

							{this.renderStat("Resistance", nft.resistance.toUpperCase())}
							{this.renderStat("Weakness", nft.weakness.toUpperCase())}

						</div>
						: null
					}

					{
						historyUpgrades.length > 0 ?
						<div style={{ paddingLeft: 10, paddingBottom: 10, flexDirection: 'column' }}>
							<p style={{ fontSize: 17, color: mainTextColor, marginBottom: 5 }}>
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

				</div>
			</div>
		)
	}

	renderBoxSpellbook(width) {
		const { nft } = this.state
		const { isDarkmode, account } = this.props

		let rev = false
		if (parseInt(nft.id) < REVEAL_CAP) {
			rev = true
		}

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: isDarkmode ? "#f4f4f433" : '#f4f4f4', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 20, color: 'black' }} className="text-medium">
						Spellbook
					</p>
				</div>

				<div style={Object.assign({}, styles.boxTraits, { width: width-20, flexDirection: 'column' })}>
					{
						!nft || !nft.spellbook || (nft && nft.spellbook.length === 0) || !rev ?
						<p style={{ fontSize: 16, color: this.props.mainTextColor, margin: 15 }}>
							The Spellbook is empty...
						</p>
						:
						nft && nft.spellbook && nft.spellbook.map((item, index) => {
							return this.renderSpell(item, index, nft.spellbook.length)
						})
					}
				</div>

				{
					nft && nft.spellbook && nft.spellbook.length > 1 && nft.owner === account.account &&
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 15, marginTop: 25 }}>
						<button
							className="btnH"
							style={Object.assign({}, styles.btnBuy, { width: 150 })}
							onClick={() => this.setState({ showModalSpellbook: true })}
						>
							<p style={styles.btnBuyText} className="text-medium">
								Change selected spell
							</p>
						</button>
					</div>
				}

			</div>
		)
	}

	renderBoxProperties(width) {
		const { nft } = this.state
		const { isDarkmode } = this.props

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

				<div style={{ backgroundColor: isDarkmode ? "#f4f4f433" : '#f4f4f4', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 20, color: 'black' }} className="text-medium">
						Properties
					</p>
				</div>

				<div style={Object.assign({}, styles.boxTraits, { width: width - 20 })}>
					{
						!rev ?
						<p style={{ fontSize: 16, color: this.props.mainTextColor, margin: 15 }}>
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
		const { isDarkmode } = this.props


		//console.log(offers);

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: isDarkmode ? "#f4f4f433" : '#f4f4f4', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 20, color: 'black' }} className="text-medium">
						Item offers
					</p>
				</div>

				<div style={Object.assign({}, styles.boxHistory, { width })}>

					{offers.map((item, index) => {
						return this.renderOffersItem(item, index, isMobile)
					})}

					{
						offers && offers.length === 0 ?
						<p style={{ fontSize: 16, color: this.props.mainTextColor, marginLeft: 15, marginBottom: 15, marginTop: 15 }}>
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
		const { isDarkmode } = this.props

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: isDarkmode ? "#f4f4f433" : '#f4f4f4', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 20, color: 'black' }} className="text-medium">
						Item sales
					</p>
				</div>

				<div style={Object.assign({}, styles.boxHistory, { width })}>

					{nftH.map((item, index) => {
						return this.renderHistoryItem(item, index, isMobile)
					})}

					{
						nftH && nftH.length === 0 ?
						<p style={{ fontSize: 16, color: this.props.mainTextColor, marginLeft: 15, marginBottom: 15, marginTop: 15 }}>
							{loadingHistory ? "Loading..." : "No sales"}
						</p>
						: null
					}

				</div>

			</div>
		)
	}

	renderBoxEquipment(width) {
		const { ring, pendant } = this.state
		const { isDarkmode } = this.props

		let infoRing;
		if (ring && ring.bonus) {
			infoRing = getRingBonuses(ring)
		}

		let infoPendant;
		if (pendant && pendant.equipped) {
			infoPendant = getPendantBonus(pendant)
		}

		return (
			<div style={Object.assign({}, styles.boxSection, { width })}>

				<div style={{ backgroundColor: isDarkmode ? "#f4f4f433" : '#f4f4f4', width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
					<p style={{ marginLeft: 10, marginBottom: 10, marginTop: 10, fontSize: 20, color: 'black' }} className="text-medium">
						Equipment
					</p>
				</div>

				<div style={Object.assign({}, styles.boxHistory, { width })}>

					{
						infoRing ?
						<div style={{ alignItems: 'center', backgroundColor: isDarkmode ? "#f4f4f473" : "#f4f4f4", margin: 15, borderRadius: 4 }}>
							<img
								src={ring.url}
								style={{ width: 90 }}
								alt="Ring"
							/>

							<div style={{ flexDirection: 'column' }}>
								<p style={{ fontSize: 16, color: "#1d1d1f", marginBottom: 5 }}>
									#{ring.id} {ring.name}
								</p>

								<p style={{ fontSize: 15, color: "#1d1d1f" }}>
									{infoRing.bonusesText.join(", ")}
								</p>
							</div>
						</div>
						: null
					}

					{
						infoPendant ?
						<div style={{ alignItems: 'center', backgroundColor: isDarkmode ? "#f4f4f473" : "#f4f4f4", margin: 15, borderRadius: 4 }}>
							<img
								src={pendant.url}
								style={{ width: 90 }}
								alt="Pendant"
							/>

							<div style={{ flexDirection: 'column' }}>
								<p style={{ fontSize: 16, color: "#1d1d1f", marginBottom: 5 }}>
									#{pendant.id} {pendant.name}
								</p>

								<p style={{ fontSize: 15, color: "#1d1d1f" }}>
									{infoPendant.bonusesText.join(", ")}
								</p>
							</div>
						</div>
						: null
					}

				</div>

			</div>
		)
	}


	renderBodySmall() {
		const { nft, loading, infoBurn, ring, pendant } = this.state
		const { account } = this.props

		const { boxW, padding } = getBoxWidth(true)

		let imageWidth = boxW > 500 ? 500 : boxW - 30

		let showOverlayBurn = infoBurn && infoBurn.burned

		const viewTopsW = imageWidth * 75 / 100

		let ctaWidth = (viewTopsW/2) - 5
		//if (ctaWidth > 150) ctaWidth = 150

		return (
			<div style={{ flexDirection: 'column', width: boxW, padding, overflowY: 'auto', overflowX: 'hidden', alignItems: 'center' }}>

				{
					loading &&
					<div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
				}

				<div style={{ width: imageWidth, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 25 }}>

					<div style={{ position: 'relative' }}>
						<img
							style={{ width: imageWidth, height: imageWidth, borderRadius: 4, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid' }}
							src={getImageUrl(nft.id)}
							alt={nft.id}
						/>

						{
							showOverlayBurn ?
							<img
								style={{ width: imageWidth, height: imageWidth, borderRadius: 4, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', position: 'absolute', top: 0, left: 0 }}
								src={burn_overlay}
								alt={nft.id}
							/>
							: null
						}
					</div>

					<div style={{ flexDirection: 'column', width: imageWidth, height: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>

						{this.renderName(20)}

						<div style={{ width: imageWidth, flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
							{
								account && account.account !== nft.owner ?
								this.renderBtnChallenge(viewTopsW)
								: null
							}

							{this.renderBtnsMedalsFights(viewTopsW)}
						</div>

						{
							//nft listato, in renderbtn buy gestiamo tutti i casi, anche account non connesso
							nft.listed &&
							<div style={Object.assign({}, styles.boxRightMobile,  { width: imageWidth })}>

								{this.renderLeftBoxPriceListed(nft.owner === account.account, imageWidth)}

								{this.renderBtnBuy(viewTopsW, 0, true)}

							</div>
						}

						{
							// nft non listato ma tu sei owner: SELL
							!nft.listed && account && account.account && nft.owner === account.account ?
							<div style={Object.assign({}, styles.boxRightMobile,  { width: imageWidth })}>
								{this.renderLeftBoxListing(imageWidth)}

								<div style={{ height: 10 }} />

								{this.renderBtnSell(viewTopsW, 0, true)}

							</div>
							: null
						}

						{
							//non sei il proprietario e l'nft non è listato
							!nft.listed && !loading && account && account.account && nft.owner !== account.account ?
							<div style={Object.assign({}, styles.boxRightMobile,  { width: imageWidth })}>

								{this.renderLeftMakeOffer()}

								<div style={{ height: 5 }} />

								{
									!showOverlayBurn ?
									this.renderBtnMakeOffer(viewTopsW, 0, true)
									: null
								}
							</div>
							: null
						}

						{
							//nft non listato ma account non connesso CONNECT WALLET
							 !nft.listed && !loading && (!account || (account && !account.account)) ?
							<div style={Object.assign({}, styles.boxRightMobile,  { width: imageWidth })}>

								{this.renderLeftMakeOffer()}

								<div style={{ height: 5 }} />

								{this.renderBtnConnect(viewTopsW, 0, true)}
							</div>
							: null
						}

					</div>

				</div>

				{this.renderBoxStats(imageWidth)}

				{
					(ring && ring.equipped) || (pendant && pendant.equipped) ?
					this.renderBoxEquipment(imageWidth)
					: null
				}

				{this.renderBoxSpellbook(imageWidth)}

				{this.renderBoxProperties(imageWidth)}

				{this.renderBoxOffers(imageWidth, true)}

				{this.renderBoxSales(imageWidth, true)}

				<div
					className={this.state.showMedals || this.state.showFights ? "bg-slide-on" : "bg-slide-off"}
					onClick={() => {
						document.body.style.overflow = "auto"
						document.body.style.height = "auto"
						this.setState({ showMedals: false, showFights: false })
					}}
					style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: this.state.showMedals || this.state.showFights ? window.innerWidth : 0 }}
				/>

				{this.renderSlidePanelMedals(boxW, true)}

				{this.renderSlidePanelFights(boxW, true)}
			</div>
		)
	}

	renderBodyLarge() {
		const { nft, loading, infoBurn, ring, pendant } = this.state
		const { account } = this.props

		const { boxW, padding } = getBoxWidth(false)

		let insideWidth = boxW > 1000 ? 1000 : boxW

		const boxWidthRight = insideWidth - 430
		let ctaWidth = boxWidthRight * 30 / 100
		//if (ctaWidth > 250) ctaWidth = 250

		let showOverlayBurn = infoBurn && infoBurn.burned

		return (
			<div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: padding/2, overflowY: 'auto', overflowX: 'hidden', alignItems: 'center' }}>

				{
					loading &&
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 50 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
				}

				<div style={{ width: insideWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 }}>

						<div style={{ position: 'relative', marginRight: 30 }}>
							<img
								style={{ width: 400, height: 400, borderRadius: 4, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid' }}
								src={getImageUrl(nft.id)}
								alt={nft.id}
							/>

							{
								showOverlayBurn ?
								<img
									style={{ width: 400, height: 400, borderRadius: 4, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', position: 'absolute', top: 0, left: 0 }}
									src={burn_overlay}
									alt={nft.id}
								/>
								: null
							}
						</div>

						<div style={{ flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'space-between' }}>

							<div style={{ width: boxWidthRight, flexDirection: 'column', alignItems: 'center' }}>
								{this.renderName(20)}

								<div style={{ width: boxWidthRight, alignItems: 'center', flexDirection: 'column' }}>
									{
										account && account.account !== nft.owner && !nft.listed ?
										this.renderBtnChallenge(ctaWidth*2)
										: null
									}

									{this.renderBtnsMedalsFights(ctaWidth*2)}
								</div>
							</div>

							{
								//nft listato, in renderbtn buy gestiamo tutti i casi, anche account non connesso
								nft.listed &&
								<div style={Object.assign({}, styles.boxRightLarge, { width: boxWidthRight })}>

									{this.renderLeftBoxPriceListed(nft.owner === account.account, boxWidthRight)}

									{this.renderBtnBuy(ctaWidth, 0)}

								</div>
							}

							{
								// nft non listato ma tu sei owner: SELL
								!nft.listed && account && account.account && nft.owner === account.account ?
								<div style={Object.assign({}, styles.boxRightLarge, { width: boxWidthRight })}>

									{this.renderLeftBoxListing(boxWidthRight)}

									{this.renderBtnSell(ctaWidth, 0)}

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
										this.renderBtnMakeOffer(ctaWidth)
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

									{this.renderBtnConnect(ctaWidth, 0)}
								</div>
								: null
							}

						</div>

				</div>

				<div style={{ width: insideWidth, justifyContent: 'space-between' }}>
					{this.renderBoxStats((insideWidth/2) - 10)}

					{
						(ring && ring.equipped) || (pendant && pendant.equipped) ?
						this.renderBoxEquipment(insideWidth/2 - 10)
						:
						this.renderBoxSpellbook(insideWidth/2 - 10)
					}
				</div>

				{
					(ring && ring.equipped) || (pendant && pendant.equipped) ?
					this.renderBoxSpellbook(insideWidth)
					: null
				}

				{this.renderBoxProperties(insideWidth)}

				{this.renderBoxOffers(insideWidth, false)}

				{this.renderBoxSales(insideWidth, false)}

				<div
					className={this.state.showMedals || this.state.showFights ? "bg-slide-on" : "bg-slide-off"}
					onClick={() => {
						document.body.style.overflow = "auto"
						document.body.style.height = "auto"
						this.setState({ showMedals: false, showFights: false })
					}}
					style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000090', width: this.state.showMedals || this.state.showFights ? window.innerWidth : 0 }}
				/>

				{this.renderSlidePanelMedals(boxW, false)}

				{this.renderSlidePanelFights(boxW, false)}

			</div>
		)
	}

	renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
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
		const { showModalConnection, error, showModalTransfer, showModalOffer } = this.state

		let modalW = window.innerWidth * 82 / 100
		if (modalW > 480) {
			modalW = 480
		}
		else if (modalW < 310) {
			modalW = 310
		}

		return (
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>

				<Toaster
					position="top-center"
  					reverseOrder={false}
				/>

				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
					render={() => this.renderTopHeader(false)}
				/>

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

				{
                    this.state.showModalSpellbook &&
                    <ModalSpellbook
                        showModal={this.state.showModalSpellbook}
                        onCloseModal={() => this.setState({ showModalSpellbook: false })}
                        width={modalW}
                        equipment={[this.state.ring]}
                        stats={this.state.nft}
                        onSub={(spellSelected) => {
                            this.changeSpell(spellSelected)
                            this.setState({ showModalSpellbook: false })
                        }}
                    />
                }

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
	boxShare: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#1d1d1f',
		borderStyle: 'solid',
		borderRadius: 4
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
		borderRadius: 4,
		paddingTop: 10,
		paddingLeft: 10,
		paddingRight: 10,
		backgroundColor: '#f4f4f4',
		marginBottom: 10
	},
	boxRightLarge: {
		width: '100%',
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	boxRightMobile: {
		width: '100%',
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	boxPrice: {
		borderRadius: 4,
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: '#f4f4f4'
	},
	btnBuy: {
		height: 40,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		flexDirection: 'row',
		display: 'flex'
	},
	btnBuyText: {
		fontSize: 16,
		color: 'white',
	},
	boxSection: {
		flexDirection: 'column',
		borderRadius: 4,
		borderWidth: 1,
		borderColor: '#f4f4f4',
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
		borderRadius: 4,
		margin: 7,
		padding: 7,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f4f4f4',
	},
	boxHistory: {
		flexDirection: 'column',
		width: '90%',
		paddingTop: 5,
		paddingBottom: 5,
	},
	inputPrice: {
		width: 140,
		height: 36,
		color: 'black',
		borderRadius: 4,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderWidth: 1,
		fontSize: 16,
		paddingLeft: 10,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none'
	},
	textTitleStat: {
		color: '#707070',
		fontSize: 15,
		marginRight: 9,
	},
	textValueStat: {
		fontSize: 17,
		marginRight: 24
	},
	btnTransfer: {
		height: 34,
		maxWidth: 154,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#707070',
		borderRadius: 4,
		borderStyle: 'solid',
		marginTop: 5,
		paddingLeft: 11,
		paddingRight: 11
	},
	btnMedals: {
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'row',
		borderRadius: 4,
		borderWidth: 1,
		borderColor: '#707070',
		borderStyle: 'solid',
		cursor: 'pointer'
	},
	panelShadow: {
		justifyContent: 'flex-end',
		position: 'absolute',
	},
	panel: {
		flexDirection: 'column',
		overflow: 'auto',
	},
	headerPanel: {
		height: 90,
		width: '100%',
		paddingTop: 10,
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 30
	},
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, allNfts, nftSelected, userMintedNfts, subscribed, subscribedWiza, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, allNfts, nftSelected, userMintedNfts, subscribed, subscribedWiza, mainTextColor, mainBackgroundColor, isDarkmode };
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
	getInfoItemEquipped,
	updateInfoTransactionModal,
	setWizardSfidato,
	getFightPerNfts,
	changeSpellTournament
})(Nft);
