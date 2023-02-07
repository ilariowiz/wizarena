import React, { Component } from "react";
import { connect } from 'react-redux'
import { collection, getDocs } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import moment from 'moment'
import _ from 'lodash'
import Popup from 'reactjs-popup';
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import OfferItem from './common/OfferItem'
import OfferEquipmentItem from './common/OfferEquipmentItem'
import NftCardStake from './common/NftCardStake'
import EquipmentCard from './common/EquipmentCard'
import ModalTransaction from './common/ModalTransaction'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import CardSingleFightProfile from './common/CardSingleFightProfile'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import convertMedalName from './common/ConvertMedalName'
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
	withdrawEquipmentOffer
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
			typeModal: 'subscription',
			error: '',
			nameNftSubscribed: '',
			unclaimedWizaTotal: 0,
			stakedIds: [],
			notStakedIds: [],
			offersMade: [],
			offersReceived: [],
			offerInfoRecap: "",
			kadenaPrice: undefined,
			saleValues: {},
			equipment: [],
			offersEquipmentMade: []
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
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
				this.setState({ loading: false })
				this.loadOffersReceived()
			})
		}
	}

	loadWizaBalance() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWizaBalance(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
				//this.setState({ loading: false })
			})
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

		this.setState({ nameNftSubscribed: `#${idnft}`, typeModal: "stake" })

		this.props.stakeNft(chainId, gasPrice, 4000, netId, idnft, account)
	}

	unstakeNft(idnft) {
		const { chainId, gasPrice, netId, account } = this.props

		this.setState({ nameNftSubscribed: `#${idnft}`, typeModal: "unstake" })

		this.props.unstakeNft(chainId, gasPrice, 4000, netId, idnft, account)
	}

	claimWizaWithoutUnstake(idnft) {
		const { chainId, gasPrice, netId, account } = this.props

		this.setState({ nameNftSubscribed: `#${idnft}`, typeModal: "claim" })

		this.props.claimWithoutUnstake(chainId, gasPrice, 4000, netId, idnft, account)
	}


	claimAll() {
		const { chainId, gasPrice, netId, account } = this.props
		const { stakedIds } = this.state

		if (stakedIds.length === 0) {
			return
		}

		this.setState({ typeModal: "claimall" })

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

		this.setState({ typeModal: "unstakeandclaimall" })

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

		this.setState({ typeModal: "stakeall" })

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

		this.setState({ typeModal: "burningon", nameNftSubscribed: `#${id}` })

		this.props.addNftToBurningQueue(chainId, gasPrice, netId, id, account)
	}

	removeFromBurning(id) {
		const { chainId, gasPrice, netId, account } = this.props

		this.setState({ typeModal: "burningoff", nameNftSubscribed: `#${id}` })

		this.props.removeNftFromBurningQueue(chainId, gasPrice, netId, id, account)
	}

	delist(id) {
		const { account, chainId, gasPrice, netId } = this.props

		this.setState({ typeModal: 'delist', nameNftSubscribed: `#${id}` }, () => {
			this.props.delistNft(chainId, gasPrice, 700, netId, account, id)
		})
	}

	acceptOffer(offer) {
		const { account, chainId, gasPrice, netId } = this.props

		//console.log(amount, duration);
		let offerInfoRecap = `You are accepting an offer of ${offer.amount} KDA (minus 7% marketplace fee) for #${offer.refnft}`

		let saleValues = { id: offer.refnft, amount: offer.amount }

		this.setState({ typeModal: 'acceptoffer', offerInfoRecap, saleValues }, () => {
			this.props.acceptOffer(chainId, gasPrice, 5000, netId, offer.id, offer.refnft, account)
		})
	}

	withdrawEquipmentOffer(offer) {
		const { account, chainId, gasPrice, netId } = this.props

		this.setState({ typeModal: 'withdrawoffer' }, () => {
			this.props.withdrawEquipmentOffer(chainId, gasPrice, 5000, netId, offer.id, account)
		})
	}

	buildsRow(items, itemsPerRow = 4) {
		return items.reduce((rows, item, index) => {
			//console.log(index);
			//se array row è piena, aggiungiamo una nuova row = [] alla lista
			if (index % itemsPerRow === 0 && index > 0) {
				rows.push([]);
			}

			//prendiamo l'ultima array della lista e aggiungiamo item
			rows[rows.length - 1].push(item);
			return rows;
		}, [[]]);
	}

	renderRow(itemsPerRow, index, nInRow, width) {

		//per ogni row creiamo un array di GameCard
		let array = [];

		let singleWidth = Math.floor((width - (nInRow * 12)) / nInRow)
		if (singleWidth > 320) singleWidth = 320;

		itemsPerRow.map((item, idx) => {
			//console.log(item);
			array.push(
				<NftCardStake
					item={item}
					key={item.id}
					index={idx}
					history={this.props.history}
					width={singleWidth}
					onStake={() => this.stakeNft(item.id)}
					onUnstake={() => this.unstakeNft(item.id)}
					onClaim={() => this.claimWizaWithoutUnstake(item.id)}
					onAddBurning={() => this.addToBurning(item.id)}
					onRemoveBurning={() => this.removeFromBurning(item.id)}
					onDelist={() => this.delist(item.id)}
					onLoadUnclaim={(value) => {
						this.setState({ unclaimedWizaTotal: this.state.unclaimedWizaTotal + parseFloat(value) })
					}}
					onLoadIsStaked={(value) => {
						let oldState = Object.assign([], this.state.stakedIds)
						if (!oldState.includes(value)) {
							oldState.push(value)
							//console.log(oldState);

							this.setState({ stakedIds: oldState })
						}
					}}
					onLoadNotStaked={(value) => {
						let oldState = Object.assign([], this.state.notStakedIds)
						if (!oldState.includes(value)) {
							oldState.push(value)
							//console.log(oldState);

							this.setState({ notStakedIds: oldState })
						}
					}}
				/>
			)
		})

		//passiamo l'array all'interno della row
		return (
			<div style={styles.rowStyle} key={index}>
				{array}
			</div>
		);
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

	renderYourWizards(width) {
		const { userMintedNfts } = this.props

		let nftMinW = 260;
		let nInRow = Math.floor(width / nftMinW)
		let rows = userMintedNfts ? this.buildsRow(userMintedNfts, nInRow) : []

		return (
			<div style={{ width, flexDirection: 'column' }}>
				{
					userMintedNfts && userMintedNfts.length === 0 ?
					this.renderError()
					: null
				}

				{
					userMintedNfts && userMintedNfts.length > 0 ?
					rows.map((itemsPerRow, index) => {
						return this.renderRow(itemsPerRow, index, nInRow, width);
					})
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
							onWithdrawOffer={() => {
								this.setState({ typeModal: 'withdrawoffer' })
							}}
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
		const selectedStyle2 = section === 2 ? selStyle : unselStyle
		const selectedStyle3 = section === 3 ? selStyle : unselStyle
		const selectedStyle4 = section === 4 ? selStyle : unselStyle
		const selectedStyle5 = section === 5 ? selStyle : unselStyle

		return (
			<div style={{ width: '100%', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap' }}>
				<button
					style={Object.assign({}, styles.btnMenu, selectedStyle1, { marginRight: 35 })}
					onClick={() => {
						if (this.state.section !== 1) {
							this.setState({ section: 1, unclaimedWizaTotal: 0 })
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

						this.setState({ section: 3, loading: true, typeModal: "withdrawoffer" })
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
		const { account, showModalTx, wizaBalance } = this.props
		const { showModalConnection, isConnected, section, loading, unclaimedWizaTotal, offersMade, offersReceived, offersEquipmentMade } = this.state

		const { boxW, modalW } = getBoxWidth(isMobile)

		let unclW = 0;
		if (unclaimedWizaTotal) {
			unclW = _.floor(unclaimedWizaTotal, 3)
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

				<ModalTransaction
					showModal={showModalTx}
					width={modalW}
					type={this.state.typeModal}
					mintSuccess={() => {
						this.props.clearTransaction()

						if (this.state.typeModal === "subscription") {
							this.loadTournament()
						}
						else {
							window.location.reload()
						}
					}}
					mintFail={() => {
						this.props.clearTransaction()
						if (this.state.typeModal === "subscription") {
							this.loadTournament()
						}
						else {
							window.location.reload()
						}
					}}
					nameNft={this.state.nameNftSubscribed}
					offerInfoRecap={this.state.offerInfoRecap}
					saleValues={this.state.saleValues}
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
	rowStyle: {
		width: '100%',
		marginBottom: 15
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
}

const mapStateToProps = (state) => {
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, wizaBalance } = state.mainReducer;

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, wizaBalance };
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
	withdrawEquipmentOffer
})(Profile)
