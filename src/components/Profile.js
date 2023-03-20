import React, { Component } from "react";
import { connect } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import { IoClose } from 'react-icons/io5'
import Popup from 'reactjs-popup';
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import OfferItem from './common/OfferItem'
import OfferEquipmentItem from './common/OfferEquipmentItem'
import NftCardStake from './common/NftCardStake'
import EquipmentCard from './common/EquipmentCard'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import {
	loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getWizaBalance,
	stakeNft,
	unstakeNft,
	claimWithoutUnstake,
	claimAllWithoutUnstake,
	claimAllAndUnstakeAll,
	stakeAll,
	addNftToBurningQueue,
	removeNftFromBurningQueue,
	delistNft,
	getOffersMade,
	getOffersReceived,
	acceptOffer,
	loadEquipMinted,
	getEquipmentOffersMade,
	withdrawEquipmentOffer,
	getWizardsStakeInfo,
	calculateRewardMass,
	updateInfoTransactionModal
} from '../actions'
import { MAIN_NET_ID, BACKGROUND_COLOR, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';


class Profile extends Component {
	constructor(props) {
		super(props)

		let isConnected = this.props.account && this.props.account.account

		this.state = {
			section: 1,
			loading: true,
			showModalConnection: false,
			isConnected,
			error: '',
			unclaimedWizaTotal: 0,
			stakeInfo: [],
			stakedIds: [],
			notStakedIds: [],
			offersMade: [],
			offersReceived: [],
			kadenaPrice: undefined,
			equipment: [],
			offersEquipmentMade: [],
			statSearched: [],
			yourNfts: [],
			loadingStake: true
		}
	}

	componentDidMount() {
		document.title = "Me - Wizards Arena"

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		this.loadKadenaPrice()

		setTimeout(() => {

			this.loadProfile()
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

	loadProfile() {
		this.loadMinted()
		this.loadWizaBalance()
		this.loadEquip()
		this.loadOffersMade()
		this.loadOffersEquipmentMade()
	}

	loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {

				//console.log(response);
				this.setState({ loading: false, yourNfts: response })

				this.loadStakeInfo(response)
				this.loadOffersReceived()
			})
		}
	}

	loadStakeInfo(response) {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		const onlyids = response.map(i => i.id)

		this.props.getWizardsStakeInfo(chainId, gasPrice, gasLimit, networkUrl, onlyids, (info) => {
			//console.log(info);
			let stakedIds = []
			let notStakedIds = []

			//console.log(response);

			info.map(i => {

				const res = response.find(r => r.id === i.idnft)

				if (i.staked) {
					stakedIds.push(i.idnft)
				}
				else {
					//aggiungiamo ai non staked solo quelli non listati e non in burning queue
					//in modo da avere gia la lista corretta quando si fa stake-all
					if (!res.listed && !res.confirmBurn) {
						notStakedIds.push(i.idnft)
					}
				}
			})

			//console.log(notStakedIds);

			this.setState({ stakeInfo: info, stakedIds, notStakedIds })
			//console.log(onlyStaked);

			this.props.calculateRewardMass(chainId, gasPrice, stakedIds.length * 200, networkUrl, stakedIds, (rewards) => {
				//console.log(rewards);
				let tot = 0
				rewards.map(i => {
					if (i.decimal) {
						tot += _.floor(i.decimal, 4)
					}
					else {
						tot += _.floor(i, 4)
					}
				})

				//console.log(tot);
				this.setState({ unclaimedWizaTotal: tot, loadingStake: false })
			})
		})
	}

	loadWizaBalance() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWizaBalance(chainId, gasPrice, gasLimit, networkUrl, account.account)
		}
	}

	loadOffersMade() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getOffersMade(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
				this.setState({ offersMade: response, loading: false })
			})
		}
	}

	loadOffersEquipmentMade() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getEquipmentOffersMade(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
			//console.log(response);
			this.setState({ offersEquipmentMade: response, loading: false })
		})

	}

	loadOffersReceived() {
		const { account, chainId, gasPrice, gasLimit, networkUrl, userMintedNfts } = this.props

		if (account && account.account) {
			this.props.getOffersReceived(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {

				//console.log(response);
				//console.log(userMintedNfts);

				let ownNft = []
				userMintedNfts.map(z => {
					const offersForThisNft = response.filter(i => i.refnft === z.id)
					//console.log(offersForThisNft);
					ownNft.push(...offersForThisNft)
				})

				let now = moment()

				ownNft = ownNft.filter(i => moment(i.expiresat.timep) > now)

				//console.log(ownNft);

				this.setState({ offersReceived: ownNft, loading: false })
			})
		}
	}

	loadEquip() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);

                this.setState({ equipment: response, loading: false })
			})
		}
    }

	stakeNft(idnft) {
		const { chainId, gasPrice, netId, account } = this.props

		let text = `You will stake #${idnft}. You can unstake it any time. While it is staked you will not be able to sell this wizard but you will still be able to register it for tournaments.`

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: text,
			typeModal: 'stake',
			transactionOkText: `Your Wizard #${idnft} is staked!`
		})

		this.props.stakeNft(chainId, gasPrice, 4000, netId, idnft, account)
	}

	unstakeNft(idnft) {
		const { chainId, gasPrice, netId, account } = this.props

		let text = `You will unstake #${idnft}`

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: text,
			typeModal: 'unstake',
			transactionOkText: `Your Wizard #${idnft} is unstaked!`
		})

		this.props.unstakeNft(chainId, gasPrice, 4000, netId, idnft, account)
	}

	claimWizaWithoutUnstake(idnft) {
		const { chainId, gasPrice, netId, account } = this.props

		let text = `You will claim your $WIZA mined by #${idnft}`

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: text,
			typeModal: 'claim',
			transactionOkText: `Your $WIZA have been claimed!`
		})

		this.props.claimWithoutUnstake(chainId, gasPrice, 4000, netId, idnft, account)
	}


	claimAll() {
		const { chainId, gasPrice, netId, account } = this.props
		const { stakedIds } = this.state

		if (stakedIds.length === 0) {
			return
		}

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will claim your $WIZA mined by all your wizards`,
			typeModal: 'claimall',
			transactionOkText: `Your $WIZA have been claimed!`
		})

		let objects = []
		stakedIds.map(i => {
			let obj = {
				idnft: i,
				sender: account.account
			}
			objects.push(obj)
		})

		let gasLimit = objects.length * 2000
		if (gasLimit > 200000) {
			gasLimit = 200000
		}
		this.props.claimAllWithoutUnstake(chainId, gasPrice, gasLimit, netId, objects, account)
	}

	unstakeAndClaimAll() {
		const { chainId, gasPrice, netId, account } = this.props
		const { stakedIds } = this.state

		if (stakedIds.length === 0) {
			return
		}

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will unstake and claim your $WIZA mined by all your wizards`,
			typeModal: 'unstakeandclaimall',
			transactionOkText: `Your $WIZA have been claimed!`
		})

		let objects = []
		stakedIds.map(i => {
			let obj = {
				idnft: i,
				sender: account.account
			}
			objects.push(obj)
		})

		let gasLimit = objects.length * 2000
		if (gasLimit > 180000) {
			gasLimit = 180000
		}
		this.props.claimAllAndUnstakeAll(chainId, gasPrice, gasLimit, netId, objects, account)
	}

	stakeAll() {
		const { chainId, gasPrice, netId, account } = this.props
		const { notStakedIds } = this.state

		if (notStakedIds.length === 0) {
			return
		}

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will stake all your wizards that aren't listed or in burning queue`,
			typeModal: 'stakeall',
			transactionOkText: `Your Wizards are staked!`
		})

		let objects = []
		notStakedIds.map(i => {
			let obj = {
				idnft: i,
				sender: account.account
			}
			objects.push(obj)
		})

		let gasLimit = objects.length * 2000
		if (gasLimit > 180000) {
			gasLimit = 180000
		}
		this.props.stakeAll(chainId, gasPrice, gasLimit, netId, objects, account)
	}

	addToBurning(id) {
		const { chainId, gasPrice, netId, account } = this.props

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `Your Wizard #${id} has been added to the burning queue!`,
			typeModal: 'burningon',
			transactionOkText: `You will add Wizard #${id} to the burning queue`
		})

		this.props.addNftToBurningQueue(chainId, gasPrice, netId, id, account)
	}

	removeFromBurning(id) {
		const { chainId, gasPrice, netId, account } = this.props

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will remove #${id} from burning queue`,
			typeModal: 'burningoff',
			transactionOkText: `Your Wizard #${id} has been removed from the burning queue`
		})

		this.props.removeNftFromBurningQueue(chainId, gasPrice, netId, id, account)
	}

	delist(id) {
		const { account, chainId, gasPrice, netId } = this.props

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will delist #${id}`,
			typeModal: 'delist',
			transactionOkText: 'Delisting successfully',
			nameNft: `#${id}`
		})

		this.props.delistNft(chainId, gasPrice, 700, netId, account, id)
	}

	acceptOffer(offer) {
		const { account, chainId, gasPrice, netId } = this.props

		//console.log(amount, duration);
		let offerInfoRecap = `You are accepting an offer of ${offer.amount} KDA (minus 7% marketplace fee) for #${offer.refnft}`

		let saleValues = { id: offer.refnft, amount: offer.amount }

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: offerInfoRecap,
			typeModal: 'acceptoffer',
			transactionOkText: `Offer accepted!`,
			saleValues
		})

		this.props.acceptOffer(chainId, gasPrice, 5000, netId, offer.id, offer.refnft, account)
	}

	withdrawEquipmentOffer(offer) {
		const { account, chainId, gasPrice, netId } = this.props

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: 'You will withdraw funds from this offer',
			typeModal: 'withdrawoffer',
			transactionOkText: 'Funds successfully withdrawn'
		})

		this.props.withdrawEquipmentOffer(chainId, gasPrice, 5000, netId, offer.id, account)
	}

	async searchByStat(stat) {
		const { statSearched } = this.state
        const { userMintedNfts } = this.props

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

			let newData = Object.assign([], userMintedNfts)

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

			//console.log(newData);
			this.setState({ yourNfts: newData, loading: false, statSearched: oldStat })
		}
		else {
			this.setState({ loading: false, statSearched: [], yourNfts: userMintedNfts })
		}
	}

	renderRow(item, index) {
		const { stakeInfo, loadingStake } = this.state

		//console.log(item);

		return (
			<NftCardStake
				item={item}
				key={item.id}
				index={index}
				history={this.props.history}
				width={260}
				onStake={() => this.stakeNft(item.id)}
				onUnstake={() => this.unstakeNft(item.id)}
				onClaim={() => this.claimWizaWithoutUnstake(item.id)}
				onAddBurning={() => this.addToBurning(item.id)}
				onRemoveBurning={() => this.removeFromBurning(item.id)}
				onDelist={() => this.delist(item.id)}
				stakeInfo={stakeInfo.find(i => i.idnft === item.id)}
				loading={loadingStake}
			/>
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

	renderYourWizards(width) {
		const { yourNfts, loading } = this.state
		const { userMintedNfts } = this.props

		return (
			<div style={{ width, flexDirection: 'column' }}>

				{
					userMintedNfts && userMintedNfts.length === 0 && !loading ?
					this.renderError()
					: null
				}

				{
					!loading &&
					<div style={{ flexWrap: 'wrap', marginBottom: 10 }} id="filters">
						{this.renderBoxSearchStat("hp", "HP", ["40 - 50", "51 - 60", "61 - 65", "66 - 70", "71 - 75", "76 - 80", "81 - 85", "86 - 90", "91 - 95", "96 - 100", "101 - 105", "106 - 110", "111 - 115", "116 - 120", "121 - 125"].reverse())}
						{this.renderBoxSearchStat("defense", "DEFENSE", ["14 - 15", "16 - 17", "18 - 19", "20 - 21", "22 - 23", "24 - 25", "26 - 27", "28 - 29", "30 - 31", "32 - 33", "34 - 35", "36 - 37", "38 - 39", "40 - 41"].reverse())}
						{this.renderBoxSearchStat("element", "ELEMENT", ["Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"])}
						{this.renderBoxSearchStat("resistance", "RESISTANCE", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
						{this.renderBoxSearchStat("weakness", "WEAKNESS", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
						{this.renderBoxSearchStat("spellbook", "SPELLBOOK", [1, 2, 3, 4])}
						{this.renderBoxSearchStat("level", "LEVEL", ["122 - 150", "151 - 175", "176 - 200", "201 - 225", "226 - 250", "251 - 275", "276 - 300", "301 - 325", "326 - 350"].reverse())}
					</div>
				}

				{
					!loading &&
					<p style={{ fontSize: 15, color: '#c2c0c0', marginBottom: 15 }}>
						Wizards {yourNfts.length}
					</p>
				}

				{
					yourNfts && yourNfts.length > 0 ?
					<div style={{ alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
						{yourNfts.map((item, index) => {
							return this.renderRow(item, index);
						})}
					</div>
					: null
				}
			</div>
		)
	}

	renderYourEquip(width) {
		const { equipment } = this.state

		return (
			<div style={{ flexWrap: 'wrap', width }}>
				{equipment.map((item, index) => {
					return (
			            <EquipmentCard
			                key={index}
			                item={item}
			                index={index}
			                history={this.props.history}
			            />
			        )
				})}
			</div>
		)
	}


	renderOffers(width, offers, isMade, isMobile) {
		const { kadenaPrice } = this.state

		return (
			<div style={{ flexDirection: 'column' }}>
				{offers.map((item, index) => {
					return (
						<OfferItem
							item={item}
							index={index}
							isOwner={!isMade}
							isBuyer={isMade}
							showImage={true}
							kadenaPrice={kadenaPrice}
							key={item.id}
							isMobile={isMobile}
							history={this.props.history}
							onAcceptOffer={() => this.acceptOffer(item)}
						/>
					)
				})}
			</div>
		)
	}

	renderEquipmentOffersMade(width, isMobile) {
		const { offersEquipmentMade } = this.state

		return (
			<div style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
				{offersEquipmentMade.map((item, index) => {
					return (
						<OfferEquipmentItem
							item={item}
							key={index}
							withdrawOffer={() => this.withdrawEquipmentOffer(item)}
							isMobile={isMobile}
						/>
					)
				})}
			</div>
		)
	}

	renderMenu(isMobile) {
		const { section, loading, equipment, offersMade, offersReceived, offersEquipmentMade } = this.state;
		const { userMintedNfts } = this.props

		const selStyle = { borderBottomWidth: 3, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderColor: CTA_COLOR, borderStyle: 'solid' }
		const unselStyle = { borderBottomWidth: 3, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderColor: 'transparent', borderStyle: 'solid' }
		const selectedStyle1 = section === 1 ? selStyle : unselStyle
		const selectedStyle3 = section === 3 ? selStyle : unselStyle
		const selectedStyle4 = section === 4 ? selStyle : unselStyle
		const selectedStyle5 = section === 5 ? selStyle : unselStyle

		return (
			<div style={{ width: '100%', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap' }}>
				<button
					style={Object.assign({}, styles.btnMenu, selectedStyle1, { marginRight: 35 })}
					onClick={() => {
						if (this.state.section !== 1) {
							this.setState({ section: 1 })
						}
					}}
				>
					<p style={{ fontSize: isMobile ? 17 : 18, color: section === 1 ? CTA_COLOR : '#21c6e895' }}>
						MY COLLECTION ({(userMintedNfts && userMintedNfts.length) || 0})
					</p>
				</button>

				<button
					style={Object.assign({}, styles.btnMenu, selectedStyle5, { marginRight: 35 })}
					onClick={() => {
						if (loading) {
							return
						}

						this.setState({ section: 5, loading: true })
						this.loadEquip()
					}}
				>
					<p style={{ fontSize: isMobile ? 17 : 18, color: section === 5 ? CTA_COLOR : '#21c6e895' }}>
						EQUIPMENT {equipment.length > 0 ? `(${equipment.length})` : ""}
					</p>
				</button>

				<button
					style={Object.assign({}, styles.btnMenu, selectedStyle3, { marginRight: 35 })}
					onClick={() => {
						if (loading || !userMintedNfts) {
							return
						}

						this.setState({ section: 3, loading: true })
						this.loadOffersMade()
					}}
				>
					<p style={{ fontSize: isMobile ? 17 : 18, color: section === 3 ? CTA_COLOR : '#21c6e895' }}>
						{offersMade ? `OFFERS MADE (${offersMade.length + offersEquipmentMade.length})` : "OFFERS MADE"}
					</p>
				</button>

				<button
					style={Object.assign({}, styles.btnMenu, selectedStyle4, { marginRight: 35 })}
					onClick={() => {
						if (loading || !userMintedNfts) {
							return
						}

						this.setState({ section: 4, loading: true })
						this.loadOffersReceived()
					}}
				>
					<p style={{ fontSize: isMobile ? 17 : 18, color: section === 4 ? CTA_COLOR : '#21c6e895' }}>
						{offersReceived ? `OFFERS RECEIVED (${offersReceived.length})` : "OFFERS RECEIVED"}
					</p>
				</button>
			</div>
		)
	}

	renderBody(isMobile) {
		const { account, wizaBalance } = this.props
		const { showModalConnection, isConnected, section, loading, unclaimedWizaTotal, offersMade, offersReceived, offersEquipmentMade } = this.state

		const { boxW, modalW } = getBoxWidth(isMobile)

		let unclW = 0;
		if (unclaimedWizaTotal) {
			unclW = _.floor(unclaimedWizaTotal, 4)
		}

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

		return (
			<div style={{ flexDirection: 'column', width: boxW, marginTop: 30 }}>

				<div style={{ alignItems: 'center', marginBottom: 30 }}>
					<div style={{ flexDirection: 'column' }}>
						<p style={{ fontSize: 24, color: TEXT_SECONDARY_COLOR, marginBottom: 10 }}>
							$WIZA balance: {wizaBalance || 0.0}
						</p>

						<p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR }}>
							Unclaimed $WIZA: {unclW || 0.0}
						</p>
					</div>
				</div>

				<div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 15 }}>
					<button
						className="btnH"
						style={styles.btnClaimAll}
						onClick={() => this.claimAll()}
					>
						<p style={{ fontSize: 17, color: 'white' }}>
							CLAIM ALL
						</p>
					</button>

					<button
						className="btnH"
						style={styles.btnClaimAll}
						onClick={() => this.unstakeAndClaimAll()}
					>
						<p style={{ fontSize: 17, color: 'white' }}>
							UNSTAKE & CLAIM ALL
						</p>
					</button>

					<button
						className="btnH"
						style={styles.btnClaimAll}
						onClick={() => this.stakeAll()}
					>
						<p style={{ fontSize: 17, color: 'white' }}>
							STAKE ALL
						</p>
					</button>

				</div>

				{this.renderMenu(isMobile)}

				{
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

				{
					section === 1 ?
					this.renderYourWizards(boxW)
					:
					null
				}

				{
					section === 2 && !loading ?
					this.renderTournament(boxW, modalW)
					:
					null
				}

				{
					section === 3 && !loading && offersMade ?
					this.renderOffers(boxW, offersMade, true, isMobile)
					:
					null
				}

				{
					section === 3 && !loading && offersEquipmentMade ?
					this.renderEquipmentOffersMade(boxW, isMobile)
					:
					null
				}

				{
					section === 4 && !loading && offersReceived ?
					this.renderOffers(boxW, offersReceived, false, isMobile)
					:
					null
				}

				{
					section === 5 ?
					this.renderYourEquip(boxW)
					:
					null
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
					section={3}
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
	btnWithdraw: {
		width: 200,
		height: 45,
		borderColor: CTA_COLOR,
		borderRadius: 2,
		borderWidth: 2,
		borderStyle: 'solid',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent'
	},
	btnMenu: {
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnClaimAll: {
		width: 200,
		height: 40,
		backgroundColor: CTA_COLOR,
		borderRadius: 2,
		marginRight: 15,
		marginBottom: 15,
		borderStyle: 'solid',
		justifyContent: 'center',
		alignItems: 'center',
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
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, wizaBalance } = state.mainReducer;

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, wizaBalance };
}

export default connect(mapStateToProps, {
	loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getWizaBalance,
	stakeNft,
	unstakeNft,
	claimWithoutUnstake,
	claimAllWithoutUnstake,
	claimAllAndUnstakeAll,
	stakeAll,
	addNftToBurningQueue,
	removeNftFromBurningQueue,
	delistNft,
	getOffersMade,
	getOffersReceived,
	acceptOffer,
	loadEquipMinted,
	getEquipmentOffersMade,
	withdrawEquipmentOffer,
	getWizardsStakeInfo,
	calculateRewardMass,
	updateInfoTransactionModal
})(Profile)
