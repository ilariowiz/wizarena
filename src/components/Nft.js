import React, { Component } from 'react';
import { connect } from 'react-redux'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import { AiOutlineReload } from 'react-icons/ai';
import { AiOutlineShareAlt } from 'react-icons/ai';
import { IoEyeOffOutline } from 'react-icons/io5';
import { IoEyeOutline } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';
import { getDocs, collection, query, where } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Header from './Header';
import ModalTransaction from './common/ModalTransaction'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import ModalTransfer from './common/ModalTransfer'
import HistoryItem from './common/HistoryItem'
import getImageUrl from './common/GetImageUrl'
import traits_qty from './common/Traits_qty'
import traits_qty_clerics from './common/Traits_qty_clerics'
import conditions from './common/Conditions'
import allSpells from './common/Spells'
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
	getInfoNftBurning
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
			dataMarketHistory: {},
			fights: [],
			traitsRank: undefined,
			loadingHistory: true,
			numbersOfMaxMedalsPerTournament: [],
			historyUpgrades: [],
			openFightsSection: [],
			infoBurn: {},
			level: 0
		}
	}

	componentDidMount() {
		//console.log(this.props.account)
		document.title = `Wizards Arena`

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")
		this.loadKadenaPrice()

		setTimeout(() => {
			this.getPathNft()
		}, 500)
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

	getPathNft() {
		const { pathname } = this.props.location;
		const idNft = pathname.replace('/nft/', '')

		this.loadNft(idNft)
	}

	groupFights(array, key) {

		let temp = []

		for (let i = 0; i < array.length; i++) {
			const fight = array[i]

			if (fight.tournament.includes(key)) {
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
				document.title = `${response.name} - Wizards Arena`

				//console.log(response)

				const tournaments = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"]

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

				const level = calcLevelWizard(response)

				this.setState({ nft: response, level, loading: false, openFightsSection }, () => {
					this.loadHistory(idNft)
					this.getHistoryUpgrades(idNft)
					this.loadMaxMedalsPerTournament()
					if (response.confirmBurn) {
						this.loadInfoBurn(idNft)
					}
				})
			}
			else {
				this.setState({ error: '404', loading: false })
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

	async getHistoryUpgrades(idNft) {
        const q = query(collection(firebasedb, "history_upgrades"),
                        where("idnft", "==", `#${idNft}`))

        const querySnap = await getDocs(q)
        //console.log(querySnap);

        let historyUpgrades = []

        querySnap.forEach(doc => {
            //console.log(doc.data());
			const data = doc.data()

			let objectKey = historyUpgrades.find(i => i.stat === data.stat)
			if (objectKey) {
				const idx = historyUpgrades.findIndex(i => i.stat === data.stat)
				if (idx > -1) {
					objectKey["value"] = objectKey["value"] + 1
					historyUpgrades[idx] = objectKey
				}
			}
			else {
				historyUpgrades.push({ stat: data.stat, value: 1 })
			}
        })

    	//console.log(historyUpgrades);
		this.setState({ historyUpgrades })
    }

	loadHistory(idNft) {
		let url = `https://estats.chainweb.com/txs/events?search=${CONTRACT_NAME}.WIZ_BUY&param=${idNft}&offset=0&limit=50`

		//console.log(url);

		fetch(url)
  		.then(response => response.json())
  		.then(data => {
  			//console.log(data)

			let filterData = []
			if (data && data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					let d = data[i]

					const id = d.params[0]

					if (id && id === idNft) {
						filterData.push(d)
					}
				}
			}

			this.setState({ nftH: filterData, loadingHistory: false })
  		})
		.catch(e => {
			console.log(e)
			this.setState({ loadHistory: false })
		})
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
			this.props.listNft(chainId, gasPrice, 700, netId, nft.id, parseFloat(inputPrice).toFixed(2), account)
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

		const dataMarketHistory = {
			idNft: nft.id,
			price: nft.price,
			from: nft.owner,
			to: account.account,
		}

		this.setState({ typeModal: 'buy', dataMarketHistory }, () => {
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
			if (nft.id < 1024) {
				const section = traits_qty[item.trait_type.toLowerCase()]
				const qty = section[item.value]

				percentString = qty * 100 / 1024
			}
			else {
				const section = traits_qty_clerics[item.trait_type.toLowerCase()]
				const qty = section[item.value]

				percentString = qty * 100 / 1024
			}
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
				condDesc = `${condInfo.effect} - Chance of success: ${condInfo.pct}%`
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
						<p style={{ fontSize: 18, color: 'white', marginRight: 15 }}>
							TOURNAMENT n. {key.replace("t","")}
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
			<button
				className='btnH'
				style={styles.boxSingleTrait}
				key={index}
				onClick={() => {
					this.props.history.replace(`/fight/${item.fightId}`)
				}}
			>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 14, marginBottom: 5 }}>
					round {round.replace("r", "")}
				</p>
				<p style={{ color: textWinnerColor, fontSize: 17 }}>
					{textWinner}
				</p>
			</button>
		)
	}

	renderHistoryItem(item, index, isMobile) {
		const { nftH } = this.state

		return (
			<HistoryItem
				item={item}
				index={index}
				nftH={nftH}
				key={index}
				isMobile={isMobile}
			/>
		)
	}

	// SE NFT é LISTATO ******************************************
	// GESTIAMO I CASI: Connect Wallet, Cancel Listing, Buy Now, Make Offer
	renderBtnBuy(width, marginRight) {
		const { nft } = this.state;
		const { account } = this.props

		if (!account || (account && !account.account)) {
			return (
				<div style={{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
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
			return (
				<div style={{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
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

		return (
			<div style={{ height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
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

	renderBtnConnect(width, marginRight) {
		return (
			<div style={{ alignItems: 'center', justifyContent: 'center', marginRight }}>
				<button
					className='btnH'
					style={Object.assign({}, styles.btnBuy, { width })}
					onClick={() => this.setState({ showModalConnection: true })}
				>
					<p style={Object.assign({}, styles.btnBuyText, { fontSize: 19 })}>
						Connect wallet
					</p>
				</button>
			</div>
		)
	}

	renderBtnSell(width, marginRight) {
		const { nft } = this.state
		const { account } = this.props

		return (
			<div style={{ flexDirection: 'column', height: '100%', alignItems: 'flex-end', justifyContent: 'space-between' }}>
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

	renderName(name, marginBottom) {
		return (
			<div style={{ flexDirection: 'column', marginBottom }}>
				<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 30, lineHeight: 1 }}>
					Wizard {name}
				</p>
			</div>
		)
	}

	renderLeftBoxPriceListed() {
		const { nft, kadenaPrice } = this.state

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>

				{this.renderName(nft.name, 24)}

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
			</div>
		)
	}

	renderLeftBoxListing() {
		const { inputPrice, kadenaPrice, nft } = this.state

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>

				{this.renderName(nft.name, 24)}

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
		const { nft, infoBurn } = this.state

		const isBurned = infoBurn && infoBurn.burned

		return (
			<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 15 }}>
				{this.renderName(nft.name, 0)}

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

		if (title === "SPELL PERK") {

			let condDesc;
			if (value && value !== "-") {
				let condInfo = conditions.find(i => i.name.toUpperCase() === value)
				if (condInfo) {
					condDesc = `${condInfo.effect} - Chance of success: ${condInfo.pct}%`
				}
			}

			return (
				<div style={{ alignItems: 'flex-end', marginBottom: 5 }}>
					<p style={styles.textTitleStat}>{title}</p>

					{
						condDesc ?
						<Popup
							trigger={open => (
								<button style={styles.textValueStat}>{value}</button>
							)}
							position="top center"
							on="hover"
						>
							<div style={{ padding: 10, fontSize: 16 }}>
								{condDesc}
							</div>
						</Popup>
						:
						<p style={styles.textValueStat}>{value}</p>
					}

				</div>
			)
		}

		return (
			<div style={{ alignItems: 'flex-end', marginBottom: 5 }}>
				<p style={styles.textTitleStat}>{title}</p>
				<p style={styles.textValueStat}>{value}</p>
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
		const { nft, historyUpgrades, level } = this.state

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

							{this.renderStat("ELEMENT", nft.element.toUpperCase())}

							{this.renderStat("SPELL", spellSelected.name.toUpperCase())}

							{this.renderStat("ATTACK", nft.attack.int + spellSelected.atkBase)}
							{this.renderStat("DAMAGE", nft.damage.int + spellSelected.dmgBase)}

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

				</div>
			</div>
		)
	}

	renderBoxMedals(width) {
		const { nft } = this.state

		//console.log(nft)

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
						nft && nft.medals && Object.keys(nft.medals).sort().map((key) => {
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

	renderBoxSales(width) {
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
						return this.renderHistoryItem(item, index, false)
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

	renderBodySmall() {
		const { nft, loading, infoBurn } = this.state
		const { account } = this.props

		let boxW = Math.floor(window.innerWidth * 90 / 100)
		let imageWidth = boxW > 500 ? 500 : boxW - 30

		let boxTopStyle = { width: boxW, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 25, marginBottom: 25 }

		let showOverlayBurn = infoBurn && infoBurn.burned

		let ctaWidth = boxW * 35 / 100
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
							<div style={styles.boxRightLarge}>

								{this.renderLeftBoxPriceListed()}

								{this.renderBtnBuy(ctaWidth, 15)}

							</div>
						}

						{
							// nft non listato ma tu sei owner: SELL
							!nft.listed && account && account.account && nft.owner === account.account ?
							<div style={styles.boxRightLarge}>
								{this.renderLeftBoxListing()}

								{this.renderBtnSell(ctaWidth, 15)}

							</div>
							: null
						}

						{
							//non sei il proprietario e l'nft non è listato
							!nft.listed && !loading && account && account.account && nft.owner !== account.account ?
							<div style={styles.boxRightLarge}>

								{this.renderLeftMakeOffer()}
							</div>
							: null
						}

						{
							//nft non listato ma account non connesso CONNECT WALLET
							 !nft.listed && !loading && (!account || (account && !account.account)) ?
							<div style={styles.boxRightLarge}>

								{this.renderLeftMakeOffer()}

								{this.renderBtnConnect(ctaWidth, 15)}
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

				{this.renderBoxSales(imageWidth)}
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

								{this.renderLeftBoxPriceListed()}

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

				{this.renderBoxSales(boxW)}

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
		const { inputPrice, nft, typeModal, showModalConnection, loading, error, showModalTransfer } = this.state

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
					dataMarketHistory={this.state.dataMarketHistory}
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
		marginBottom: 2
	},
	textValueStat: {
		color: 'white',
		fontSize: 22,
		marginRight: 24
	},
	btnTransfer: {
		height: 35,
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
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts };
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
	getInfoNftBurning
})(Nft);
