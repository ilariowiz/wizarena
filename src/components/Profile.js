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
	updateInfoTransactionModal,
	declineOffer,
	getWalletXp
} from '../actions'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
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
			loadingStake: true,
			itemsToShow: [],
            searchText: "",
            searchedText: "",
			showFilters: window.innerWidth > 767
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
		this.getWalletXp()
		this.loadMinted()
		this.loadWizaBalance()
		this.loadEquip()
		this.loadOffersMade()
		this.loadOffersEquipmentMade()
	}

	getWalletXp() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWalletXp(chainId, gasPrice, gasLimit, networkUrl, account)
		}
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

	searchByNameEquip() {
		const { searchText, equipment } = this.state

        if (!searchText) {
            return
        }

		//console.log(searchText);

		let result;

		if (searchText === "Ring" || searchText === "Pendant") {
			result = equipment.filter(i => i.type === searchText.toLowerCase())
		}
		else if (searchText.includes("Resistance")) {
			let newValue = searchText.replace(" Resistance", "").toLowerCase()

			result = equipment.filter(i => i.bonus.includes(newValue))
		}
		else {
			result = equipment.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()))

	        if (result.length === 0) {
	            result = equipment.filter(i => i.id === searchText)
	        }
		}

		this.setState({ itemsToShow: result, searchedText: searchText })
	}

    cancelEquipSearch() {
		this.setState({ searchedText: '', searchText: '', itemsToShow: [] })
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

		this.props.delistNft(chainId, gasPrice, 2000, netId, account, id)
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

	declineOffer(offer) {
		const { account, chainId, gasPrice, netId } = this.props

		//console.log(offer);
		//return

		//console.log(amount, duration);
		let offerInfoRecap = `You are declining this offer`

		let saleValues = { id: offer.refnft, amount: offer.amount }

		this.props.updateInfoTransactionModal({
			transactionToConfirmText: offerInfoRecap,
			typeModal: 'declineoffer',
			transactionOkText: `Offer declined!`,
			saleValues
		})

		this.props.declineOffer(chainId, gasPrice, 3000, netId, offer.id, offer.refnft, account)
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

			//console.log(newData);
			this.setState({ yourNfts: newData, loading: false, statSearched: oldStat })
		}
		else {
			this.setState({ loading: false, statSearched: [], yourNfts: userMintedNfts })
		}
	}

	renderRow(item, index) {
		const { stakeInfo, loadingStake, equipment } = this.state

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
				equipment={equipment}
			/>
		)
	}

	renderError() {
		return (
			<div style={{ width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
				<img
					src={getImageUrl(undefined)}
					style={{ width: 300, height: 300, borderRadius: 4, marginBottom: 30 }}
					alt='Placeholder'
				/>

				<p style={{ fontSize: 20, color: 'white', textAlign: 'center' }}>
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
				<p style={{ fontSize: 16, color: this.props.mainTextColor }}>
					{item}
				</p>
			</button>
		)
	}

	renderBoxSearchStat(statName, statDisplay, list) {
		const { statSearched } = this.state
		const { mainTextColor } = this.props

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
						<p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">{text}</p>
						{
							findItem &&
							<IoClose
								color={mainTextColor}
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
				contentStyle={{ backgroundColor: this.props.mainBackgroundColor }}
				position="right center"
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

	renderListEquip(item, index) {
		return (
			<button
				key={index}
				style={{ marginBottom: 15, marginLeft: 10 }}
				onClick={() => {
					this.listPopup.close()
                    this.setState({ searchText: item }, () => {
                        this.searchByNameEquip()
                    })
				}}
			>
				<p style={{ fontSize: 19 }}>
					{item}
				</p>
			</button>
		)
	}

	renderBoxSearchEquip(statDisplay, list) {
		const { searchedText } = this.state

		let text = statDisplay
		if (searchedText && list.includes(searchedText)) {
			text = `${text} = ${searchedText}`
		}

		return (
			<Popup
				ref={ref => this.listPopup = ref}
				trigger={
					<button style={styles.btnStat}>
						<p style={{ fontSize: 15, color: this.props.mainTextColor }} className="text-medium">{text}</p>
						{
							searchedText && list.includes(searchedText) &&
							<IoClose
								color={this.props.mainTextColor}
								size={22}
								style={{ marginLeft: 5 }}
								onClick={(e) => {
									e.stopPropagation()
									this.cancelEquipSearch()
								}}
							/>
						}
					</button>
				}
				position="right center"
				on="click"
				closeOnDocumentClick
				arrow={true}
			>
				<div style={{ flexDirection: 'column', paddingTop: 10 }}>
					{list.map((item, index) => {
						return this.renderListEquip(item, index)
					})}
				</div>
			</Popup>
		)
	}

	renderYourWizards(width, isMobile) {
		const { yourNfts, loading } = this.state
		const { userMintedNfts, filtriProfileRanges } = this.props

		const widthSide = 180
		const widthNfts = isMobile ? width : width - widthSide

		return (
			<div style={{ width }}>

				{
					!loading && userMintedNfts && userMintedNfts.length > 0 && filtriProfileRanges && !isMobile &&
					<div style={{ width: widthSide, flexDirection: 'column' }} id="filters">
						{this.renderBoxSearchStat("hp", "HP", filtriProfileRanges["hp"])}
						{this.renderBoxSearchStat("defense", "Defense", filtriProfileRanges["defense"])}
						{this.renderBoxSearchStat("attack", "Attack", filtriProfileRanges["attack"])}
						{this.renderBoxSearchStat("damage", "Damage", filtriProfileRanges["damage"])}
						{this.renderBoxSearchStat("speed", "Speed", filtriProfileRanges["speed"])}
						{this.renderBoxSearchStat("element", "Element", ["Acid", "Dark", "Earth", "Fire", "Ice", "Psycho", "Spirit", "Sun", "Thunder", "Undead", "Water", "Wind"])}
						{this.renderBoxSearchStat("resistance", "Resistance", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
						{this.renderBoxSearchStat("weakness", "Weakness", ["acid", "dark", "earth", "fire", "ice", "psycho", "spirit", "sun", "thunder", "undead", "water", "wind"])}
						{this.renderBoxSearchStat("spellbook", "Spellbook", [1, 2, 3, 4])}
						{this.renderBoxSearchStat("level", "Level", ["122 - 150", "151 - 175", "176 - 200", "201 - 225", "226 - 250", "251 - 275", "276 - 300", "301 - 325", "326 - 350", "351 - 375"].reverse())}
					</div>
				}

				{/*
					!showFilters &&
					<button
						className="btnH"
						style={Object.assign({}, styles.btnStat, { width: 'fit-content', marginBottom: 12 })}
						onClick={() => this.setState({ showFilters: true })}
					>
						<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
							Show filters
						</p>
					</button>
				*/}

				{/*
					!loading &&
					<p style={{ fontSize: 15, color: '#707070', marginBottom: 15 }} className="text-medium">
						Wizards {yourNfts.length}
					</p>
				*/}

				{
					userMintedNfts && userMintedNfts.length === 0 && !loading ?
					this.renderError()
					: null
				}

				{
					yourNfts && yourNfts.length > 0 ?
					<div style={{ flexWrap: 'wrap', width: widthNfts, justifyContent: isMobile ? 'center': 'flex-start' }}>
						{yourNfts.map((item, index) => {
							return this.renderRow(item, index);
						})}
					</div>
					: null
				}
			</div>
		)
	}

	calcWidthOfNft(widthNfts) {
		let widthN = Math.floor(widthNfts / 4)

		if (widthN < 200) {
			widthN = Math.floor(widthNfts / 3)

			if (widthN < 180) {
				widthN = Math.floor(widthNfts / 2)
				return widthN
			}

			return widthN
		}
		else if (widthN > 300) {
			widthN = Math.floor(widthNfts / 5)
			return widthN
		}

		return widthN
	}

	renderYourEquip(width, isMobile) {
		const { equipment, itemsToShow } = this.state

        const ringsToShow = itemsToShow.length > 0 ? itemsToShow : equipment

		const widthSide = 180
		const widthNfts = isMobile ? width : width - widthSide
		let nftWidth = this.calcWidthOfNft(widthNfts) - 36;

		return (
			<div style={{ width }}>

				{
					equipment.length > 0 && !isMobile &&
					<div style={{ width: widthSide, flexDirection: 'column' }}>
						{this.renderBoxSearchEquip("Type", ["Pendant", "Ring"])}
						{this.renderBoxSearchEquip("HP", ["Ring of HP +4", "Ring of HP +8", "Ring of HP +12", "Ring of HP +16", "Ring of HP +20", "Ring of Life", "Ring of Last Defense", "Ring of Power"].reverse())}
						{this.renderBoxSearchEquip("Defense", ["Ring of Defense +1", "Ring of Defense +2", "Ring of Defense +3", "Ring of Defense +4", "Ring of Defense +5", "Ring of Magic Shield", "Ring of Last Defense", "Ring of Power"].reverse())}
						{this.renderBoxSearchEquip("Attack", ["Ring of Attack +1", "Ring of Attack +2", "Ring of Attack +3", "Ring of Attack +4", "Ring of Attack +5", "Ring of Accuracy", "Ring of Destruction", "Ring of Swift Death", "Ring of Power"].reverse())}
						{this.renderBoxSearchEquip("Damage", ["Ring of Damage +2", "Ring of Damage +4", "Ring of Damage +6", "Ring of Damage +8", "Ring of Damage +10", "Ring of Force", "Ring of Destruction", "Ring of Power"].reverse())}
						{this.renderBoxSearchEquip("Speed", ["Ring of Speed +2", "Ring of Speed +4", "Ring of Speed +6", "Ring of Speed +8", "Ring of Speed +10", "Ring of Lightning", "Ring of Swift Death", "Ring of Power"].reverse())}
						{this.renderBoxSearchEquip("Element resistance", ["Acid Resistance", "Dark Resistance", "Earth Resistance","Fire Resistance", "Ice Resistance", "Psycho Resistance", "Spirit Resistance", "Sun Resistance", "Thunder Resistance", "Undead Resistance", "Water Resistance", "Wind Resistance"])}
						{this.renderBoxSearchEquip("Perk resistance", ["Blind Resistance", "Confuse Resistance", "Fear 2 Resistance", "Freeze Resistance", "Paralyze 2 Resistance", "Poison 3 Resistance", "Shock Resistance"])}
					</div>
				}

				{/*
					!loading &&
					<p style={{ fontSize: 15, color: '#c2c0c0', marginBottom: 15 }}>
						Items {ringsToShow.length}
					</p>
				*/}

				<div style={{ flexWrap: 'wrap', width: widthNfts, justifyContent: isMobile ? 'center': 'flex-start' }}>
					{ringsToShow.map((item, index) => {
						return (
				            <EquipmentCard
				                key={index}
				                item={item}
				                index={index}
				                history={this.props.history}
								nftWidth={nftWidth}
				            />
				        )
					})}
				</div>
			</div>
		)
	}


	renderOffers(width, offers, isMade, isMobile) {
		const { kadenaPrice } = this.state

		return (
			<div style={{ flexDirection: 'column', width }}>
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
							onDeclineOffer={() => this.declineOffer(item)}
						/>
					)
				})}
			</div>
		)
	}

	renderEquipmentOffersMade(width, isMobile) {
		const { offersEquipmentMade } = this.state

		return (
			<div style={{ flexDirection: 'row', flexWrap: 'wrap', width }}>
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
		const { userMintedNfts, mainTextColor, isDarkmode } = this.props

		let textColor = isDarkmode ? "#1d1d1f" : "white"

		return (
			<div style={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', borderColor: '#d7d7d7', borderStyle: 'solid', borderRadius: 4, borderWidth: 1, padding: 6, marginBottom: 30, marginTop: 20 }}>

				<button
					style={Object.assign({}, styles.btnMenu, { backgroundColor: section === 1 ? mainTextColor : 'transparent' })}
					onClick={() => {
						if (this.state.section !== 1) {
							this.setState({ section: 1 })
						}
					}}
				>
					<p style={{ fontSize: 14, color: section === 1 ? textColor : mainTextColor }} className="text-medium">
						Collection {userMintedNfts ? `(${userMintedNfts.length})` : ""}
					</p>
				</button>

				<button
					style={Object.assign({}, styles.btnMenu, { backgroundColor: section === 5 ? mainTextColor : 'transparent' })}
					onClick={() => {
						if (loading) {
							return
						}

						this.setState({ section: 5, loading: true })
						this.loadEquip()
					}}
				>
					<p style={{ fontSize: 14, color: section === 5 ? textColor : mainTextColor }} className="text-medium">
						Equipment {equipment && equipment.length > 0 ? `(${equipment.length})` : ""}
					</p>
				</button>

				<button
					style={Object.assign({}, styles.btnMenu, { backgroundColor: section === 3 ? mainTextColor : 'transparent' })}
					onClick={() => {
						if (loading || !userMintedNfts) {
							return
						}

						this.setState({ section: 3, loading: true })
						this.loadOffersMade()
					}}
				>
					<p style={{ fontSize: 14, color: section === 3 ? textColor : mainTextColor }} className="text-medium">
						{offersMade && offersMade.length + offersEquipmentMade.length > 0 ? `Offers made (${offersMade.length + offersEquipmentMade.length})` : "Offers made"}
					</p>
				</button>

				<button
					style={Object.assign({}, styles.btnMenu, { backgroundColor: section === 4 ? mainTextColor : 'transparent' })}
					onClick={() => {
						if (loading || !userMintedNfts) {
							return
						}

						this.setState({ section: 4, loading: true })
						this.loadOffersReceived()
					}}
				>
					<p style={{ fontSize: 14, color: section === 4 ? textColor : mainTextColor }} className="text-medium">
						{offersReceived && offersReceived.length > 0 ? `Offers received (${offersReceived.length})` : "Offers received"}
					</p>
				</button>

			</div>
		)
	}

	renderBody(isMobile) {
		const { account, wizaBalance, walletXp, mainTextColor } = this.props
		const { showModalConnection, isConnected, section, loading, unclaimedWizaTotal, offersMade, offersReceived, offersEquipmentMade } = this.state

		const { boxW, modalW, padding } = getBoxWidth(isMobile)

		let unclW = 0;
		if (unclaimedWizaTotal) {
			unclW = _.floor(unclaimedWizaTotal, 4)
		}

		if (!account || !account.account || !isConnected) {

			return (
				<div style={{ flexDirection: 'column', width: boxW, padding, overflowY: 'auto', overflowX: 'hidden', alignItems: 'center' }}>

					<img
						src={getImageUrl(undefined)}
						style={{ width: 300, height: 300, borderRadius: 2, marginBottom: 30 }}
						alt='Placeholder'
					/>

					<p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', width: 300, marginBottom: 30, lineHeight: 1.2 }}>
						Connect your wallet and enter the Arena
					</p>

					<button
						className='btnH'
						style={styles.btnConnect}
						onClick={() => this.setState({ showModalConnection: true })}
					>
						<p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
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

		let boxStatsW = isMobile ? boxW - 40 : boxW * 50 / 100

		return (
			<div style={{ flexDirection: 'column', alignItems: 'center', width: boxW, marginTop: 5, paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 20, overflowY: 'auto', overflowX: 'hidden' }}>

				<div style={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'space-around', marginBottom: 10, width: boxStatsW }}>

					<a
						className="btnH"
						style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
						href={`${window.location.protocol}//${window.location.host}/walletsxp`}
						onClick={(e) => {
							e.preventDefault()
							this.props.history.push(`/walletsxp`)
						}}
					>
						<p style={{ fontSize: 16, color: "#707070" }}>
							Wizard Xp
						</p>
						<p style={{ fontSize: 16, color: mainTextColor }} className="text-bold">
							{walletXp || 0.0}
						</p>
					</a>

					<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
						<p style={{ fontSize: 16, color: "#707070" }}>
							$WIZA balance
						</p>
						<p style={{ fontSize: 16, color: mainTextColor }} className="text-bold">
							{wizaBalance || 0.0}
						</p>
					</div>

					<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
						<p style={{ fontSize: 16, color: "#707070" }}>
							Unclaimed $WIZA
						</p>
						<p style={{ fontSize: 16, color: mainTextColor }} className="text-bold">
							{unclW || 0.0}
						</p>
					</div>

				</div>

				{this.renderMenu(isMobile)}

				{/*<div style={{ minHeight: 1, height: 1, backgroundColor: '#d7d7d7', width: boxW, marginBottom: 20 }} />*/}

				{
					section === 1 &&
					<div style={{ alignItems: 'center', flexWrap: 'wrap', marginBottom: 20, justifyContent: 'center' }}>
						<button
							className="btnH"
							style={styles.btnClaimAll}
							onClick={() => this.claimAll()}
						>
							<p style={{ fontSize: 14, color: "white" }} className="text-bold">
								Claim all
							</p>
						</button>

						<button
							className="btnH"
							style={styles.btnClaimAll}
							onClick={() => this.unstakeAndClaimAll()}
						>
							<p style={{ fontSize: 14, color: "white" }} className="text-bold">
								Claim all & Unstake
							</p>
						</button>

						<button
							className="btnH"
							style={styles.btnClaimAll}
							onClick={() => this.stakeAll()}
						>
							<p style={{ fontSize: 14, color: "white" }} className="text-bold">
								Stake all
							</p>
						</button>
					</div>
				}

				{
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

				{
					section === 1 ?
					this.renderYourWizards(boxW, isMobile)
					:
					null
				}

				{
					section === 5 ?
					this.renderYourEquip(boxW, isMobile)
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

			</div>
		)
	}

	renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
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
	btnConnect: {
		width: 300,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderWidth: 1,
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
		height: 32,
		borderRadius: 4,
		display: 'flex',
		width: 125,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnClaimAll: {
		width: 150,
		height: 36,
		backgroundColor: CTA_COLOR,
		borderRadius: 4,
		marginRight: 12,
		borderStyle: 'solid',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10
	},
	btnStat: {
		padding: 9,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		marginRight: 15,
		borderRadius: 4,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderWidth: 1,
		minWidth: 60,
		display: 'flex',
		flexDirection: 'row'
	},
}

const mapStateToProps = (state) => {
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, wizaBalance, walletXp, filtriProfileRanges, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, wizaBalance, walletXp, filtriProfileRanges, mainTextColor, mainBackgroundColor, isDarkmode };
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
	updateInfoTransactionModal,
	declineOffer,
	getWalletXp
})(Profile)
