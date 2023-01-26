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
import NftCardStake from './common/NftCardStake'
import NftCardChoice from './common/NftCardChoice'
import EquipmentCard from './common/EquipmentCard'
import ModalTransaction from './common/ModalTransaction'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import convertMedalName from './common/ConvertMedalName'
import {
	loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getMontepremi,
	getBuyin,
	checkAddressForPrice,
	withdrawPrize,
	getFeeTournament,
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
	subscribeToTournamentMass,
	loadEquipMinted
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
			tournament: {},
			error: '',
			nameNftSubscribed: '',
			profileFights: [],
			prize: undefined,
			unclaimedWizaTotal: 0,
			stakedIds: [],
			notStakedIds: [],
			offersMade: [],
			offersReceived: [],
			offerInfoRecap: "",
			kadenaPrice: undefined,
			saleValues: {},
			toSubscribe: [],
			equipment: []
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
	}

	loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
				this.setState({ loading: false })
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

	async loadTournament() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		//console.log(account)
		const querySnapshot = await getDocs(collection(firebasedb, "stage"))

		querySnapshot.forEach(doc => {
			//console.log(doc.data());
			const tournament = doc.data()
			this.setState({ tournament }, () => {

				if (!tournament.canSubscribe) {
					//round è finito ma torneo no
					if (!tournament.tournamentEnd) {

						this.loadProfileFights()
					}
				}

				this.props.getMontepremi(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getFeeTournament(chainId, gasPrice, gasLimit, networkUrl)

				this.setState({ loading: false })
			})
		})
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

	loadProfileFights() {
		const { userMintedNfts } = this.props
		const { tournament } = this.state

		const tournamentName = tournament.name.split("_")[0]
		//console.log(tournamentName);

		let profileFights = []

		for (let i = 0; i < userMintedNfts.length; i++) {
			const s = userMintedNfts[i]
			//console.log(s);
			const fights = s.fights

			//console.log(fights);

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
		this.setState({ profileFights })
	}

	subscribe(idNft, spellSelected) {
		const { account, buyin, feeTournament } = this.props
		const { tournament } = this.state

		if (!buyin || !feeTournament  || !spellSelected || !spellSelected.name) {
			return
		}

		let refactorSpellSelected = { name: spellSelected.name }

		const tNumber = tournament.name.split("_")[0]

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

	subscribeMass() {
		const { chainId, gasPrice, netId, account, buyin } = this.props
		const { toSubscribe } = this.state

		const tot = toSubscribe.length * buyin

		this.setState({ nameNftSubscribed: `You will subscribe ${toSubscribe.length} wizards for ${tot} KDA`, typeModal: "subscriptionmass" })

		this.props.subscribeToTournamentMass(chainId, gasPrice, 6000, netId, account, buyin, toSubscribe)
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


	withdrawPrize() {
		const { chainId, gasPrice, netId, account } = this.props

		this.setState({ typeModal: "withdraw" })

		this.props.withdrawPrize(chainId, gasPrice, 4000, netId, account)
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
			this.props.acceptOffer(chainId, gasPrice, 4000, netId, offer.id, offer.refnft, account)
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

	renderSingleFight(item, index) {
		const { userMintedNfts } = this.props

		const itemInfo = userMintedNfts.find(i => i.name === item.name)

		const isWinner = item.winner === itemInfo.id

		const roundValue = item.tournament[item.tournament.length - 1]

		return (
			<button
				style={styles.boxSingleFight}
				key={index}
				className='btnH'
				onClick={() => this.props.history.push(`/fight/${item.fightId}`)}
			>
				<img
					src={getImageUrl(itemInfo.id)}
					style={{ width: 140, height: 140, borderRadius: 2, marginRight: 15 }}
					alt={itemInfo.name}
				/>

				<div style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
					<p style={{ color: 'white', fontSize: 18 }}>
						{item.name}
					</p>

					<p style={{ color: 'white', fontSize: 17 }}>
						ROUND {roundValue}
					</p>

					<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 22 }}>
						{isWinner ? "WINNER" : "LOSER"}
					</p>
				</div>
			</button>
		)
	}

	renderTournament(width, modalWidth) {
		const { userMintedNfts, buyin } = this.props
		const { tournament, error, profileFights, prize } = this.state

		const tournamentName = tournament.name.split("_")[0]
		const round = tournament.name.split("_")[1]


		if (userMintedNfts.length === 0) {
			return (
				<div style={{ width, flexDirection: 'column' }}>
					<p style={{ fontSize: 20, color: 'white', marginBottom: 20 }}>
						You must have a Wizard to participate in the tournament
					</p>

					{this.renderInfoTournament(width)}
				</div>
			)
		}



		//LE ISCRIZIONI SONO APERTE
		if (tournament && tournament.canSubscribe) {

			const dateStart = moment(tournament.start.seconds * 1000)
            //console.log(dateStart);

            const dateStartString = moment(dateStart).format("dddd, MMMM Do YYYY, h:mm:ss a");
            const dateStartTo = moment().to(dateStart)

			return (
				<div style={{ width, flexDirection: 'column' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 30 }}>

						<div style={{ flexDirection: 'column', width: '100%' }}>
							<p style={{ fontSize: 18, color: 'white', marginBottom: 20 }}>
								Registration for the tournament is open. The tournament will start:
							</p>

							<p style={{ fontSize: 19, color: 'white', marginBottom: 5 }}>
								{dateStartTo}
							</p>
                            <p style={{ fontSize: 16, color: 'white', marginBottom: 20 }}>
								{dateStartString}
							</p>

							<p style={{ fontSize: 17, color: 'white', marginBottom: 20 }}>
								BUY-IN {buyin || '...'} KDA
							</p>
						</div>

						{this.renderInfoTournament(width)}
					</div>


					<div style={{ flexDirection: 'column', width: '100%' }}>
						<div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
							{userMintedNfts.map((item, index) => this.renderRowChoise(item, index, modalWidth))}
						</div>
					</div>
				</div>
			)
		}

		//SE SIAMO IN ATTESA DEL PRIMO FIGHT
		if (tournament && !tournament.canSubscribe && !tournament.tournamentEnd && tournament.roundEnded === "0") {

			const roundValue = round.replace("r", "")

			const start = moment(tournament.start.seconds * 1000) //milliseconds
			let text;
			if (moment().isBefore(start)) {
				text = `The round ${roundValue} will start ${start.fromNow()}`
			}
			else {
				text = `The tournament started ${start.fromNow()}`
			}

			return (
				<div style={{ width, flexDirection: 'column' }}>
					<div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 30 }}>

						<div style={{ flexDirection: 'column', width: '100%' }}>
							<p style={{ fontSize: 18, color: 'white', marginBottom: 20 }}>
								Registration for the tournament is closed!
							</p>

							<p style={{ fontSize: 18, color: 'white' }}>
								{text}
							</p>
						</div>

						{this.renderInfoTournament(width)}
					</div>

					<div style={{ flexDirection: 'column', width: '100%' }}>

						<div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
							{userMintedNfts.map((item, index) => this.renderRowChoise(item, index, modalWidth))}
						</div>

						<p style={{ fontSize: 15, color: 'red', marginTop: 10 }}>
							{error}
						</p>
					</div>
				</div>
			)
		}


		// SE IL PRIMO FIGHT è STATO FATTO
		if (tournament && !tournament.canSubscribe && !tournament.tournamentEnd && parseInt(tournament.roundEnded) > 0) {

			const roundValue = round.replace("r", "")

			const start = moment(tournament.start.seconds * 1000) //milliseconds
			let text;
			if (moment().isBefore(start)) {
				text = `The round ${roundValue} will start ${start.fromNow()}`
			}
			else {
				text = `The tournament started ${start.fromNow()}`
			}

			return (
				<div style={{ width, flexDirection: 'column' }}>
					<div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 30 }}>

						<div style={{ flexDirection: 'column', width: '100%' }}>
							<p style={{ fontSize: 19, color: 'white', marginBottom: 20 }}>
								The round {tournament.roundEnded} is over!
							</p>

							<p style={{ fontSize: 18, color: 'white' }}>
								{text}
							</p>
						</div>

						{this.renderInfoTournament(width)}
					</div>

					<div style={{ flexDirection: 'column', width: '100%' }}>

						<div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
							{profileFights.length > 0 && profileFights.map((item, index) => this.renderSingleFight(item, index))}
						</div>

						<p style={{ fontSize: 15, color: 'red', marginTop: 10 }}>
							{error}
						</p>
					</div>
				</div>
			)
		}

		// SE IL TORNEO è finito
		if (tournament && tournament.tournamentEnd) {

			return (
				<div style={{ width }}>

					<div style={{ flexDirection: 'column', width: '100%' }}>
						<p style={{ fontSize: 19, color: 'white', marginBottom: 30 }}>
							Tournament {tournamentName.replace("t", "")} is over! Congratulations to all participants!
						</p>

						{
							prize ?
							<div style={{ flexDirection: 'column' }}>
								<p style={{ fontSize: 20, color: 'white', marginBottom: 20 }}>
									You are one of the winners!
								</p>
								<p style={{ fontSize: 20, color: 'white', marginBottom: 20 }}>
									The Archmage is sending you the prize...
								</p>

								<button
									className="btnH"
									style={styles.btnWithdraw}
									onClick={() => this.withdrawPrize()}
								>
									<p style={{ fontSize: 17, color: 'white' }}>
										WITHDRAW PRIZE: {prize} KDA
									</p>
								</button>
							</div>
							:
							<p style={{ fontSize: 18, color: 'white' }}>
								Wait for the next tournament to start
							</p>
						}


					</div>

					{this.renderInfoTournament(width)}
				</div>
			)
		}
	}

	renderRowChoise(item, index, modalWidth) {
		const { tournament, toSubscribe } = this.state

		return (
			<NftCardChoice
				key={index}
				item={item}
				width={230}
				tournament={tournament.name.split("_")[0]}
				canSubscribe={tournament.canSubscribe}
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
			/>
		)
	}

	renderInfoTournament(width) {
		const { tournament } = this.state
		const { montepremi } = this.props

		//const iscritti = Math.floor(montepremi / (buyin / 2))

		const tname = convertMedalName(tournament.name)

		return (
			<div style={{ width, flexDirection: 'column', marginLeft: 15 }}>
				<p style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>
					{tname.torneo.toUpperCase()}
				</p>

				<p style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>
					{tname.round.toUpperCase()}
				</p>

				<p style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>
					NUMBER OF ROUNDS {tournament.nRounds}
				</p>

				<p style={{ fontSize: 18, color: 'white' }}>
					Total Prize {montepremi || '...'} KDA
				</p>
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



	renderMenu(isMobile) {
		const { section, loading, equipment } = this.state;
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
					style={Object.assign({}, styles.btnMenu, selectedStyle2, { marginRight: 35 })}
					onClick={() => {
						if (loading) {
							return
						}

						this.setState({ section: 2, loading: true })
						this.loadTournament()
					}}
				>
					<p style={{ fontSize: isMobile ? 17 : 18, color: section === 2 ? CTA_COLOR : '#21c6e895' }}>
						TOURNAMENT
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
					<p style={{ fontSize: isMobile ? 17 : 18, color: section === 2 ? CTA_COLOR : '#21c6e895' }}>
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
						OFFERS MADE
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
						OFFERS RECEIVED
					</p>
				</button>
			</div>
		)
	}

	renderFooterSubscribe(isMobile) {
		const { toSubscribe } = this.state

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
					onClick={() => this.subscribeMass()}
				>
					<p style={{ fontSize: 17, color: 'white' }}>
						SUBSCRIBE
					</p>
				</button>
			</div>
		)
	}

	renderBody(isMobile) {
		const { account, showModalTx, wizaBalance } = this.props
		const { showModalConnection, isConnected, section, loading, unclaimedWizaTotal, offersMade, offersReceived } = this.state

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

				{
					section === 2 && this.state.toSubscribe.length > 0 &&
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
	boxSingleFight: {
		backgroundColor: '#ffffff15',
		borderRadius: 2,
		alignItems: 'center',
		width: 260,
		height: 170,
		display: 'flex',
		justifyContent: 'flex-start',
		paddingLeft: 15,
		marginRight: 20,
		marginBottom: 20
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
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, montepremi, buyin, feeTournament, wizaBalance } = state.mainReducer;

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, montepremi, buyin, feeTournament, wizaBalance };
}

export default connect(mapStateToProps, {
	loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getMontepremi,
	getBuyin,
	checkAddressForPrice,
	withdrawPrize,
	getFeeTournament,
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
	subscribeToTournamentMass,
	loadEquipMinted
})(Profile)
