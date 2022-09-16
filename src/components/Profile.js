import React, { Component } from "react";
import { connect } from 'react-redux'
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import moment from 'moment'
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import Header from './Header'
import NftCard from './common/NftCard'
import NftCardChoice from './common/NftCardChoice'
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
	getReveal,
	getMontepremi,
	getBuyin,
	subscribeToTournament,
	checkAddressForPrice,
	withdrawPrize,
	getFeeTournament
} from '../actions'
import { TEST_NET_ID, BACKGROUND_COLOR, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import '../css/Nft.css'


class Profile extends Component {
	constructor(props) {
		super(props)

		let isConnected = this.props.account && this.props.account.account

		this.state = {
			kadenaPrice: 0,
			section: 1,
			loading: true,
			showModalConnection: false,
			isConnected,
			typeModal: 'subscription',
			tournament: {},
			nftsStats: [],
			error: '',
			nameNftSubscribed: '',
			profileFights: [],
			prize: undefined
		}
	}

	componentDidMount() {
		document.title = "Me - Wizards Arena"

		this.props.setNetworkSettings(TEST_NET_ID, "1")
		this.props.setNetworkUrl(TEST_NET_ID, "1")

		this.loadKadenaPrice()

		setTimeout(() => {
			this.loadProfile()

			if (parseInt(this.props.reveal) < 1) {
				this.getRevealNfts()
			}
		}, 500)
	}

	loadProfile() {
		this.loadMinted()
	}

	loadKadenaPrice() {
		fetch('https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=usd')
  		.then(response => response.json())
  		.then(data => {
  			//console.log(data)
  			this.setState({ kadenaPrice: data.kadena.usd })
  		});
	}

	loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		//console.log(account, chainId, gasPrice, gasLimit, networkUrl)

		this.setState({ loading: true })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
				this.setState({ loading: false })

				if (this.props.userMintedNfts.length > 0) {
					this.props.userMintedNfts.map(i => this.loadStats(i.name))
				}

			})
		}
	}

	async loadStats(nameNft) {
		const docRef = doc(firebasedb, "stats", nameNft)

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

		if (data) {
			//console.log(data)
			let stats = Object.assign([], this.state.nftsStats)
			stats.push(data)
			this.setState({ nftsStats: stats })
		}
		else {
			console.log('no stats');
		}
	}

	async loadTournament() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		//console.log(account)
		const querySnapshot = await getDocs(collection(firebasedb, "stage"))

		querySnapshot.forEach(doc => {
			console.log(doc.data());
			const tournament = doc.data()
			this.setState({ tournament }, () => {

				if (!tournament.canSubscribe) {
					if (tournament.roundEnd) {
						this.loadProfileFights()
					}
					else if (tournament.tournamentEnd) {
						this.loadAddressForPrize()
					}
				}

				this.props.getMontepremi(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getFeeTournament(chainId, gasPrice, gasLimit, networkUrl)

				this.setState({ loading: false })

				/*
				this.props.getMontepremi(chainId, gasPrice, gasLimit, networkUrl, (response) => {
					this.setState({ montepremi: response }, () => {
						this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl, (response) => {
							this.setState({ buyin: response, loading: false })
						})
					})
				})
				*/

			})
		})
	}

	loadProfileFights() {
		const { nftsStats, tournament } = this.state

		//console.log(nftsStats)

		let profileFights = []

		for (let i = 0; i < nftsStats.length; i++) {
			const s = nftsStats[i]
			console.log(s);
			const fights = s.stats.fights

			if (fights.length > 0) {
				let singleFight = fights.find(i => i.tournament === tournament.name)
				if (singleFight) {
					singleFight['name'] = s.name
					profileFights.push(singleFight)
				}
			}
		}

		//console.log(profileFights);
		this.setState({ profileFights })
	}

	loadAddressForPrize() {
		const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

		this.props.checkAddressForPrice(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
			//console.log(response);
			if (response && !response.error) {
				if (response > 0) {
					this.setState({ prize: response })
				}
				else {
					this.setState({ prize: undefined })
				}
			}
			else {
				this.setState({ prize: undefined })
			}
		})
	}

	getRevealNfts() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getReveal(chainId, gasPrice, gasLimit, networkUrl)
	}

	subscribe(idNft) {
		const { chainId, gasPrice, netId, account, buyin } = this.props
		const { tournament } = this.state

		if (!buyin) {
			return
		}

		const tNumber = tournament.name.split("_")[0]

		this.setState({ nameNftSubscribed: `#${idNft}`, typeModal: "subscription" })

		this.props.subscribeToTournament(
			chainId,
			gasPrice,
			6000,
			netId,
			account,
			tNumber,
			idNft,
			buyin
		)
	}

	withdrawPrize() {
		const { chainId, gasPrice, netId, account } = this.props

		this.setState({ typeModal: "withdraw" })

		this.props.withdrawPrize(chainId, gasPrice, 4000, netId, account)
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

		itemsPerRow.map(item => {
			//console.log(item);
			array.push(
				<NftCard
					item={item}
					key={item.id}
					history={this.props.history}
					width={singleWidth}
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

	renderSingleFight(item, index) {
		const { userMintedNfts } = this.props

		console.log(userMintedNfts, item);

		const itemInfo = userMintedNfts.find(i => i.name === item.name)

		const isWinner = item.winner === itemInfo.id

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

					<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 22 }}>
						{isWinner ? "WINNER" : "LOSER"}
					</p>
				</div>
			</button>
		)
	}

	renderTournament(width) {
		const { userMintedNfts, buyin, reveal } = this.props
		const { tournament, error, profileFights, prize } = this.state

		//console.log(userMintedNfts, tournament, width)

		if (parseInt(reveal) === 0) {
			return (
				<div style={{ width, flexDirection: 'column' }}>
					<p style={{ fontSize: 18, color: 'white' }}>
						The Tournament page will be available after the reveal
					</p>
				</div>
			)
		}

		if (userMintedNfts.length === 0) {
			return (
				<div style={{ width, flexDirection: 'column' }}>
					<p style={{ fontSize: 18, color: 'white', marginBottom: 20 }}>
						You must first buy a Wizard to participate in the tournament
					</p>

					{this.renderInfoTournament(width)}
				</div>
			)
		}

		if (tournament && !tournament.canSubscribe && tournament.roundEnd) {

			const round = tournament.name.split("_")[1]

			return (
				<div style={{ width }}>

					<div style={{ flexDirection: 'column', width: '100%' }}>
						<p style={{ fontSize: 22, color: 'white', marginBottom: 30 }}>
							The round {round.replace("r", "")} is over!
						</p>

						<div style={{ flexDirection: 'column' }}>
							{profileFights.length > 0 && profileFights.map((item, index) => this.renderSingleFight(item, index))}
						</div>
					</div>

					{this.renderInfoTournament(width)}
				</div>
			)
		}

		if (tournament && tournament.tournamentEnd) {
			const tournamentName = tournament.name.split("_")[0]

			return (
				<div style={{ width }}>

					<div style={{ flexDirection: 'column', width: '100%' }}>
						<p style={{ fontSize: 22, color: 'white', marginBottom: 30 }}>
							Tournament {tournamentName.replace("t", "")} is over! Congratulations to all participants!
						</p>

						{
							prize ?
							<div style={{ flexDirection: 'column' }}>
								<p style={{ fontSize: 21, color: 'white', marginBottom: 20 }}>
									You are one of the winners! Collect your prize:
								</p>

								<button
									className="btnH"
									style={styles.btnWithdraw}
									onClick={() => this.withdrawPrize()}
								>
									<p style={{ fontSize: 17, color: 'white' }}>
										WITHDRAWS {prize} KDA
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

		if (tournament && !tournament.canSubscribe) {
			const start = moment(tournament.start.seconds * 1000) //milliseconds
			let text;
			if (moment().isBefore(start)) {
				text = `The tournament will start ${start.fromNow()}`
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
							{userMintedNfts.map((item, index) => this.renderRowChoise(item, index))}
						</div>

						<p style={{ fontSize: 15, color: 'red', marginTop: 10 }}>
							{error}
						</p>
					</div>
				</div>
			)
		}

		//LE ISCRIZIONI SONO APERTE
		if (tournament && tournament.canSubscribe) {
			return (
				<div style={{ width, flexDirection: 'column' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 30 }}>

						<div style={{ flexDirection: 'column', width: '100%' }}>
							<p style={{ fontSize: 18, color: 'white', marginBottom: 20 }}>
								Registration for the tournament is still open
							</p>

							<p style={{ fontSize: 17, color: 'white', marginBottom: 20 }}>
								BUY-IN {buyin || '...'} KDA
							</p>
						</div>

						{this.renderInfoTournament(width)}
					</div>


					<div style={{ flexDirection: 'column', width: '100%' }}>
						<div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
							{userMintedNfts.map((item, index) => this.renderRowChoise(item, index))}
						</div>
					</div>
				</div>
			)
		}
	}

	renderRowChoise(item, index) {
		const { nftsStats, tournament } = this.state

		const stats = nftsStats.find(i => i.name === item.name)

		return (
			<NftCardChoice
				key={index}
				item={item}
				stats={stats}
				width={230}
				tournament={tournament.name.split("_")[0]}
				canSubscribe={tournament.canSubscribe}
				onSubscribe={() => this.subscribe(item.id)}
			/>
		)
	}

	renderInfoTournament(width) {
		const { tournament } = this.state
		const { montepremi } = this.props

		//const iscritti = Math.floor(montepremi / (buyin / 2))

		const tname = convertMedalName(tournament.name)

		return (
			<div style={{ width, flexDirection: 'column' }}>
				<p style={{ fontSize: 16, color: 'white', marginBottom: 15 }}>
					{tname.torneo.toUpperCase()}
				</p>

				<p style={{ fontSize: 16, color: 'white', marginBottom: 15 }}>
					{tname.round.toUpperCase()}
				</p>

				{/*
			 	<p style={{ fontSize: 16, color: 'white', marginBottom: 15 }}>
			 		Participant {iscritti}
				</p>
				*/}

				<p style={{ fontSize: 16, color: 'white' }}>
					Total Prize {montepremi || '...'} KDA
				</p>
			</div>
		)
	}

	renderMenu(isMobile) {
		const { section, loading } = this.state;

		const selStyle = { borderBottomWidth: 3, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderColor: CTA_COLOR, borderStyle: 'solid' }
		const unselStyle = { borderBottomWidth: 3, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderColor: 'transparent', borderStyle: 'solid' }
		const selectedStyle1 = section === 1 ? selStyle : unselStyle
		const selectedStyle2 = section === 2 ? selStyle : unselStyle
		const selectedStyle3 = section === 3 ? selStyle : unselStyle

		return (
			<div style={{ width: '100%', alignItems: 'center', marginBottom: 30 }}>
				<button
					style={Object.assign({}, styles.btnMenu, selectedStyle1, { marginRight: 35 })}
					onClick={() => this.setState({ section: 1 })}
				>
					<p style={{ fontSize: isMobile ? 17 : 18, color: section === 1 ? CTA_COLOR : '#21c6e895' }}>
						YOUR WIZARDS
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
			</div>
		)
	}

	renderBody(isMobile) {
		const { account, showModalTx } = this.props
		const { showModalConnection, isConnected, section, loading } = this.state

		const { boxW, modalW } = getBoxWidth(isMobile)

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
						<p style={{ fontSize: 19, color: TEXT_SECONDARY_COLOR, fontWeight: '500' }}>
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
					this.renderTournament(boxW)
					:
					null
				}

				<ModalTransaction
					showModal={showModalTx}
					width={modalW}
					type={this.state.typeModal}
					mintSuccess={() => {
						this.props.clearTransaction()
						this.loadProfile()
						this.loadTournament()
					}}
					mintFail={() => {
						this.props.clearTransaction()
						this.loadProfile()
						this.loadTournament()
					}}
					nameNft={this.state.nameNftSubscribed}
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
		width: 180,
		height: 45,
		backgroundColor: CTA_COLOR,
		borderRadius: 2,
		justifyContent: 'center',
		alignItems: 'center'
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
		marginBottom: 20,
		width: 260,
		height: 170,
		display: 'flex',
		justifyContent: 'flex-start',
		paddingLeft: 15
	}
}

const mapStateToProps = (state) => {
	const { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, reveal, montepremi, buyin, feeTournament } = state.mainReducer;

	return { userMintedNfts, account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, allNfts, reveal, montepremi, buyin, feeTournament };
}

export default connect(mapStateToProps, {
	loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
	getReveal,
	getMontepremi,
	getBuyin,
	subscribeToTournament,
	checkAddressForPrice,
	withdrawPrize,
	getFeeTournament
})(Profile)
