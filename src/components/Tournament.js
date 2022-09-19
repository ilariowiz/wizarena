import React, { Component } from 'react'
import Media from 'react-media';
import { connect } from 'react-redux'
import moment from 'moment'
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import DotLoader from 'react-spinners/DotLoader';
import NftCard from './common/NftCard'
import Header from './Header'
import getBoxWidth from './common/GetBoxW'
import convertMedalName from './common/ConvertMedalName'
import { TEST_NET_ID, BACKGROUND_COLOR, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import {
    getMontepremi,
    getBuyin,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getReveal
} from '../actions'
import '../css/Nft.css'


class Tournament extends Component {
    constructor(props) {
		super(props)

		this.state = {
            tournament: {},
			winners: [],
            loading: true
		}
	}

    componentDidMount() {
		document.title = "Tournament - Wizards Arena"

        this.props.setNetworkSettings(TEST_NET_ID, "1")
		this.props.setNetworkUrl(TEST_NET_ID, "1")

        setTimeout(() => {
            this.loadTournament()

            if (parseInt(this.props.reveal) < 1) {
				this.getRevealNfts()
			}
        }, 500)
	}

    getRevealNfts() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.props.getReveal(chainId, gasPrice, gasLimit, networkUrl)
	}

    async loadTournament() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        const querySnapshot = await getDocs(collection(firebasedb, "stage"))

        querySnapshot.forEach(doc => {
            console.log(doc.data());
			const tournament = doc.data()
            this.setState({ tournament }, async () => {

                this.props.getMontepremi(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getFeeTournament(chainId, gasPrice, gasLimit, networkUrl)


                const roundEnded = tournament.roundEnded
                const tournamentName = tournament.name.split("_")[0]

                const w1 = `stats.medals.${tournamentName}`
                const q = query(collection(firebasedb, "stats"), where(w1, "==", parseInt(roundEnded)))

                const qSnap2 = await getDocs(q)

                const winners = []

                qSnap2.forEach(doc2 => {
                    //console.log(doc2.data());
                    let dataWinners = doc2.data()
                    dataWinners['id'] = dataWinners.name.replace("#", "")

                    winners.push(dataWinners)
                })

                this.setState({ winners, loading: false })
            })
        })
    }

    renderRow(item, index) {
        //per ogni row creiamo un array di GameCard
		return (
            <div style={{ marginBottom: 15 }} key={index}>
                <NftCard
                    item={item}
                    key={index}
                    history={this.props.history}
                    width={260}
                />
            </div>
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

    renderBody(isMobile) {
        const { tournament, winners, error } = this.state
        const { buyin, montepremi, reveal } = this.props

        const { boxW } = getBoxWidth(isMobile)

        if (parseInt(reveal) === 0) {
			return (
				<div style={{ width: boxW, flexDirection: 'column' }}>
					<p style={{ fontSize: 18, color: 'white' }}>
						The Tournament page will be available after the reveal
					</p>
				</div>
			)
		}

        if (!tournament.name) {
            return <div> </div>
        }

        const tournamentName = tournament.name.split("_")[0]
        const roundName = tournament.name.split("_")[1]
        const roundEnded = tournament.roundEnded

        //LE ISCRIZIONI SONO APERTE
		if (tournament && tournament.canSubscribe) {
			return (
				<div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>

					<div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 30 }}>

						<div style={{ flexDirection: 'column', width: '100%' }}>
							<p style={{ fontSize: 18, color: 'white', marginBottom: 20 }}>
								Registration for the tournament is still open
							</p>

							<p style={{ fontSize: 17, color: 'white', marginBottom: 20 }}>
								BUY-IN {buyin || '...'} KDA
							</p>
						</div>

						{this.renderInfoTournament(boxW)}
					</div>


					<button
                        className='btnH'
                        style={styles.btnSubscribe}
                        onClick={() => this.props.history.replace('/me')}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            Subscribe your wizards
                        </p>
                    </button>
				</div>
			)
		}

        //SE SIAMO IN ATTESA DEL PRIMO FIGHT
		if (tournament && !tournament.canSubscribe && !tournament.tournamentEnd && tournament.roundEnded === "0") {

			const roundValue = roundName.replace("r", "")

			const start = moment(tournament.start.seconds * 1000) //milliseconds
			let text;
			if (moment().isBefore(start)) {
				text = `The round ${roundValue} will start ${start.fromNow()}`
			}
			else {
				text = `The tournament started ${start.fromNow()}`
			}

			return (
				<div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>
					<div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 30 }}>

						<div style={{ flexDirection: 'column', width: '100%' }}>
							<p style={{ fontSize: 18, color: 'white', marginBottom: 20 }}>
								Registration for the tournament is closed!
							</p>

							<p style={{ fontSize: 18, color: 'white' }}>
								{text}
							</p>
						</div>

						{this.renderInfoTournament(boxW)}
					</div>
				</div>
			)
		}

        let subtitleText = winners.length > 1 ?  `The ${winners.length} winners of ${roundEnded} medals:` : `The winner of ${roundEnded} medals:`

        let titleText = tournament.tournamentEnd ?
                        "The tournament is over! Let's see who the winners are"
                        :
                        `Partial results of this tournament (round ${roundEnded}/${tournament.nRounds} concluded)`

        return (
            <div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>

                <div style={{ justifyContent: 'space-between', marginBottom: 30 }}>
                    <div style={{ flexDirection: 'column', width: '100%' }}>
                        <p style={{ fontSize: 20, color: 'white', marginBottom: 15 }}>
                            {titleText}
                        </p>
                    </div>

                    {this.renderInfoTournament(boxW)}

                </div>

                <p style={{ fontSize: 20, color: 'white', marginBottom: 15 }}>
                    {subtitleText}
                </p>

                <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                    {winners.map((item, index) => {
                        return this.renderRow(item, index);
                    })}
                </div>

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={4}
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

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

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
    btnSubscribe: {
        width: 250,
		height: 50,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
	},
}

const mapStateToProps = (state) => {
	const { chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, reveal, montepremi, buyin, feeTournament } = state.mainReducer;

	return { chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, reveal, montepremi, buyin, feeTournament };
}

export default connect(mapStateToProps, {
    getBuyin,
    getMontepremi,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getReveal
})(Tournament)
